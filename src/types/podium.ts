// Podiums (cycle, rotation, semaine, miss)
import type { IPagination } from "./common";

export interface IRankInfo {
  rank: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface IPodiumPlayer {
  rank: number;
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  score?: number; // Score individuel (si rotation spécifiée)
  raw_score?: number;
  is_differential?: boolean;
  averageScore?: number; // Moyenne des scores (si mode cycle en moyenne)
  totalScore?: number; // Somme des scores (si mode cycle en max)
  previousAverageScore?: number; // Moyenne au cycle précédent (classement progression)
  progression?: number; // Écart de moyenne avec le cycle précédent (classement progression)
  progressionPercent?: number; // Écart en % (classement progression)
  totalScores: number; // Nombre de scores pris en compte pour la moyenne
  totalRawScore?: number;
  avatar?: string;
  hasUser: boolean;
  username: string;
  guild_name?: string; // Nom de la guilde du joueur
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
  podium?: IPodiumPlayer[]; // Nouvelle API retourne podium
  data?: IPodiumPlayer[]; // Ancienne API retournait data
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

// Interfaces pour le podium weekly
export interface IPodiumWeeklyPlayer {
  rank: number;
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

// Interfaces pour le podium misses
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
