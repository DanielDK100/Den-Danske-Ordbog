<script setup lang="ts">
import { onMounted, ref, Ref, watch, version } from "vue";
import { load } from "cheerio";
import debounce from "lodash.debounce";
import Analytics from "./google-analytics.js";

// URLs
const webSocketUrl: string = import.meta.env.VITE_WEBSOCKET_URL;
const autocompleteUrl: string = import.meta.env.VITE_AUTOCOMPLETE_URL;

// Data and state
const suggestionsList: Ref<string[]> = ref([]);
const showSuggestions: Ref<boolean> = ref(false);
const searchString: Ref<string> = ref("");
const htmlResponse: Ref<string | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);

onMounted(() => {
  console.info(`Made with %c%s`, "color: #41b783;", `Vue.js ${version}`);
});

function onSuggestionSelected(selectedSuggestion: string): void {
  searchString.value = selectedSuggestion;
  showSuggestions.value = false;
}

async function fetchSearchResults(): Promise<void> {
  if (!searchString.value) {
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch(`${webSocketUrl}?q=${searchString.value}`);
    htmlResponse.value = await response.text();

    Analytics.fireEvent("search", { popup: searchString.value });
  } catch (error) {
    console.error("Error fetching search results:", error);
  } finally {
    isLoading.value = false;
  }
}

async function fetchSuggestions(): Promise<void> {
  try {
    const response = await fetch(
      `${autocompleteUrl}?q=${searchString.value}&size=7`
    );
    const responseBody = await response.text();

    const $ = parseHtmlStringToDocument(responseBody);
    suggestionsList.value = $("li")
      .map((element: Element) => $(element).text())
      .get()
      .filter(
        (suggestion: string) => suggestion && suggestion !== ""
      ) as string[];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

function parseHtmlStringToDocument(body: string): any {
  return load(body);
}

watch(
  searchString,
  debounce(() => {
    fetchSuggestions();
    fetchSearchResults();
  }, 500)
);
</script>

<template>
  <main>
    <h1>Den Danske Ordbog</h1>
    <section class="autocomplete-container">
      <input
        v-model="searchString"
        placeholder="Søg"
        @input="showSuggestions = true"
        ref="autocompleteInput"
      />

      <ul
        v-if="showSuggestions && suggestionsList.length > 0"
        class="suggestion-list"
      >
        <li
          v-for="(suggestion, index) in suggestionsList"
          :key="index"
          @click="onSuggestionSelected(suggestion)"
        >
          {{ suggestion }}
        </li>
      </ul>
    </section>

    <section
      v-if="!isLoading"
      v-html="htmlResponse"
      @click="showSuggestions = false"
    ></section>
    <img v-else src="./assets/spinner.svg" alt="Spinner" />
  </main>
</template>

<style lang="scss">
body {
  width: 350px;
}
#app {
  display: grid;
  grid-auto-flow: row;
  gap: 5px;
  padding: 10px;
  max-height: 400px;
  .autocomplete-container {
    position: relative;
    input {
      width: 100%;
      border: 1px solid #ccc;
      border-radius: 4px;

      &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
      }
    }

    .suggestion-list {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      overflow-y: auto;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 1;

      li {
        list-style: none;
        padding: 8px 10px;
        cursor: pointer;

        &:hover {
          background-color: #f0f0f0;
        }

        &.selected {
          background-color: #007bff;
          color: #fff;
        }
      }
    }
  }

  .wide-button,
  .copyright {
    display: none;
  }
  input {
    padding: 10px 0px;
    width: 100%;
  }
  img {
    place-self: center;
  }
}
</style>
