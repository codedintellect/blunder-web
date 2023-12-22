import { Ref, ref } from "vue";

class Track {
  jitsiTrack?: any;

  private _containers: HTMLMediaElement[] = [];
  private _effect: any;
  
  public get effect() {
    return this._effect;
  }

  public set effect(effect: any) {
    if (this.jitsiTrack) {
      this.jitsiTrack.setEffect(effect);
    }
    this._effect = effect;
  }

  readonly muted: Ref<boolean> = ref<boolean>(true);
  readonly parentUser: User;

  /**
   * 
   * @param parentUser - Whichever User this track derives from
   */
  constructor(parentUser: User) {
    this.parentUser = parentUser;
  }

  isLocal(): boolean {
    return this.parentUser.isLocal();
  }

  /**
   * Toggles or sets the mute state of local track
   * 
   * @param state - Force specific mute state
   * @returns 
   */
  changeMuteState(state?: boolean): void {
    if (!this.isLocal()) return;

    this.muted.value = state ?? !this.muted.value;

    if (!this.jitsiTrack) return;
    if (this.muted.value) {
      this.jitsiTrack.mute();
    }
    else {
      this.jitsiTrack.unmute();
    }

    return;
  }

  attachContainer(element: HTMLMediaElement): void {
    this._containers.push(element);

    if (!this.jitsiTrack) return;
    this.jitsiTrack.attach(element);
    
    return;
  }

  detachContainer(element: HTMLMediaElement): void {
    let index: number = this._containers.indexOf(element);
    this._containers.splice(index, 1);

    if (!this.jitsiTrack) return;
    this.jitsiTrack.detach(element);

    return;
  }
}
