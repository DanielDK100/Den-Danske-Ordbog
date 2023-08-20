<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import { load, Element, CheerioAPI } from "cheerio";
import debounce from "lodash.debounce";
import Analytics from "../google-analytics";
import Spinner from "./Spinner.vue";
import SearchProps from "../interfaces/SearchProps";
import { EventNames } from "../enums/EventNames";

const props = defineProps<SearchProps>();
const emit = defineEmits(["search", "click"]);

const webSocketUrl: string = import.meta.env.VITE_WEBSOCKET_URL;
const htmlResponse: Ref<string | null> = ref(null);
const meaningsList: Ref<string[]> = ref([]);
const noMatchList: Ref<string[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

function onSuggestionSelected(selectedSuggestion: string): void {
  emit("search", selectedSuggestion);
}

function onClickedElement(): void {
  emit("click");
}

async function fetchSearchResults(): Promise<void> {
  if (!props.searchString) {
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch(`${webSocketUrl}?q=${props.searchString}`);
    htmlResponse.value = await response.text();

    parseHtmlResponse(htmlResponse.value);
    Analytics.fireEvent(EventNames.Search, {
      [EventNames.Popup]: props.searchString,
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
  } finally {
    isLoading.value = false;
  }
}

function parseHtmlResponse(response: string): void {
  const $ = load(response);

  parseMeaningsList($);
  parseNoMatchList($);
}

function parseMeaningsList($: CheerioAPI): void {
  meaningsList.value = $(".ar")
    .map((_index: number, element: Element) => $(element).html())
    .get();
}

function parseNoMatchList($: CheerioAPI): void {
  noMatchList.value = $(".nomatch")
    .find("li")
    .map((_index: number, element: Element) => $(element).text())
    .get();
}

watch(
  props,
  debounce(() => {
    fetchSearchResults();
  }, 500)
);
</script>
<template>
  <section class="nomatch" v-if="noMatchList.length > 0">
    <h2>Ingen ord matcher søgningen</h2>
    <h3><span class="highlight">Mente du:</span></h3>
    <div>
      <ul>
        <li
          v-for="(suggestion, index) in noMatchList"
          :key="index"
          @click="onSuggestionSelected(suggestion)"
        >
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </section>

  <article @click="onClickedElement" class="fade-in" v-if="!isLoading">
    <section v-for="(meaning, index) in meaningsList" :key="index">
      <div v-html="meaning" class="ar"></div>
    </section>
  </article>
  <Spinner v-else />
</template>
