import MediaControl from "./MediaControl";
import JitsiTrack from "./Track";

export default class JitsiUser {
  readonly id!: string;
  readonly conference!: any;

  readonly audio!: JitsiTrack;
  readonly video!: JitsiTrack;

  constructor(id: string, conference: any) {
    this.id = id;
    this.conference = conference;

    this.audio = this.isLocal() ? MediaControl.audio : new JitsiTrack();
    this.video = this.isLocal() ? MediaControl.video : new JitsiTrack();
  }

  public getTrack(type: string): JitsiTrack | undefined {
    switch (type) {
      case "audio": {
        return this.audio;
      }
      case "video": {
        return this.video;
      }
      default: {
        console.error("No such track type!");
        return undefined;
      }
    }
  }

  isLocal(): boolean {
    return this.id === this.conference.myUserId();
  }

  setTrack(track: any) {
    this.getTrack(track.getType())?.setTrack(track);
  }

  attachContainer(el: HTMLMediaElement) {
    this.getTrack(el.tagName.toLowerCase())?.attachContainer(el);
  }

  detachContainer(el: HTMLMediaElement) {
    this.getTrack(el.tagName.toLowerCase())?.detachContainer(el);
  }
}