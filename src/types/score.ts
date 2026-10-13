// Scores, declines and score control
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

// Declines (leader/admin area): latest scores compared with the player's usual level on the same killers
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

// Score control (leader/admin area): scores to review and change history
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

// Missing scores of a cycle for a guild's current members (leader area)
export interface IMissingScoreMember {
  user_id: string;
  bbs_id: string;
  bbs_name: string | null;
  global_name: string | null;
}

export interface IMissingScoreRotation {
  rotation_id: string;
  position: number;
  start_date: string | null;
  end_date: string | null;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  is_differential: boolean;
  missing: IMissingScoreMember[];
}

export interface IMissingScoresResponse {
  success: boolean;
  cycle: { _id: string; name: string; year: number } | null;
  members_count: number;
  rotations: IMissingScoreRotation[];
}

// Rotation preparation sheet: each member's history on the killer
export interface IPreparationMember {
  user_id: string;
  bbs_id: string;
  bbs_name: string | null;
  global_name: string | null;
  attempts: number;
  best: number | null;
  average: number | null;
  last: { score: number; cycle_name: string | null; cycle_year: number | null } | null;
  this_cycle: number | null;
}

export interface IRotationPreparation {
  success: boolean;
  cycle: { _id: string; name: string; year: number };
  rotation: {
    rotation_id: string;
    position: number;
    start_date: string | null;
    end_date: string | null;
    killer: string | null;
    attack: string | null;
    alteration: string | null;
  };
  killer_stats: { attempts: number; average: number | null; record: number | null };
  members: IPreparationMember[];
}


// Bulk entry references of an account (GET /scores/bulk-context)
export interface BulkEntryReference {
  usual_score: number | null;
  base_raw: number | null;
}

// Bulk entry alert thresholds (same as the score review tool)
export interface BulkEntryThresholds {
  above: number;
  below: number;
}
