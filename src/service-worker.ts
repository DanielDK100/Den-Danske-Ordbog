import { load } from "cheerio";
import Analytics from "./google-analytics";
import SearchResponse from "./interfaces/SearchResponse";
import { EventNames } from "./enums/EventNames";

export class ServiceWorker {
  private websocketUrl: string;
  private ddOrdbogUrl: string;
  private extensionManifest: chrome.runtime.Manifest;

  constructor() {
    this.websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
    this.ddOrdbogUrl = import.meta.env.VITE_DDO_ORDBOG_URL;
    this.extensionManifest = chrome.runtime.getManifest();

    this.createContextMenu();
    this.setupNotificationClickHandler();
    chrome.contextMenus.onClicked.addListener(
      this.handleContextMenuClick.bind(this)
    );
  }

  private async fetchSearchResults(word: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.websocketUrl}?q=${word}`);
      const html = await response.text();
      const $ = load(html);

      const mainElement = $(".ar").first();
      const titleElement = mainElement.find(".head .k").first();
      const title = titleElement.text().replace(/\d+/g, "");

      const searchResponse: SearchResponse = {
        title: title ? title : `Ingen resultater for "${word}"`,
        message: $(".dtrn").text().trim() || "",
        contextMessage: $(".m, .pos").text().trim() || "",
      };

      return searchResponse;
    } catch (error) {
      console.error("Error fetching search results:", error);
      throw error;
    }
  }

  private async handleContextMenuClick(
    info: chrome.contextMenus.OnClickData
  ): Promise<void> {
    if (!info.selectionText) {
      return;
    }
    const searchString = info.selectionText
      .replace(/[.,/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const selectedWords = searchString.split(" ").slice(0, 4);

    for (const word of selectedWords) {
      try {
        const searchResponse = await this.fetchSearchResults(word);
        const { title, message, contextMessage } = searchResponse;
        const { icons } = this.extensionManifest;

        const notificationOptions:
          | chrome.notifications.NotificationOptions
          | any = {
          type: "basic",
          title,
          message,
          contextMessage,
          iconUrl: icons?.["128"],
        };

        Analytics.fireEvent(EventNames.Search, {
          [EventNames.ContextMenu]: title,
        });

        chrome.notifications.create(word, notificationOptions);
      } catch (error) {
        console.error("Error handling context menu click:", error);
      }
    }
  }

  private createContextMenu(): Promise<void> {
    return new Promise<void>((resolve) => {
      chrome.contextMenus.create(
        {
          title: 'Slå "%s" op i ordbogen',
          contexts: ["selection"],
          id: "context-selection",
        },
        resolve
      );
    });
  }

  private setupNotificationClickHandler(): void {
    chrome.notifications.onClicked.addListener((word) => {
      chrome.tabs.create({ url: `${this.ddOrdbogUrl}?query=${word}` }, () => {
        chrome.notifications.clear(word);
      });
      Analytics.fireEvent(EventNames.Search, {
        [EventNames.Click]: word,
      });
    });
  }
}

export default new ServiceWorker();
