<script lang="ts" setup>
import { ref, computed } from "vue";
import type { DefineComponent, Ref } from "vue";
import Navbar from "./components/Navbar.vue";
import NotFound from "./routes/_NotFound.vue";
// MAIN PAGES
import Home from "./routes/Home.vue";
import About from "./routes/About.vue";
import BotC from "./routes/BotC.vue";

type Page = {
  component: DefineComponent<{}, {}, any>;
  iconUrl: string | undefined;
  iconAlt: string | undefined;
};

const routes: { [key: string]: Page } = {
  "/": {
    component: Home,
    iconUrl: undefined,
    iconAlt: "Home",
  },
  "/about": {
    component: About,
    iconUrl: undefined,
    iconAlt: "About",
  },
  "/botc": {
    component: BotC,
    iconUrl: undefined,
    iconAlt: "BotC",
  },
};

const currentPath: Ref<string> = ref(window.location.hash);

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});

const currentView = computed(() => {
  return (
    (routes[currentPath.value.slice(1) || "/"] || {})["component"] || NotFound
  );
});
</script>

<template>
  <Navbar :routes="routes" />
  <div id="content-area">
    <component :is="currentView" />
  </div>
</template>
