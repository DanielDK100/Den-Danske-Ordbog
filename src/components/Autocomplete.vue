<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import { load, Element } from "cheerio";
import debounce from "lodash.debounce";
import SearchProps from "../interfaces/SearchProps";

const props = defineProps<SearchProps>();
const autocompleteUrl: string = import.meta.env.VITE_AUTOCOMPLETE_URL;

const emit = defineEmits(["search"]);
const autocompleteList: Ref<string[]> = ref([]);

function onAutocompleteSelected(selectedAutocomplete: string): void {
  autocompleteList.value = [];
  emit("search", selectedAutocomplete);
}

async function fetchAutocomplete(): Promise<void> {
  try {
    const response = await fetch(
      `${autocompleteUrl}?q=${props.searchString}&size=7`
    );
    const responseBody = await response.text();

    const $ = load(responseBody);

    autocompleteList.value = $("li")
      .map((_index: number, element: Element) => $(element).text().trim())
      .get()
      .filter((autocompleteItem: string) => autocompleteItem !== "");
  } catch (error) {
    console.error("Error fetching autocomplete:", error);
  }
}

watch(
  props,
  debounce(() => {
    fetchAutocomplete();
  }, 500)
);
</script>
<template>
  <section class="autocomplete-container">
    <ul v-if="autocompleteList.length > 0" class="autocomplete-list">
      <li
        v-for="(autocompleteItem, index) in autocompleteList"
        :key="index"
        @click="onAutocompleteSelected(autocompleteItem)"
      >
        {{ autocompleteItem }}
      </li>
    </ul>
  </section>
</template>
