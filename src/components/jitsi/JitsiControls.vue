<script lang="ts" setup>
import { Ref } from "vue";
import Communication from "../../utils/jitsi";
import MediaControl from "../../utils/jitsi/classes/MediaControl";

// Icons
import cameraSvg from "/src/assets/icons/camera.vue";
import microphoneSvg from "/src/assets/icons/microphone.vue";
import settingsSvg from "/src/assets/icons/settings.vue";

if (!Communication.room)
  Communication.join("test");

const broadcastAudio: Ref<boolean> = MediaControl.audio.broadcast;
const broadcastVideo: Ref<boolean> = MediaControl.video.broadcast;
</script>

<template>
  <div id="communication-controls" class="panel-buttons">
    <button
      @click="() => { MediaControl.mediaSettings.value = true; }"
    >
      <settings-svg />
    </button>
    <button
      @click="() => { MediaControl.video.changeConnectivity(); }"
      :class="{
        off: !broadcastVideo,
      }"
    >
      <camera-svg />
    </button>
    <button
      @click="() => { MediaControl.audio.changeConnectivity(); }"
      :class="{
        off: !broadcastAudio,
      }"
    >
      <microphone-svg />
    </button>
  </div>
</template>
