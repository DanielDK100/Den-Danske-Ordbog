<script setup lang="ts">
import { ref, Ref, version } from "vue";
import SearchResult from "../components/SearchResult.vue";
import Autocomplete from "../components/Autocomplete.vue";

const showAutocomplete: Ref<boolean> = ref(false);
const searchString: Ref<string> = ref("");

console.info(`Made with %c%s`, "color: #41b783;", `Vue.js ${version}`);

function search(value: string) {
  searchString.value = value;
  showAutocomplete.value = false;
}
</script>

<template>
  <main id="wrapper">
    <header>
      <h1>Den Danske Ordbog</h1>
    </header>
    <div id="sticky">
      <input
        v-model="searchString"
        placeholder="Indtast søgning"
        @input="showAutocomplete = true"
        autofocus
      />
      <Autocomplete
        v-if="showAutocomplete"
        @search="search"
        :searchString="searchString"
      />
    </div>
    <SearchResult @search="search" :searchString="searchString" />
  </main>
</template>
