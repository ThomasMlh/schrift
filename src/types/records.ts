// Records par killer et succès

// Auteur d'un record sur un killer (GET /api/rotations/:id/history)
export interface IKillerRecordHolder {
  score: number;
  bbs_id: string;
  bbs_name: string | null;
  guild_id: string | null;
  guild_name: string | null;
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
}

export interface IRotationHistoryCycle {
  cycle_id: string;
  cycle_name: string;
  cycle_year: number;
  average: number | null;
  count: number;
  guild_average: number | null;
  guild_count: number | null;
}

export interface IRotationHistory {
  rotation_id: string;
  absolute_record: IKillerRecordHolder | null;
  guild_record: IKillerRecordHolder | null;
  record_to_beat: IKillerRecordHolder | null; // meilleur score des AUTRES cycles (périmètre guilde si filtrée)
  current_cycle_best: IKillerRecordHolder | null;
  per_cycle: IRotationHistoryCycle[];
}

// Record personnel d'un compte bbs sur un killer (GET /api/users/:userId/records)
export interface IAccountKillerRecord {
  rotation_id: string;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  score: number;
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
  attempts: number;
}

export interface IUserAccountRecords {
  bbs_id: string;
  bbs_name: string | null;
  is_primary: boolean;
  records: IAccountKillerRecord[];
}

// Succès (calculés côté API à partir des scores)
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementCategory = "scores" | "records" | "regularity" | "progression" | "podium" | "versatility";

export type AchievementUnit = "count" | "score" | "billions" | "percent" | "flag";

export interface IAchievementTierState {
  tier: AchievementTier;
  threshold: number;
  unlocked_at: number | null; // timestamp (ms) de la rotation ou du cycle qui l'a débloqué
  rarity: number; // % des comptes l'ayant débloqué
}

export interface IAchievement {
  code: string;
  category: AchievementCategory;
  unit: AchievementUnit;
  value: number;
  current_tier: AchievementTier | null;
  next_tier: { tier: AchievementTier; threshold: number } | null;
  tiers: IAchievementTierState[];
}

export interface IUserAccountAchievements {
  bbs_id: string;
  bbs_name: string | null;
  is_primary: boolean;
  achievements: IAchievement[];
}
