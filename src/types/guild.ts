// Guildes
import type { NotificationType } from "./common";

export interface IGuild {
  _id: string;
  name: string;
  disabled?: boolean;
  discord_channel_id?: string; // salon "chef" (accès restreint)
  discord_general_channel_id?: string; // salon général, tous les membres
  disabled_notification_types?: NotificationType[];
}
