// Scores, baisses de régime et contrôle des scores
import type { IPagination } from "./common";
import type { ICycle, IRotationTemplate } from "./cycle";
import type { IUser } from "./user";

export interface IScore {
  _id?: string;
  user_id: string;
  bbs_id: string;
  bbs_name?: string | null;
  cycle_id: string;
  rotation_id: string;
  guild_id: string;
  score: number;
  raw_score: number;
  is_differential?: boolean;
  rank?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IScoreWithUser
  extends Omit<IScore, "cycle_id" | "rotation_id" | "guild_id" | "raw_score"> {
  _id: string;
  user: IUser;
  created_at: string;
  rank: number;
}

export interface IScoreFormData {
  user_id: string;
  bbs_id: string;
  cycle_id: string;
  rotation_id: string;
  guild_id: string;
  raw_score?: number;
  score?: number;
}

export interface IScoresResponse {
  data: IScore[];
  pagination: IPagination;
}

export interface IScoreDetailApiResponse {
  success: boolean;
  data: IScoreWithUser[];
  cycle: ICycle | null;
  rotation: IRotationTemplate | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Baisses de régime (espace chefs/admins) : derniers scores comparés à l'habitude du joueur
// sur les mêmes killers
export interface IDeclineSample {
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
  rotation_id: string;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  score: number;
  usual: number;
}

export interface IDeclineAlert {
  bbs_id: string;
  bbs_name: string | null;
  user_id: string;
  discord_id?: string;
  global_name?: string;
  avatar?: string;
  guild_id: string;
  guild_name: string | null;
  ratio: number;
  drop_percent: number;
  samples: IDeclineSample[];
}

// Contrôle des scores (espace chefs/admins) : scores à vérifier et historique des modifications
export type ScoreAnomalyType = "above_killer_record" | "far_above_usual" | "far_below_usual" | "missing_base" | "same_value";

export interface IScoreAnomaly {
  score_id: string;
  bbs_id: string;
  bbs_name: string | null;
  user_id: string | null;
  guild_id: string;
  guild_name: string | null;
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
  rotation_id: string;
  rotation_position: number | null;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  score: number;
  raw_score: number;
  is_differential: boolean;
  issues: { type: ScoreAnomalyType; reference?: number; with?: string[] }[];
}

export type ScoreHistoryAction = "create" | "update" | "delete" | "transfer_account" | "transfer_rotation" | "recalculate";

export interface IScoreSnapshot {
  score?: number;
  raw_score?: number;
  is_differential?: boolean;
  bbs_id?: string;
  bbs_name?: string | null;
  guild_id?: string;
  rotation_id?: string;
  cycle_id?: string;
}

export interface IScoreHistoryEntry {
  _id: string;
  score_id: string | null;
  action: ScoreHistoryAction;
  source: string;
  bbs_id: string | null;
  bbs_name: string | null;
  guild_id: string | null;
  guild_name: string | null;
  cycle_id: string | null;
  cycle_name: string | null;
  cycle_year: number | null;
  rotation_id: string | null;
  rotation_position: number | null;
  killer: string | null;
  attack: string | null;
  before: IScoreSnapshot | null;
  after: IScoreSnapshot | null;
  by_user_id: string | null;
  by_name: string | null;
  created_at: string;
}
