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

  public static mediaDevices: Ref<MediaDeviceInfo[]> = ref([]);
  public static defaultVideo: Ref<string> = ref('');
  public static defaultAudio: Ref<string> = ref('');
  public static defaultOutput: Ref<string> = ref('');

  public static init(): void {
    JitsiMeetJS.init({
      'disableThirdPartyRequests': true,
      'enableAnalyticsLogging': false,
    });
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      (devices: MediaDeviceInfo[]) => {
        this.mediaDevices.value = devices;
        this.defaultOutput.value =
          JitsiMeetJS.mediaDevices.getAudioOutputDevice();
      }
    )

    console.log(JitsiMeetJS.events);
    
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
      () => {},
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
        cameraDeviceId: this.defaultVideo.value,
      });
      this.selfVideoTrack.then((track: any) => {
        this.defaultVideo.value = track[0].deviceId;
      });
    }
    return this.selfVideoTrack;
  }

  private static getSelfAudioTrack() {
    if (!this.selfAudioTrack) {
      this.selfAudioTrack = JitsiMeetJS.createLocalTracks({
        devices: ["audio"],
        micDeviceId: this.defaultAudio.value,
      });
      this.selfAudioTrack.then((track: any) => {
        this.defaultAudio.value = track[0].deviceId;
        //track[0].setEffect(new NoiseSuppressionEffect());
      })
    }
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
    if (el.tagName === 'VIDEO') {
      this.getSelfVideoTrack().then((track: any) => {
        track[0].attach(el);
      });
    }
    else if (el.tagName === 'AUDIO') {
      this.getSelfAudioTrack().then((track: any) => {
        track[0].attach(el);
      });
    }
  }

  public static detachSelf(el: HTMLMediaElement): void {
    if (el.tagName === 'VIDEO') {
      this.getSelfVideoTrack().then((track: any) => {
        track[0].detach(el);
        if (!track[0].conference) {
          track[0].dispose();
          this.selfVideoTrack = undefined;
        }
      });
    }
    else if (el.tagName === 'AUDIO') {
      this.getSelfAudioTrack().then((track: any) => {
        track[0].detach(el);
        if (!track[0].conference) {
          track[0].dispose();
          this.selfAudioTrack = undefined;
        }
      });
    }
  }

  public static selfVolumeMonitor(el: any): void {
    this.getSelfAudioTrack().then((track: any) => {
      if (!el.fn) {
        el.fn = (level: Number) => {
          el.style.setProperty('--usage', level);
        }
        track[0].on(
          JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, el.fn
        );
      }
      else {
        track[0].off(
          JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, el.fn
        );
      }
    });
  }

  public static changeDevice(deviceId: string, kind: string) {
    console.log(kind, deviceId);
    switch (kind) {
      case "videoinput": {
        this.getSelfVideoTrack().then((track: any) => {
          this.defaultVideo.value = deviceId;
          track[0].dispose();
          this.selfVideoTrack = undefined;
          this.getSelfVideoTrack();
        });
        break;
      }
      case "audioinput": {
        this.getSelfAudioTrack().then((track: any) => {
          this.defaultAudio.value = deviceId;
          track[0].dispose();
          this.selfAudioTrack = undefined;
          this.getSelfAudioTrack();
        });
        break;
      }
      case "audiooutput": {
        break;
      }
    }
  }
}
