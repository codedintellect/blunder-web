<!--  Blood on the Clocktower  -->

<script lang="ts" setup>
import { watch } from 'vue';
import Communication from '../utils/jitsi';
import JitsiControls from '../components/jitsi/JitsiControls.vue';
import PlayableArea from '../components/botc/PlayableArea.vue';
import Hand from '../components/botc/Hand.vue';

import { Session } from "../utils/games/botc";

const self = Communication.self;

const session = new Session("test", self.value?.id, true);
watch(self, function () {
  session.connect("test", self.value?.id);
});
</script>

<template>
  <PlayableArea :session="session" />
  
  <div id="bottom">
    <div id="bluffs" class="container"></div>
    <div id="panel">
      <div id="view-switcher" class="panel-buttons">
        <button />
        <button />
      </div>
      <JitsiControls />
    </div>
    <div style="flex: 1;"></div>
    <div id="storytellers">
      <div id="main-storyteller">
        <Hand :session="session" />
      </div>
      <!-- <video class="container"></video> -->
    </div>
    <div id="stage-switcher" class="panel-buttons">
      <button />
      <button />
      <button />
    </div>
  </div>
  
  <div id="folders" class="closed">
    <div id="tabs">
      <button>Rooms</button>
      <button>Roles</button>
      <button>Order</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

#bottom {
  position: absolute;
  height: 10rem;
  width: 100%;

  bottom: 0;

  padding-right: var(--border-width);

  display: flex;
  align-items: flex-end;
  gap: var(--border-width);

  pointer-events: none;

  & > * {
    pointer-events: all;
  }

  #bluffs {
    position: relative;
    height: 10rem;
    width: 10rem;

    border-radius: 2rem var(--border-radius) 2rem 1rem;
  }

  #panel {
    display: flex;
    flex-direction: column;
    gap: inherit;

    #communication-controls {
      border-radius: 1rem 2rem;
    }

    #view-switcher {
      border-radius: 2rem;
      border-bottom-left-radius: 1rem;
    }
  }

  #storytellers {
    display: flex;
    flex-direction: row-reverse;
    gap: inherit;

    #main-storyteller {
      position: relative;
      height: 4rem;
      width: 4rem;

      overflow: hidden;
    }
  }

  #stage-switcher {
    flex-direction: column;

    border-radius: 1rem 2rem;

    & > * {
      height: calc((10rem - 4 * var(--border-width)) / 3);
      width: calc((10rem - 4 * var(--border-width)) / 3);
    }
  }
}

#folders {
  position: fixed;
  height: 100%;
  width: 36rem;

  top: 0;
  right: 0;

  background-color: $nord1;
  border-style: none;
  border-left-style: solid;
  border-color: var(--border-color);
  border-width: var(--border-width);

  transition: transform 500ms;

  &.closed {
    transform: translateX(calc(100% - var(--border-width)));

    &:before {
      width: 0;
    }
  }

  &:before {
    content: "";

    position: absolute;
    height: 100%;
    width: 10rem;

    right: calc(100% + var(--border-width));

    background-image: linear-gradient(to left, rgba(black, 0.1), transparent);

    transition: width 500ms;

    z-index: -1;
  }

  #tabs {
    position: absolute;
    height: 100%;
    width: 3rem;

    right: 100%;

    padding-block: 0.5rem;

    border-style: none;
    border-right-style: solid;
    border-color: var(--border-color);
    border-width: var(--border-width);

    box-sizing: content-box;

    z-index: -1;
    overflow: hidden;

    pointer-events: none;

    display: flex;
    flex-direction: column;
    row-gap: 1.5rem;

    & > * {
      position: relative;
      height: auto;
      width: 100%;

      padding-inline-end: 1rem;

      background-color: $nord1;
      border: none;
      border-top: solid;
      border-left: solid;
      border-color: var(--border-color);
      border-width: var(--border-width);
      border-top-left-radius: 1rem;

      writing-mode: sideways-lr;

      pointer-events: all;

      &:after {
        content: "";

        position: absolute;
        height: 6rem;
        width: 3rem;

        top: calc(100% - 1.5rem);
        right: 0;

        background-color: inherit;
        border: inherit;
        border-top-left-radius: 1.5rem;

        transform-origin: 1.5rem 1.5rem;
        transform: rotateZ(-60deg);

        z-index: -2;
      }
    }
  }
}
</style>
