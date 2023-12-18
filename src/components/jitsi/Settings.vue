<script lang="ts" setup>
import { Ref, computed } from "vue";
import Communication from "../jitsi";

// Icons
import chevronDownSvg from "/src/assets/icons/chevron-down.vue";
import closeSvg from "/src/assets/icons/close.vue";
import headphonesSvg from "/src/assets/icons/headphones.vue";
import microphoneSvg from "/src/assets/icons/microphone.vue";
import webcamSvg from "/src/assets/icons/webcam.vue";

defineEmits(['close']);

const selfMirror: Ref<boolean> = Communication.selfMirror;
const mediaDevices: Ref<MediaDeviceInfo[]> = Communication.mediaDevices;

const defaultVideo: Ref<string> = Communication.defaultVideo;
const defaultAudio: Ref<string> = Communication.defaultAudio;
const defaultOutput: Ref<string> = Communication.defaultOutput;

const sortedDevices = computed(function() {
  let result: Map<MediaDeviceKind, MediaDeviceInfo[]> = new Map();
  for (let device of mediaDevices.value) {
    result.set(device.kind, (result.get(device.kind) || []).concat(device));
  }
  return result;
})

const vSelfPreview = {
  beforeMount: (el: HTMLMediaElement) => {
    Communication.attachSelf(el);
  },
  beforeUnmount: (el: HTMLMediaElement) => {
    Communication.detachSelf(el);
  },
};

const vSelfVolume = {
  beforeMount: (el: HTMLMediaElement) => {
    Communication.selfVolumeMonitor(el);
  },
  beforeUnmount: (el: HTMLMediaElement) => {
    Communication.selfVolumeMonitor(el);
  },
}
</script>

<script lang="ts">
function dropdown(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target) {
    return;
  }
  if (target.classList.contains("empty")) {
    return;
  }

  let settings = document.getElementById("communication-settings");
  if (!settings) {
    return;
  }

  for (const element of settings.querySelectorAll(".selected")) {
    element.classList.remove("selected");
    if (element === event.target) {
      return;
    }
  }
  target.classList.add("selected");
}
</script>

<template>
  <div
    @click="$emit('close')"
    class="blackout"
  ></div>
  <div id="communication-settings" class="container">
    <video
      :class="{
        mirrored: selfMirror,
      }"
      v-self-preview
      autoplay
    ></video>

    <div class="option-row">
      <div
        class="dropdown"
        :class="{
          empty: (sortedDevices.get('videoinput')?.length || 0) <= 1,
        }"
        @click="dropdown"
      >
        <webcam-svg />
        <span v-if="defaultVideo">
          {{ 
            sortedDevices.get('videoinput')?.filter((x: MediaDeviceInfo) =>
              x.deviceId === defaultVideo)[0].label
          }}
        </span>
        <chevron-down-svg />
        <div class="dropdown-options">
          <span
            v-for="device in sortedDevices.get('videoinput')"
            @click="Communication.changeDevice(device.deviceId, device.kind)"
            :hidden="device.deviceId === defaultVideo"
          >
            {{ device.label }}
          </span>
        </div>
      </div>
      <button
        @click="() => { selfMirror = !selfMirror }"
        :class="{
          active: selfMirror,
        }"
      >
        MIRROR
      </button>
      <!-- <button disabled>
        BLUR
      </button> -->
    </div>

    <div class="separator" />

    <div class="option-row">
      <audio v-self-preview autoplay muted />
      <div
        class="dropdown"
        :class="{
          empty: (sortedDevices.get('audioinput')?.length || 0) <= 1,
        }"
        @click="dropdown"
      >
        <microphone-svg />
        <span v-if="defaultAudio">
          {{
            sortedDevices.get('audioinput')?.filter((x: MediaDeviceInfo) =>
              x.deviceId === defaultAudio)[0].label
          }}
        </span>
        <chevron-down-svg />
        <div class="dropdown-options">
          <span
            v-for="device in sortedDevices.get('audioinput')"
            @click="Communication.changeDevice(device.deviceId, device.kind)"
            :hidden="device.deviceId === defaultAudio"
          >
            {{ device.label }}
          </span>
        </div>
      </div>
      <button class="active">
        DENOISE
      </button>
      <!-- <button
        @click="(event) => {
          let audio = event.target.parentElement.querySelector('audio');
          audio.muted = !audio.muted;
          if (audio.muted) {
            event.target.classList.remove('running');
          }
          else {
            event.target.classList.add('running');
          }
        }"
      >
        TEST
      </button> -->
      <div
        v-self-volume
        class="slider"
      ></div>
    </div>

    <div class="separator" />

    <div class="option-row">
      <div
        class="dropdown"
        :class="{
          empty: (sortedDevices.get('audiooutput')?.length || 0) <= 1,
        }"
        @click="dropdown"
      >
        <headphones-svg />
        <span v-if="defaultOutput">
          {{ 
            sortedDevices.get('audiooutput')?.filter((x: MediaDeviceInfo) =>
              x.deviceId === defaultOutput)?.[0]?.label || defaultOutput
          }}
        </span>
        <span v-else>
          Not Found
        </span>
        <chevron-down-svg />
        <div class="dropdown-options">
          <span
            v-for="device in sortedDevices.get('audiooutput')"
            @click="Communication.changeDevice(device.deviceId, device.kind)"
            :hidden="device.deviceId === defaultOutput"
          >
            {{ device.label }}
          </span>
        </div>
      </div>
      <div class="slider">
        <div>
          <span>VOLUME:</span>
        </div>
      </div>
    </div>

    <button
      @click="$emit('close')"
      id="exit"
    >
      <close-svg />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

