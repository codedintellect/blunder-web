import { Ref, ref } from "vue";
import { NoiseSuppressionEffect } from "../noise-suppression/NoiseSuppressionEffect";

import JitsiLocalTrack from "./LocalTrack";

declare const JitsiMeetJS: any;

export default abstract class MediaControl {
  public static mediaDevices: Ref<MediaDeviceInfo[]> = ref([]);

  public static audio: JitsiLocalTrack = new JitsiLocalTrack("audio");
  public static video: JitsiLocalTrack = new JitsiLocalTrack("video");

  // Track effects:
  public static noiseSuppression: Ref<boolean> = ref(true);

  public static selfMirror: Ref<boolean> = ref(true);

  public static init(): void {
    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      (devices: MediaDeviceInfo[]) => {
        this.mediaDevices.value = devices;
      }
    )

    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.PERMISSIONS_CHANGED,
      (event: any) => {
        console.log(event);
      }
    )

    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.PERMISSION_PROMPT_IS_SHOWN,
      (event: any) => {
        console.log(event);
      }
    )

    this.applyEffects();
  }

  public static getTrack(type: string): JitsiLocalTrack | undefined {
    switch (type.toLowerCase()) {
      case "audio": {
        return this.audio;
      }
      case "video": {
        return this.video;
      }
      default: {
        return undefined;
      }
    }
  }

  public static applyEffects(): void {
    if (this.noiseSuppression.value) {
      this.audio.effect = new NoiseSuppressionEffect();
    } else {
      this.audio.effect = undefined;
    }
  }

  public static setDefault(type: string, deviceId: string): void {
    let track = this.getTrack(type);
    if (!track) return;
    track.default.value = deviceId;
    track.refreshTrack();
  }
}