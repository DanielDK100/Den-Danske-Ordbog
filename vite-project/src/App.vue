<script setup lang="ts">
import { ref, Ref, watch, version, onBeforeMount } from "vue";
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
const meanings: Ref<string[]> = ref([]);
const didYouMeanList: Ref<string[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

onBeforeMount(() => {
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

    const $ = parseHtmlStringToDocument(htmlResponse.value);

    meanings.value = $(".ar")
      .map((_index: number, element: Element) => $(element).html())
      .get();
    console.log(meanings);

    didYouMeanList.value = $(".nomatch")
      .find("li")
      .map((_index: number, element: Element) => $(element).text())
      .get();

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
      .map((_index: number, element: Element) => $(element).text().trim())
      .get()
      .filter((suggestion: string) => suggestion !== "");
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
  <main id="grid">
    <h1>Den Danske Ordbog</h1>
    <section class="autocomplete-container">
      <input
        v-model="searchString"
        placeholder="Indtast søgning"
        @input="showSuggestions = true"
        ref="autocompleteInput"
        autofocus
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

    <section class="nomatch" v-if="didYouMeanList.length > 0">
      <h2>Ingen ord matcher søgningen</h2>
      <h3><span class="highlight">Mente du:</span></h3>
      <div>
        <ul class="suggestion-list">
          <li
            v-for="(suggestion, index) in didYouMeanList"
            :key="index"
            @click="onSuggestionSelected(suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </section>

    <section v-if="!isLoading" @click="showSuggestions = false">
      <div v-for="(suggestion, index) in meanings" :key="index">
        <div v-html="suggestion" class="ar"></div>
      </div>
    </section>

    <img v-else src="./assets/images/spinner.svg" alt="Spinner" id="spinner" />
  </main>
</template>

<style lang="scss">
body {
  width: 350px;
}
#grid {
  display: grid;
  grid-auto-flow: row;
  gap: 5px;
  padding: 10px;
  max-height: 400px;
  h1 {
    font-size: x-large;
  }
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
  .copyright,
  .audio {
    display: none;
  }
  input {
    padding: 10px 0px;
    width: 100%;
  }
  #spinner {
    place-self: center;
  }
}
</style>
