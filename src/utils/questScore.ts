// Nightmare guild quest score, checked to the point against in-game result screens
export const CLEAR_SCORE = 613_200_000;
export const POINTS_PER_SECOND = 100_000;
export const EX_TIME_LIMIT = 70;
export const TIME_BONUS_MAX = 1_536_000;
export const LEADER_BONUS_MAX = 614_400;
export const SUBS_BONUS_MAX = 409_600;
export const EX_BONUS_MAX = TIME_BONUS_MAX + LEADER_BONUS_MAX + SUBS_BONUS_MAX;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Seconds left on the EX waves, out of 70
export const timeBonus = (seconds: number) =>
  Math.ceil(TIME_BONUS_MAX * (1 - (1 - clamp(seconds, 0, EX_TIME_LIMIT) / EX_TIME_LIMIT) ** 3));

// Remaining stamina in percent; the subs count through their average
export const staminaBonus = (max: number, percent: number) =>
  Math.ceil(max * (1 - (1 - clamp(percent, 0, 100) / 100) ** 2.5));

export interface QuestRun {
  normalSeconds: number;
  exSeconds: number;
  leader: number;
  // Average stamina of the 2 subs, as the result screen gives it
  subs: number;
}

export const scoreBreakdown = (run: QuestRun) => {
  const parts = {
    clear: CLEAR_SCORE,
    normalTime: Math.round(Math.max(0, run.normalSeconds) * POINTS_PER_SECOND),
    exTime: timeBonus(run.exSeconds),
    leader: staminaBonus(LEADER_BONUS_MAX, run.leader),
    subs: staminaBonus(SUBS_BONUS_MAX, run.subs),
  };
  return {
    parts,
    exBonus: parts.exTime + parts.leader + parts.subs,
    total: Object.values(parts).reduce((sum, value) => sum + value, 0),
  };
};

// A loss expressed in seconds of normal waves, the unit that weighs the most
export const lossInSeconds = (points: number) => points / POINTS_PER_SECOND;
