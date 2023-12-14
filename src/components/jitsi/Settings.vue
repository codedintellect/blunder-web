<script lang="ts" setup>
import { computed, defineEmits } from "vue";
import Communication from "../jitsi";

// Icons
import closeSvg from "/src/assets/icons/close.vue";

defineEmits(['close']);

const selfMirror: Ref<boolean> = Communication.selfMirror;
const mediaDevices: Ref<Object> = Communication.mediaDevices;

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
</style>