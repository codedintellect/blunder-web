<script lang="ts" setup>
import { ref, computed } from "vue";
import type { DefineComponent, Ref } from "vue";
import Navbar from "./components/Navbar.vue";
import NotFound from "./routes/_NotFound.vue";
// MAIN PAGES
import Home from "./routes/Home.vue";
import About from "./routes/About.vue";

const routes: { [key: string]: DefineComponent<{}, {}, any> } = {
  "/": Home,
  "/about": About,
};

const currentPath: Ref<string> = ref(window.location.hash);

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || "/"] || NotFound;
});
</script>

<template>
  <Navbar />
  <div id="content-area">
    <a href="#/">Home</a> |
    <a href="#/about">About</a> |
    <a href="#/non-existent-path">Broken Link</a>
    <component :is="currentView" />
  </div>
</template>
