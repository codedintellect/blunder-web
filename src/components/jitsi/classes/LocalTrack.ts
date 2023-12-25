import { Ref, ref } from "vue";

import JitsiTrack from "./Track";
import Communication from "..";

declare const JitsiMeetJS: any;

export default class JitsiLocalTrack extends JitsiTrack {
  public default: Ref<string> = ref('');
  public enabled: Ref<boolean> = ref(false);
  public broadcast: Ref<boolean> = ref(false);

  private _effect: any;
  public get effect() {
    return this._effect;
  }
  public set effect(effect: any) {
    if (this.track) {
      this.track.setEffect(effect);
    }
    this._effect = effect;
  }

  private readonly type!: string;

  constructor(type: string) {
    super();
    this.type = type;
  }

  public setTrack(track: any): void {
    super.setTrack(track);
    if (!this.track) return;

    this.track.setEffect(this.effect);

    if (this.broadcast.value) {
      Communication.room?.addTrack(this.track).catch((event: any) => {
        console.log(event);
        this.broadcast.value = false;
      });
    }
  }

  public toggleState(enabled?: boolean) {
    if (enabled ?? !this.enabled.value) {
      if (this.track) return;
      this.initTrack().then(() => {
        this.enabled.value = true;
      });
    } else {
      if (this.broadcast.value) return;
      this.track?.dispose().then(() => {
        this.track = undefined;
        this.enabled.value = false;
      });
    }
  }

  public changeConnectivity(broadcast?: boolean) {
    this.broadcast.value = broadcast ?? !this.broadcast.value;
    this.toggleState(this.broadcast.value);
  }

  public initTrack(): Promise<any> {
    return JitsiMeetJS.createLocalTracks({
      devices: [this.type],
      micDeviceId: this.default.value,
      cameraDeviceId: this.default.value,
      firePermissionPromptIsShownEvent: true,
    }).then((track: any) => {
      this.default.value = track[0].getDeviceId();
      this.setTrack(track[0]);
    });
  }

  public refreshTrack(): void {
    this.track?.dispose().then(() => {
      this.track = undefined;
      this.initTrack();
    })
  }
}