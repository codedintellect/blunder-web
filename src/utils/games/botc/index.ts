import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../../supabase";
import { Ref, ref } from "vue";

export class Session {
  private presence: any = {};
  private room!: RealtimeChannel;

  public state: Ref<any> = ref<any>({});

  constructor(sessionId: string, keyOverride?: string) {
    this.connect(sessionId, keyOverride);
  }

  connect(sessionId: string, keyOverride?: string) {
    this.room = supabase.channel(sessionId, {
      config: {
        presence: {
          key: keyOverride ?? undefined,
        },
      },
    });

    this.room
      .on('presence', { event: 'sync' }, () => {
        // Expanding to clone (to force update ref)
        this.state.value = { ...this.room.presenceState() };
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        this.room.track(this.presence);
      });

    return this;
  }
}