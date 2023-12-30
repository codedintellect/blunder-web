<!--  Blood on the Clocktower  -->

<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue';
import Communication from '../utils/jitsi';
import MediaControl from '../utils/jitsi/classes/MediaControl';
import JitsiControls from '../components/jitsi/JitsiControls.vue';
import Settings from '../components/jitsi/Settings.vue';

import { Session } from "../utils/games/botc"

const mediaSettings: Ref<boolean> = ref(false);

const self = Communication.self;
const users = Communication.users;
const selfMirror: Ref<boolean> = MediaControl.selfMirror;

const session = new Session("test", self.value?.id);
const sessionState: Ref<any> = session.state;
watch(self, function () {
  session.connect("test", self.value?.id);
});

const attended = computed(function() {
  console.log(users.value.size, Object.keys(sessionState.value).filter(x => users.value.has(x)));
  return Object.keys(sessionState.value).filter(x => users.value.has(x));
})

const vJitsiStream = {
  beforeMount: (el: HTMLMediaElement) => {
    let jitsiId = el.getAttribute("jitsi");
    if (!jitsiId) return;
    users.value.get(jitsiId)?.attachContainer(el);
  },
  beforeUnmount: (el: HTMLMediaElement) => {
    let jitsiId = el.getAttribute("jitsi");
    if (!jitsiId) return;
    console.log("unmount")
    users.value.get(jitsiId)?.detachContainer(el);
  },
};

const total = 10;
const scale = 20;

function circularPosition(id: number, total: number) {
  if (total % 2 == 1) {
    total++;
    if (id >= total / 2) {
      id++;
    }
  }

  let Y = scale / 2;
  let X = Y * 16 / 10;
  let radius = 50 - 2 * Y;
  let style: any = {
    'height': `${2*Y}%`,
    'padding-left': `${2*X}%`,
  };
  let side = id < total / 2 ? 'right' : 'left';
  let vert = Math.abs(id - total / 2) < total / 4 ? 'top' : 'bottom';

  if (id == 0 || id == total / 2) {
    style['left'] = '50%';
    style['transform'] = 'translateX(-50%)';
    style[vert] = '0';
    return style;
  }
  if (id % (total / 4) == 0) {
    style['bottom'] = `${radius}%`;
    style['transform'] = 'translateY(-50%)';
    style[side] = `${radius + 50}%`;
    return style;
  }

  let k = total / 4 - 1;
  let b = k * (X - 2 * Y) + Y;

  let qa = k**2 + 1;
  let qb = -1 * 2 * k * b;
  let qc = b**2 - radius**2;
  let qD = qb**2 - 4 * qa * qc;

  let x = (-qb + Math.sqrt(qD)) / (2 * qa);
  let dist = x - X;
  let y = Math.sqrt(radius**2 - x**2);
  y -=
    (total / 4 - Math.abs(id % (total / 2) - total / 4) - 1)
    * (2 * Y + dist);
  x = Math.sqrt(radius**2 - y**2);
  style[vert] = `${radius - y}%`;
  style[side] = `calc(${x}% + 50%)`;

  return style;
}
</script>

<template>
  <div class="absolute pr-2">
    <video
      v-for="key of attended"
      :key="key"
      :jitsi="key"
      v-jitsi-stream
      :class="{
        mirrored: users.get(key)?.isLocal() && selfMirror,
      }"
      autoplay
      muted
    >{{  }}</video>
  </div>
  <div id="play-circle"
    :style="{
      '--radius': `${50 - scale}%`,
    }"
  >
    <video 
      v-for="i in total"
      :key="'player-' + i"
      class="container"
      :style="circularPosition(i - 1, total)"
    ></video>
    <div id="safe-zone"></div>
  </div>

  <div id="bottom">
    <div id="bluffs" class="container"></div>
    <div id="panel">
      <div id="view-switcher" class="panel-buttons">
        <button />
        <button />
      </div>
      <JitsiControls
        @open="() => { mediaSettings = true; }"
      />
    </div>
    <div id="storytellers">
      <video class="container"></video>
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

  <Settings
    v-if="mediaSettings"
    @close="() => { mediaSettings = false; }"
  />
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

video {
  position: relative;
  height: 10rem;
  width: auto;

  aspect-ratio: 16 / 10;

  border-radius: 2rem 1rem;
}

#play-circle {
  position: absolute;
  height: 100%;
  width: auto;

  left: 50%;
  transform: translateX(-50%);

  aspect-ratio: 1;

  margin-right: var(--border-width);

  background-color: rgba($nord10, 0.7);
  border-radius: 50%;

  & > video {
    position: absolute;
  }

  #safe-zone {
    position: absolute;
    height: calc(2 * var(--radius));
    width: auto;

    aspect-ratio: 1;

    left: 50%;
    top: 50%;
    
    transform: translate(-50%, -50%);

    border-style: solid;
    border-color: rgba($nord5, 0.5);
    border-width: 1px;
    border-radius: 50%;
  }
}

#bottom {
  position: absolute;
  height: 10rem;
  width: 100%;

  bottom: 0;

  padding-right: var(--border-width);

  display: flex;
  align-items: flex-end;
  gap: var(--border-width);

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
    flex: 1;

    display: flex;
    flex-direction: row-reverse;
    gap: inherit;
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
