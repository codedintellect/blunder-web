<!--  Blood on the Clocktower  -->

<script lang="ts" setup>
import { ref, watch } from 'vue';
import Communication from '../utils/jitsi';
import JitsiControls from '../components/jitsi/JitsiControls.vue';
import PlayableArea from '../components/botc/PlayableArea.vue';

import Hand from '../assets/icons/hand.vue';

import { Session } from "../utils/games/botc";

const self = Communication.self;

const session = new Session("test", self.value?.id, true);
watch(self, function () {
  session.connect("test", self.value?.id);
});

const helpRequested = ref(false);
watch(helpRequested, () => {
  session.updatePresence("help", helpRequested.value);
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
      <div id="main-storyteller" class="container">
        <button
          @click="(event) => {
            let pos = (event.target as HTMLElement).getBoundingClientRect();
            let X = (event.x - pos.left) / (pos.right - pos.left) * 100;
            let Y = (event.y - pos.top) / (pos.bottom - pos.top) * 100;
            (event.target as HTMLElement).style.setProperty(
              '--click-position', `${100-X}% ${Y}%`
            );
            helpRequested = !helpRequested;
          }"
          :class="{
            active: helpRequested,
          }"
        >
          <Hand />
          <Hand />
          <Hand />
        </button>
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

      border-radius: 1rem 1.4rem;

      overflow: hidden;

      & > button {
        height: 100%;
        width: 100%;

        transform: scaleX(-1);

        --click-position: 50% 50%;
        @keyframes open {
          from { 
            clip-path: circle(0% at var(--click-position));
          }
          to { 
            clip-path: circle(100% at var(--click-position));
          }
        }

        &:hover:not(.active) {
          svg:first-child {
            filter: 
              drop-shadow(-1px -1px 0.4px rgba($nord4, 0.7))
              drop-shadow( 1px -1px 0.4px rgba($nord4, 0.7))
              drop-shadow( 1px  1px 0.4px rgba($nord4, 0.7))
              drop-shadow(-1px  1px 0.4px rgba($nord4, 0.7));
          }
        }

        svg {
          position: absolute;
          inset: 0.2rem;

          color: $nord3;

          transform: translateX(2%);

          // transform: translateX(-2%) scaleX(-1);
          animation: none;

          pointer-events: none;

          &:first-child {
            filter: 
              drop-shadow(-1px -1px 0.4px rgba($nord0, 0.5))
              drop-shadow( 1px -1px 0.4px rgba($nord0, 0.5))
              drop-shadow( 1px  1px 0.4px rgba($nord0, 0.5))
              drop-shadow(-1px  1px 0.4px rgba($nord0, 0.5));

            transition: filter 100ms;
          }

          &:not(:first-child) {
            color: $nord13;

            clip-path: circle(0% at var(--click-position));
            // animation: open 300ms ease-out reverse forwards;

            &:last-child {
              opacity: 0.5;
            }
          }
        }

        &.active {
          svg:first-child {
            transition: filter 500ms;
          }

          svg:not(:first-child) {
            animation: open 300ms ease-in forwards;
            &:last-child {
              animation: open 120ms ease-in forwards;
            }
          }
        }
      }
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
