import type { AchievementCategory, AchievementTier, AchievementUnit, ITopAchievement, IUserAccountAchievements } from "@/interfaces";

// Achievement display metadata: category order and icon of each achievement. Texts live in the
// translation files (achievements.<code>.name / .description).

export const CATEGORY_ORDER: AchievementCategory[] = ["scores", "records", "regularity", "progression", "podium", "versatility"];

export const TIER_ORDER: AchievementTier[] = ["bronze", "silver", "gold", "platinum"];

// Icon paths (viewBox 24, stroke only), drawn at the center of the badges
export const ICON_PATHS: Record<string, string> = {
  sprout: '<path d="M12 21v-9"/><path d="M12 12C12 7.5 8.5 5 4 5c0 4.5 3 7 8 7z"/><path d="M12 10c0-4 3-6.5 8-6.5 0 4.5-3 6.5-8 6.5z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
  calendarCheck: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15l2 2 4-4"/>',
  gem: '<path d="M6.5 3.5h11l3.5 5.5-9 11.5L3 9l3.5-5.5z"/><path d="M3 9h18M12 20.5 8.5 9l3.5-5.5L15.5 9 12 20.5"/>',
  sparkles: '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  coins: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6"/><path d="M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 21.5l5-3 5 3-1.5-7.5"/>',
  shieldStar: '<path d="M12 2.5 20 6v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6z"/><path d="M12 8l1.2 2.5 2.8.4-2 1.9.5 2.7L12 14.2l-2.5 1.3.5-2.7-2-1.9 2.8-.4z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  cycle: '<path d="M19.5 11A7.5 7.5 0 0 0 6 7"/><path d="M5 3.5V7.5h4"/><path d="M4.5 13A7.5 7.5 0 0 0 18 17"/><path d="M19 20.5v-4h-4"/>',
  flame: '<path d="M12 2.5c.8 3.6 5 5.7 5 10.5a5 5 0 0 1-10 0c0-2.6 1.6-3.8 2-6.3 1.6 1 2.6 2.6 2.6 4.5 1.2-1.9.8-5.5.4-8.7z"/>',
  infinity: '<path d="M6.5 8.5C4 8.5 2.5 10.2 2.5 12s1.5 3.5 4 3.5S12 12 12 12s3-3.5 5.5-3.5 4 1.7 4 3.5-1.5 3.5-4 3.5S12 12 12 12 9 8.5 6.5 8.5z"/>',
  shieldHeart: '<path d="M12 2.5 20 6v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6z"/><path d="M12 15.5s-3.5-2.1-3.5-4.4a1.8 1.8 0 0 1 3.5-.8 1.8 1.8 0 0 1 3.5.8c0 2.3-3.5 4.4-3.5 4.4z"/>',
  comeback: '<path d="M3.5 4v5.5H9"/><path d="M4 9.5A8.5 8.5 0 1 1 6.5 18"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  sunrise: '<path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 4v4M5 9.5l2 2M19 9.5l-2 2M3 18h18M6 21.5h12"/>',
  rocket: '<path d="M13.5 4.5C16.5 3 20.5 3.5 20.5 3.5s.5 4-1 7l-7 7-5-5z"/><path d="M9.5 10.5H6l-2.5 3 4 1M13.5 14.5V18l-3 2.5-1-4"/><path d="M5.5 17c-1.5 1-2 3.5-2 3.5s2.5-.5 3.5-2"/>',
  trophy: '<path d="M8 3.5h8v5.5a4 4 0 0 1-8 0V3.5z"/><path d="M16 5h3v1.5a3 3 0 0 1-3 3M8 5H5v1.5a3 3 0 0 0 3 3M12 13v4M8.5 20.5h7M9.5 17h5"/>',
  flag: '<path d="M5 21.5V3.5"/><path d="M5 4h12.5l-2.5 4 2.5 4H5"/>',
  layers: '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="M2.5 12.5 12 17.5l9.5-5M2.5 17 12 22l9.5-5"/>',
  crown: '<path d="M3 8l4.5 4 4.5-7 4.5 7L21 8l-2 10H5L3 8z"/><path d="M5 21h14"/>',
  king: '<path d="M12 2.5v4M10 4.5h4"/><path d="M7 12.5c-1.6-1-2.1-3-1-4.3 1.2-1.4 3.6-.9 6 1.6 2.4-2.5 4.8-3 6-1.6 1.1 1.3.6 3.3-1 4.3"/><path d="M7 12.5h10l-1 6.5H8z"/><path d="M6.5 21.5h11"/>',
  swords: '<path d="M4 4l9 9M4 4h4M4 4v4M20 4l-9 9M20 4h-4M20 4v4M7 17l-3 3M17 17l3 3M9.5 14.5l-3 3M14.5 14.5l3 3"/>',
  calendarStar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path d="M12 12.2l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z"/>',
  lock: '<path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2"/>',
};

export const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_step: "sprout",
  clear: "bolt",
  perfect_score: "star",
  perfect_week: "calendarCheck",
  exceptional_cycle: "gem",
  immaculate_cycle: "sparkles",
  billionaire: "coins",
  outdone: "target",
  reference: "award",
  living_legend: "shieldStar",
  veteran: "calendar",
  diligent: "clock",
  full_cycle: "cycle",
  flawless: "flame",
  unstoppable: "infinity",
  loyal: "shieldHeart",
  comeback: "comeback",
  improving: "trend",
  revelation: "sunrise",
  on_a_roll: "rocket",
  podium: "trophy",
  leader: "flag",
  elite: "layers",
  number_one: "crown",
  week_king: "king",
  player_of_month: "calendarStar",
  versatile: "swords",
};

// Human-readable value or threshold for the achievement's unit
export const formatAchievementValue = (value: number, unit: AchievementUnit): string => {
  switch (unit) {
    case "score":
      return value.toLocaleString("fr-FR");
    case "billions":
      return `${(value / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Md`;
    case "percent":
      return `${value > 0 ? "+" : ""}${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
    default:
      return value.toLocaleString("fr-FR");
  }
};

// Rarest achievement unlocked by an account (highest level on ties), in the same shape as the
// one returned by the podium.
export const findTopAchievement = (
  accounts: IUserAccountAchievements[],
  bbsId?: string
): ITopAchievement | null => {
  const account = accounts.find((a) => a.bbs_id === bbsId) ?? accounts.find((a) => a.is_primary) ?? accounts[0];
  let best: ITopAchievement | null = null;
  for (const achievement of account?.achievements ?? []) {
    for (const tier of achievement.tiers) {
      if (tier.unlocked_at == null) continue;
      const isRarer = !best
        || tier.rarity < best.rarity
        || (tier.rarity === best.rarity && TIER_ORDER.indexOf(tier.tier) > TIER_ORDER.indexOf(best.tier));
      if (isRarer) best = { code: achievement.code, name: achievement.name ?? "", tier: tier.tier, rarity: tier.rarity };
    }
  }
  return best;
};
