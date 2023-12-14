import { Ref, ref } from "vue";
import { NoiseSuppressionEffect } from "./noise-suppression/NoiseSuppressionEffect";

declare const JitsiMeetJS: any;

export default abstract class Communication {
  private static domain: string = "fronddi.letz.dev";
  private static port: string = "4444";

  private static connection: any;
  private static room: any;

  private static selfVideoTrack: any;
  private static selfAudioTrack: any;

  public static selfVideo: Ref<boolean> = ref(false);
  public static selfAudio: Ref<boolean> = ref(true);
  public static selfMirror: Ref<boolean> = ref(true);

  public static mediaDevices: Ref<Object> = ref({});

  public static init(): void {
    JitsiMeetJS.init({
      'disableThirdPartyRequests': true,
      'enableAnalyticsLogging': false,
    });
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      (devices: Object) => {
        this.mediaDevices.value = devices;
        console.log(this.mediaDevices.value);
      }
    )
    
    this.connect();
  }

  private static connect(): void {
    this.connection = new JitsiMeetJS.JitsiConnection(
      null,
      null,
      {
        hosts: {
          domain: this.domain,
          muc: `conference.${this.domain}`,
        },
        serviceUrl: `https://${this.domain}:${this.port}/http-bind`,
      },
    );

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      () => { },
    );
    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      () => {},
    );
    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      () => {},
    );

    this.connection.connect();
  }

  public static join(roomId: string): void {
    if (!this.connection.xmpp.connection.connected) {
      this.connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        () => { this.join(roomId) },
      )
      return;
    }

    this.room = this.connection.initJitsiConference(
      roomId, {}
    );

    this.room.on(
      JitsiMeetJS.events.conference.TRACK_ADDED,
      () => {},
    );
    this.room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      () => {},
    );

    if (this.selfVideo.value) {
      this.getSelfVideoTrack().then((track: any) => {
        this.room.addTrack(track[0]);
      });
    }
    if (this.selfAudio.value) {
      this.getSelfAudioTrack().then((track: any) => {
        this.room.addTrack(track[0]);
      });
    }

    this.room.join();
  }

  private static getSelfVideoTrack() {
    if (!this.selfVideoTrack) {
      this.selfVideoTrack = JitsiMeetJS.createLocalTracks({
        devices: ["video"],
        facingMode: "user",
      });
    }
    return this.selfVideoTrack;
  }

  private static getSelfAudioTrack() {
    if (!this.selfAudioTrack) {
      this.selfAudioTrack = JitsiMeetJS.createLocalTracks({
        devices: ["audio"],
      });
    }
    this.selfAudioTrack.then((track: any) => {
      track[0].setEffect(new NoiseSuppressionEffect());
    })
    return this.selfAudioTrack;
  }

  public static toggleVideo(): void {
    if (this.selfVideo.value) {
      this.room.getLocalTracks().forEach((track: any) => {
        if (track.getType() === "video") {
          track.dispose();
          this.selfVideoTrack = undefined;
        }
      });
    }
    else {
      this.getSelfVideoTrack().then((track: any) => {
        this.room.addTrack(track[0]);
      });
    }
    this.selfVideo.value = !!this.selfVideoTrack;
  }

  public static toggleAudio(): void {
    if (this.selfAudio.value) {
      this.room.getLocalTracks().forEach((track: any) => {
        if (track.getType() === "audio") {
          track.dispose();
          this.selfAudioTrack = undefined;
        }
      });
    }
    else {
      this.getSelfAudioTrack().then((track: any) => {
        this.room.addTrack(track[0]);
      });
    }
    this.selfAudio.value = !!this.selfAudioTrack;
  }

  public static attachSelf(el: HTMLMediaElement): void {
    this.getSelfVideoTrack().then((track: any) => {
      track[0].attach(el);
    });
  }

  public static detachSelf(el: HTMLMediaElement): void {
    this.getSelfVideoTrack().then((track: any) => {
      track[0].detach(el);
      if (!track[0].conference) {
        track[0].dispose();
        this.selfVideoTrack = undefined;
      }
    });
  }
}
