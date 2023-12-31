import { Ref } from "vue";

declare const JitsiMeetJS: any;

export default class JitsiTrack {
  protected track?: any;

  private _containers: HTMLMediaElement[] = [];

  public muteMonitors: Ref<boolean>[] = [];
  public speechMonitors: Ref<boolean>[] = [];

  setTrack(track: any): void {
    console.log("TRACK SET");
    this.track = track;

    for (const monitor of this.muteMonitors) {
      monitor.value = !!this.track;
    }

    if (!this.track) return;

    this.track.on(
      JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      (level: number) => {
        let speech = level > 0.01;
        for (const monitor of this.speechMonitors) {
          monitor.value = speech;
        }
      }
    )

    for (const container of this._containers) {
      this.track.attach(container);
      container.play();
    }
  }

  attachContainer(element: HTMLMediaElement): void {
    this._containers.push(element);

    if (!this.track) return;
    this.track.attach(element);
    
    return;
  }

  detachContainer(element: HTMLMediaElement): void {
    let index: number = this._containers.indexOf(element);
    this._containers.splice(index, 1);

    if (!this.track) return;
    this.track.detach(element);

    return;
  }
}
