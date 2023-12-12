import { NoiseSuppressionEffect } from "./noise-suppression/NoiseSuppressionEffect";

declare const JitsiMeetJS: any;

export default abstract class Communication {
  private static domain: string = "fronddi.letz.dev";
  private static port: string = "4444";

  private static connection: any;
  private static room: any;

  public static init(): void {
    JitsiMeetJS.init({
      'disableThirdPartyRequests': true,
      'enableAnalyticsLogging': false,
    });
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
    
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

    JitsiMeetJS.createLocalTracks({
      devices: ["video", "audio"],
    }).then((tracks: any) => {
      tracks.forEach((track: any) => {
        if (track["type"] === "audio") {
          track.setEffect(new NoiseSuppressionEffect());
        }
        this.room.addTrack(track);
      });
    });

    this.room.join();
  }
}