<script lang="ts" setup>
import { computed, defineEmits } from "vue";
import Communication from "../jitsi";

// Icons
import chevronDownSvg from "/src/assets/icons/chevron-down.vue";
import closeSvg from "/src/assets/icons/close.vue";
import headphonesSvg from "/src/assets/icons/headphones.vue";
import microphoneSvg from "/src/assets/icons/microphone.vue";
import webcamSvg from "/src/assets/icons/webcam.vue";

defineEmits(['close']);

const selfMirror: Ref<boolean> = Communication.selfMirror;
const mediaDevices: Ref<Object> = Communication.mediaDevices;

const defaultVideo: Ref<string> = Communication.defaultVideo;
const defaultAudio: Ref<string> = Communication.defaultAudio;
const defaultOutput: Ref<string> = Communication.defaultOutput;

const videoinput = computed(() => {
  return mediaDevices.value.filter(device => device.kind === 'videoinput');
});

const audioinput = computed(() => {
  return mediaDevices.value.filter(device => device.kind === 'audioinput');
});

const audiooutput = computed(() => {
  return mediaDevices.value.filter(device => device.kind === 'audiooutput');
});

const vSelfPreview = {
  beforeMount: (el) => {
    Communication.attachSelf(el);
  },
  beforeUnmount: (el) => {
    Communication.detachSelf(el);
  },
};


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
      <div class="dropdown">
        <webcam-svg />
        <span v-if="defaultVideo">
          {{ videoinput.filter(x => x.deviceId === defaultVideo)[0].label }}
        </span>
        <chevron-down-svg />
      </div>
      <button
        @click="() => { selfMirror = !selfMirror }"
        :class="{
          active: selfMirror,
        }"
      >
        MIRROR
      </button>
      <button disabled>
        BLUR
      </button>
    </div>

    <div class="separator" />

    <div class="option-row">
      <audio v-self-preview autoplay muted />
      <div class="dropdown">
        <microphone-svg />
        <span v-if="defaultAudio">
          {{ audioinput.filter(x => x.deviceId === defaultAudio)[0].label }}
        </span>
        <chevron-down-svg />
      </div>
      <button class="active">
        DENOISE
      </button>
      <button
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
      </button>
      <div class="slider"></div>
    </div>

    <div class="separator" />

    <div class="option-row">
      <div class="dropdown">
        <headphones-svg />
        <span v-if="defaultOutput === 'default'">
          Default Device
        </span>
        <span v-else-if="defaultOutput">
          {{ audiooutput.filter(x => x.deviceId === defaultOutput)[0].label }}
        </span>
        <span v-else>
          Not Found
        </span>
        <chevron-down-svg />
      </div>
      <button disabled>
        TEST
      </button>
      <div class="slider">
        <div>
          <span>VOLUME:</span>
        </div>
      </div>
    </div>

    <!-- <li
      v-for="device in videoinput.filter(x => x.deviceId != defaultVideo)"
    >
      {{ device.label }}
    </li> -->

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

  flex: 1;

  display: flex;
  align-items: center;
  gap: 0.5rem;

  cursor: pointer;

  * {
    pointer-events: none;
    user-select: none;
  }

  span {
    flex: 1;

    white-space: nowrap;

    overflow: hidden;
  }

  svg {
    height: 100%;
  }
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  button {
    padding: 0.5rem;

    background-color: $nord0;
    border-radius: 0.4rem;

    font-family: Roboto Mono;

    transition: background-color 100ms ease-in;

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
