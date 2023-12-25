export default class JitsiTrack {
  protected track?: any;

  private _containers: HTMLMediaElement[] = [];

  setTrack(track: any) {
    this.track = track;

    if (!this.track) return;

    for (const container of this._containers) {
      this.track.attach(container);
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
