// Podiums (cycle, rotation, week, misses)
import type { IPagination } from "./common";
import type { ITopAchievement } from "./records";

export interface IRankInfo {
  rank: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface IPodiumPlayer {
  rank: number;
  top_achievement?: ITopAchievement | null; // Rarest achievement of the account
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  score?: number; // Single score (when a rotation is specified)
  raw_score?: number;
  is_differential?: boolean;
  averageScore?: number; // Average score (cycle mode, average ranking)
  totalScore?: number; // Sum of scores (cycle mode, total ranking)
  previousAverageScore?: number; // Average on the previous cycle (progression ranking)
  progression?: number; // Average change versus the previous cycle (progression ranking)
  progressionPercent?: number; // Change in % (progression ranking)
  totalScores: number; // Number of scores included in the average
  totalRawScore?: number;
  avatar?: string;
  hasUser: boolean;
  username: string;
  guild_name?: string; // Player's guild name
}

export interface IPodiumData {
  success: boolean;
  podium: IPodiumPlayer[];
  filters: {
    cycle_id: string;
    guild_id: string | null;
  };
  meta: {
    totalPlayers: number;
    cycleId: string;
    guildSpecific: boolean;
  };
}

export type PodiumRankingType = "average" | "max" | "progression";

export type PodiumType = "individual_scores" | "average_scores" | "max_scores" | "progression";

export interface IPodiumResponse {
  success: boolean;
  podium?: IPodiumPlayer[]; // Current API field
  data?: IPodiumPlayer[]; // Legacy API field
  pagination: IPagination;
  filters: {
    cycle_name: string;
    cycle_id: string;
    rotation_id: string | null;
    guild_name?: string;
    ranking_type?: PodiumRankingType | null;
  };
  meta: {
    totalPlayers: number;
    cycleName: string;
    rotationInfo?: {
      _id: string;
      position: number;
      killer: string;
      attack: string;
      start_date: string;
      end_date: string;
      period: string;
    };
    guildSpecific: boolean;
    fullPodium: boolean;
    podiumType: PodiumType;
    averageScore?: number;
    previousCycle?: { _id: string; name: string; year: number } | null;
  };
}

// Weekly podium
export interface IPodiumWeeklyPlayer {
  rank: number;
  top_achievement?: ITopAchievement | null;
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  guild_name?: string;
  week_total_score: number;
  rotation1_score: number;
  rotation2_score: number;
  avatar?: string;
  hasUser: boolean;
  username: string;
}

export interface IPodiumWeeklyResponse {
  success: boolean;
  data: IPodiumWeeklyPlayer[];
  pagination: IPagination;
  filters: {
    cycle_name: string;
    cycle_id: string;
    week_number: number;
    guild_name?: string;
  };
  meta: {
    weekNumber: number;
    rotationsInfo: Array<{
      position: number;
      killer: string;
      attack: string;
      start_date: string;
      end_date: string;
    }>;
    totalPlayers: number;
    averageWeekScore: number;
  };
}

// Misses podium
export interface IPodiumMissPlayer {
  rank: number;
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  guild_name?: string;
  total_misses: number;
  total_negative_score: number;
  missed_rotations: Array<{
    rotation_position: number;
    score: number;
  }>;
  avatar?: string;
  hasUser: boolean;
  username: string;
}

export interface IPodiumMissesResponse {
  success: boolean;
  data: IPodiumMissPlayer[];
  pagination: IPagination;
  filters: {
    cycle_name: string;
    cycle_id: string;
    guild_name?: string;
  };
  meta: {
    totalPlayersWithMisses: number;
    totalMissesInCycle: number;
    averageMissesPerPlayer: number;
  };
}
