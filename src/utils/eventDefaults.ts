import type { IGoalSettings, IHuntSettings } from "@/interfaces";

// Settings of a new event's activities, the same as the API defaults
export const DEFAULT_HUNT: IHuntSettings = { enabled: false, points: 3, tickets: 1, badge_name: null, badge_min: 10 };
export const DEFAULT_GOAL: IGoalSettings = { enabled: false, weights: { score: 1, advent: 3, quiz: 10, gift: 3 }, tiers: [] };
