import { Ref, ref } from "vue";

import JitsiUser from "./classes/User";
import MediaControl from "./classes/MediaControl";

declare const JitsiMeetJS: any;

export default abstract class Communication {
  private static domain: string = "fronddi.letz.dev";
  private static port: string = "4444";

  private static connection: any;
  public static room: any;

  public static users: Ref<Map<string, JitsiUser>> = ref(new Map());
  public static self: Ref<JitsiUser | undefined> = ref();

  public static init(): void {
    JitsiMeetJS.init({
      'disableThirdPartyRequests': true,
      'enableAnalyticsLogging': false,
    });
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

    MediaControl.init();
    
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
      () => { console.log(JitsiMeetJS); },
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
      (track: any) => {
        if (track.isLocal()) return;
        console.log("TRACK ADDED");
        this.users.value.get(track.getParticipantId())?.setTrack(track);
      },
    );

    this.room.on(
      JitsiMeetJS.events.conference.TRACK_REMOVED,
      (track: any) => {
        let user = this.users.value.get(track.ownerEndpointId);
        user?.getTrack(track.getType())?.setTrack(undefined);
        track.dispose();
      },
    );

    this.room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      () => {
        this.self.value = new JitsiUser(this.room.myUserId(), this.room);
        this.users.value.set(this.room.myUserId(), this.self.value);
      },
    );

    this.room.on(
      JitsiMeetJS.events.conference.USER_JOINED,
      (userId: any) => {
        this.users.value.set(userId, new JitsiUser(userId, this.room));
        console.log("JOIN:", this.room.myUserId());
      }
    )

    this.room.join();
  }
}
