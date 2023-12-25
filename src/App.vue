<script lang="ts" setup>
import { ref, computed } from "vue";
import type { DefineComponent, Ref } from "vue";
import Communication from "./utils/jitsi"
// import Navbar from "./components/Navbar.vue";
import NotFound from "./routes/_NotFound.vue";
// MAIN PAGES
import Home from "./routes/Home.vue";
import About from "./routes/About.vue";

import BloodOnTheClocktower from "./routes/BloodOnTheClocktower.vue";

Communication.init();

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
    component: BloodOnTheClocktower,
    iconUrl: undefined,
    iconAlt: "BotC",
  },
};

const currentPath: Ref<string> = ref(window.location.hash);

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});

const currentView = computed(() => {
  let path: string = "/";
  if (currentPath.value.length > 1) {
    path = "/" + currentPath.value.split("/")[1];
  }
  return (
    (routes[path] || {})["component"] || NotFound
  );
});
</script>

<template>
  <!-- <Navbar :routes="routes" /> -->
  <div id="content-area">
    <component :is="currentView" />
  </div>
</template>
