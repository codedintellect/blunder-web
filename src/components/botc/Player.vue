<script lang="ts" setup>
import { Ref, ref } from 'vue';
import MediaControl from '../../utils/jitsi/classes/MediaControl';
import JitsiUser from '../../utils/jitsi/classes/User';

import webcamSvg from '../../assets/icons/webcam.vue';
import microphoneSvg from '../../assets/icons/microphone.vue';

const props = defineProps(['jitsiId', 'jitsiData', 'playerData']);

const user = props.jitsiData as JitsiUser;
const mirror = MediaControl.selfMirror;

const hasAudio: Ref<boolean> =
  user.isLocal() ? MediaControl.audio.broadcast : ref(false);
const hasVideo: Ref<boolean> =
  user.isLocal() ? MediaControl.video.broadcast : ref(false);

if (!user.isLocal()) {
  user.audio.muteMonitors.push(hasAudio);
  user.video.muteMonitors.push(hasVideo);
}

const isSpeaking: Ref<boolean> = ref(false);
user.audio.speechMonitors.push(isSpeaking);

const vJitsiStream = {
  mounted: (el: HTMLMediaElement) => {
    user.attachContainer(el);
  },
  beforeUnmount: (el: HTMLMediaElement) => {
    user.detachContainer(el);
  },
};
</script>

<template>
  <div
    class="player"
    :class="{
      'request-help': playerData['help'],
    }"
  >
    <div class="help"></div>
    <div
      class="container"
      :class="{
        speaking: isSpeaking && hasAudio,
      }"
    >
      <video
        :class="{
          mirrored: mirror && user?.isLocal(),
        }"
        v-jitsi-stream
        autoplay
        muted
      />
      <div class="info">
        <span>{{ props.jitsiId }}</span>
        <div
          class="icon"
          :class="{
            off: !hasVideo,
          }"
        >
          <webcam-svg />
        </div>
        <div
          class="icon"
          :class="{
            off: !hasAudio,
          }"
        >
          <microphone-svg />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

.player {
  position: relative;

  transition: 
    height 200ms ease-in-out,
    width  200ms ease-in-out,
    top    200ms ease-in-out,
    left   200ms ease-in-out;

  &.request-help {
    .container {
      box-shadow:
        calc(0.5 * var(--border-width))
        calc(0.5 * var(--border-width))
        $nord13;
    }

    .help {
      border-top-left-radius: 0.5rem;
    }
  }

  &:hover {
    .container > .info {
      opacity: 1;
    }
  }

  .container {
    position: absolute;
    height: 100%;
    width: 100%;

    border-radius: 2rem 1rem;
    box-shadow: 0 0 $nord13;
    outline-style: solid;
    outline-color: $nord14;
    outline-offset: calc(-0.6 * var(--border-width));
    outline-width: 0;

    transition: box-shadow 200ms, outline-width 100ms;
    transition-delay: outline-width 400ms;

    overflow: hidden;

    &.speaking {
      outline-width: calc(0.6 * var(--border-width));

      transition-delay: 0s;
    }

    video {
      position: absolute;
      height: 100%;

      outline-style: solid;
      outline-color: $nord2;
      outline-width: 0;

      object-fit: cover;
    }

    .info {
      position: absolute;
      height: fit-content;

      bottom: 0;

      background-color: $nord0;
      border-top-right-radius: 0.4rem;

      display: flex;
      align-items: stretch;

      opacity: 0.5;

      transition: opacity 100ms ease-out;

      overflow: hidden;

      span {
        bottom: 0;

        padding-block: 0.2rem;
        padding-inline: 0.4rem;

        background-color: $nord1;
        border-top-right-radius: 0.4rem;
      }

      .icon {
        position: relative;
        height: 1.9rem;
        width: 0;

        overflow: hidden;

        transition: width 100ms ease-out;

        &.off {
          width: 1.9rem;
        }

        &:after {
          content: "";

          position: absolute;
          height: 0.15rem;
          width: 1.5rem;

          top: 0.95rem;
          right: 0.95rem;

          background-color: $nord11;
          border-radius: 0.15rem;
          outline-style: solid;
          outline-color: $nord0;
          outline-width: 0.13rem;

          transform: translate(50%, -50%) rotate(45deg);

          pointer-events: none;

          transition: width 150ms ease-in;
        }

        svg {
          position: absolute;
          height: 1.9rem;
          width: 1.9rem;

          right: 0;

          padding: 0.4rem;
          
          margin-inline: auto;

          color: rgba($nord4, 0.5);
        }
      }
    }
  }

  .help {
    position: absolute;
    height: 2rem;
    width: 2rem;

    top: calc(0.25 * var(--border-width));
    left: calc(0.25 * var(--border-width));

    background-color: $nord13;
    border-top-left-radius: 2rem;

    transition: border-top-left-radius 200ms;
  }
}
</style>
