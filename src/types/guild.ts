// Guilds
import type { NotificationType } from "./common";

export interface IGuild {
  _id: string;
  name: string;
  disabled?: boolean;
  discord_channel_id?: string; // Leaders' channel (restricted access)
  discord_general_channel_id?: string; // General channel, all members
  disabled_notification_types?: NotificationType[];
}

// Guild goals on a cycle
export type GuildGoalType = "average" | "clear_rate" | "records" | "participation";

export interface IGuildGoal {
  type: GuildGoalType;
  unit: "score" | "percent" | "count";
  target: number;
  value: number | null;
  progress: number;
  achieved: boolean;
}

export interface IGuildGoalsResponse {
  success: boolean;
  cycle: { _id: string; name: string; year: number } | null;
  goals: IGuildGoal[];
  updated_at: string | null;
  updated_by: string | null;
}

