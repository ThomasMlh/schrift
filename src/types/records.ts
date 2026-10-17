// Killer records and achievements

// Holder of a record on a killer (GET /api/rotations/:id/history)
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
  record_to_beat: IKillerRecordHolder | null; // Best score of the OTHER cycles (guild scope when filtered)
  current_cycle_best: IKillerRecordHolder | null;
  per_cycle: IRotationHistoryCycle[];
}

// Personal record of a bbs account on a killer (GET /api/users/:userId/records)
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

// Achievements (computed by the API from scores)
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementCategory = "scores" | "records" | "regularity" | "progression" | "podium" | "versatility";

export type AchievementUnit = "count" | "score" | "billions" | "percent" | "flag";

export interface IAchievementTierState {
  tier: AchievementTier;
  threshold: number;
  unlocked_at: number | null; // Timestamp (ms) of the rotation or cycle that unlocked it
  rarity: number; // % of accounts that unlocked it
}

export interface IAchievement {
  code: string;
  name?: string; // French name (Discord, bot)
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

// Rarest achievement of an account, shown next to the name in rankings
export interface ITopAchievement {
  code: string;
  name: string;
  tier: AchievementTier;
  rarity: number;
}
