const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

// Get via https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
const MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID;
const API_SECRET = import.meta.env.VITE_API_SECRET;
const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;
const DEBUG = import.meta.env.DEV;

// Duration of inactivity after which a new session is created
const SESSION_EXPIRATION_IN_MIN = 30;

export class Analytics {
  private async getOrCreateClientId(): Promise<string> {
    let { clientId } = await chrome.storage.local.get("clientId");
    if (!clientId) {
      // Generate a unique client ID, the actual value is not relevant
      clientId = self.crypto.randomUUID();
      await chrome.storage.local.set({ clientId });
    }
    return clientId;
  }

  private async getOrCreateSessionId(): Promise<string> {
    let { sessionData } = await chrome.storage.session.get("sessionData");
    const currentTimeInMs = Date.now();

    if (sessionData && sessionData.timestamp) {
      const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
      if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
        sessionData = null;
      } else {
        sessionData.timestamp = currentTimeInMs;
        await chrome.storage.session.set({ sessionData });
      }
    }

    if (!sessionData) {
      sessionData = {
        session_id: currentTimeInMs.toString(),
        timestamp: currentTimeInMs.toString(),
      };
      await chrome.storage.session.set({ sessionData });
    }
    return sessionData.session_id;
  }

  async fireEvent(
    name: string,
    params: Record<string, any> = {}
  ): Promise<void> {
    if (!params.session_id) {
      params.session_id = await this.getOrCreateSessionId();
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
    }

    try {
      const response = await fetch(
        `${
          DEBUG ? GA_DEBUG_ENDPOINT : GA_ENDPOINT
        }?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: await this.getOrCreateClientId(),
            events: [
              {
                name,
                params,
              },
            ],
          }),
        }
      );
      if (!DEBUG) {
        return;
      }
      console.log(await response.text());
    } catch (e) {
      console.error("Google Analytics request failed with an exception", e);
    }
  }

  async firePageViewEvent(
    pageTitle: string,
    pageLocation: string,
    additionalParams: Record<string, any> = {}
  ): Promise<void> {
    return this.fireEvent("page_view", {
      page_title: pageTitle,
      page_location: pageLocation,
      ...additionalParams,
    });
  }

  async fireErrorEvent(
    error: Record<string, any>,
    additionalParams: Record<string, any> = {}
  ): Promise<void> {
    return this.fireEvent("extension_error", {
      ...error,
      ...additionalParams,
    });
  }
}

export default new Analytics();