#communication-settings {
  position: absolute;
  height: auto;
  width: auto;

  top: 50%;
  left: 50%;

  padding: 1rem;

  border-radius: 1rem;

  box-shadow: 0.2rem 0.2rem 0 $nord0;

  transform: translate(-50%, -50%);

  z-index: 11;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  video {
    max-height: min(30vmin, 20rem);
    max-width: 80vmin;

    border-radius: 0.4rem;
  }

  #exit {
    position: absolute;
    height: 2.6rem;
    width: 2.6rem;

    left: 100%;
    top: 1rem;

    background-color: $nord1;
    border-style: solid;
    border-left-style: none;
    border-color: var(--border-color);
    border-width: var(--border-width);
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;

    box-shadow: inherit;

    &:active {
      top: 1.2rem;

      padding-left: 0.2rem;

      box-shadow: none;
    }

    & > svg {
      height: 100%;
      width: 100%;
    }
  }
}

.blackout {
  position: fixed;
  inset: 0;

  background-color: rgba(black, 0.2);

  backdrop-filter: blur(4px);

  z-index: 10;
}

.dropdown {
  position: relative;
  
  padding: 0.5rem;

  background-color: $nord0;
  border-radius: 0.4rem;

  outline-style: solid;
  outline-color: $nord4;
  outline-width: 0;

  flex: 1;

  display: flex;
  align-items: center;
  gap: 0.5rem;

  cursor: pointer;

  transition: outline-width 40ms;

  &:hover, &.selected {
    outline-width: calc(var(--border-width) / 2);

    z-index: 1;
  }

  &:active, &.empty:hover {
    outline-color: rgba($nord4, 0.7);
    outline-width: calc(var(--border-width) / 3);
  }

  &.empty {
    cursor: unset;
  }

  &.empty > svg {
    opacity: 0.6;
  }

  &.selected {
    z-index: 2;
  }

  * {
    pointer-events: none;
    user-select: none;
  }

  .dropdown-options {
    position: absolute;
    width: 100%;

    max-height: 0;

    top: calc(100% + var(--border-width) / 2);
    left: 0;

    display: flex;
    flex-direction: column;
    
    border-bottom-left-radius: 0.4rem;
    border-bottom-right-radius: 0.4rem;

    outline-style: solid;
    outline-color: $nord3;
    outline-width: 0;

    box-sizing: content-box;

    box-shadow: 0 -0.4rem 0 $nord0;

    pointer-events: auto;

    overflow-y: auto;

    z-index: -1;

    transition: max-height 100ms, outline-width 100ms;

    span {
      padding: 0.5rem;

      flex-shrink: 0;

      background-color: $nord0;

      pointer-events: auto;

      &:hover {
        background-color: $nord2;
      }
    }
  }

  &.selected > .dropdown-options {
    max-height: 400%;
    outline-width: inherit;
  }

  span {
    position: relative;

    flex: 1;

    white-space: nowrap;

    overflow: hidden;

    &:after {
      content: "";

      position: absolute;
      height: 100%;
      aspect-ratio: 1;

      top: 0;
      right: 0;

      background: linear-gradient(to right, rgba($nord0, 0), $nord0);
    }
  }

  svg {
    height: 100%;
  }
}

.option-row {
  max-width: min(53.3vmin, 35.5rem);

  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  button {
    padding: 0.5rem;

    background-color: $nord0;
    border-radius: 0.4rem;

    outline-style: solid;
    outline-color: $nord4;
    outline-width: 0;

    font-family: Roboto Mono;

    transition: background-color 100ms ease-in, outline-width 40ms;

    &:hover {
      outline-width: calc(var(--border-width) / 2);
    }

    &:active {
      outline-color: rgba($nord4, 0.7);
      outline-width: calc(var(--border-width) / 3);
    }

    &.active {
      background-color: $nord10;
    }

    &.running {
      background-color: $nord14;
    }
  }

  .slider {
    --usage: 0;

    position: relative;

    flex-basis: 100%;

    padding: 0.4rem;

    background-color: $nord0;
    border-radius: 0.4rem;

    overflow: hidden;

    div {
      position: relative;

      font-family: Roboto Mono;
      font-size: 0.8rem;
      font-weight: 700;
    }

    &:before {
      content: "";

      position: absolute;
      height: 100%;
      width: calc(100% * var(--usage));

      top: 0;
      left: 0;

      background-color: $nord10;

      transition: width 200ms;
    }
  }
}

.separator {
  position: relative;
  height: 0.2rem;
  width: auto;

  margin-inline: 0.7rem;

  background-color: $nord4;
  border-radius: 0.1rem;
}
</style>
