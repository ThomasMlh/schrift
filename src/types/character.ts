// Characters and skills
import type { IPagination } from "./common";
import type { IUser } from "./user";

export interface ICharacter {
  _id: string;
  name: string;
  search_name?: string;
  affinity?: string;
  categories?: string[];
  killers?: string[];
  attack_type: string;
  image?: string;
  rarity?: string;
  element?: string;
  soul_traits?: string[];
  stats?: ICharacterStats;
  immunities?: string[];
  release_date?: string;
  resurrection_release?: string | null;
  // "<series>,<version>,<name>"
  version_name?: string;
  created_at?: string;
  updated_at?: string;
  source_images?: { quote_en?: string | null };
  // Bumped each time the bucket images are re-uploaded, used to bypass the browser cache
  images_version?: number;
  // Filled by the game tables sync
  game_id?: number;
  names?: GameText;
  game_version?: GameText | null;
  special?: GameText | null;
  profile?: GameText | null;
  base_stats?: ICharacterStats | null;
  traits?: IGameTraits;
  filter_types?: string[];
  resurrection?: IGameUnit | null;
  attacks?: IGameAttacks;
  is_growth_event?: boolean;
  quote?: GameText | null;
  banners?: { gacha_group_id: number; name: GameText | null; image_path: string | null; start_date: string | null; end_date: string | null }[];
}

// Filling of the bot character file (database.json) with the site ids and bucket URLs
export interface IBotDatabaseResult {
  dryRun: boolean;
  statistics: { rows: number; matched: number; matchedByIdentity: number; updated: number; unresolved: number; missing: number };
  fieldCounts: Record<string, number>;
  preview: {
    updated: { label: string; method: "id" | "search_name" | "identity"; fields: string[] }[];
    unresolved: { index: number; label: string; reason: "none" | "several" | "duplicate"; other?: string }[];
    missing: { _id: string; name: string; version: string | null }[];
  };
}

// Game texts: one entry per language present in the game data (fr at least)
export type GameText = Partial<Record<string, string>>;

// Game summon and what its tables tell (rates and the full list of units are not in them)
export interface ISummonMode {
  kind: "single" | "multiple";
  type: string | null;
  payment: string | null;
  price: number | null;
  draws: number;
  ticket_id: number | null;
}

export interface ISummonStep {
  number: number;
  price: number | null;
  draws: number;
  rarity_5: GameText | null;
  appeal: GameText | null;
  is_loop: boolean;
  badge: string | null;
}

export interface ISummonDetails {
  news_id: number | null;
  category: string | null;
  start_at: string | null;
  end_at: string | null;
  modes: ISummonMode[];
  steps: ISummonStep[];
  attention: GameText | null;
  featured: { game_id: number; badge: string | null }[];
  medal_shop: {
    name: GameText | null;
    start_date: string | null;
    end_date: string | null;
    products: { name: GameText | null; price: number | null; limit: number | null; type: string | null; content_id: number | null; amount: number | null }[];
  } | null;
}

export interface ISummonCharacter {
  _id: string;
  name: string;
  version?: string;
  version_name?: string;
  game_version?: GameText | null;
  game_id: number;
  affinity?: string;
}

export interface ISummon {
  _id: string;
  gacha_group_id: number;
  name: string | null;
  names?: GameText | null;
  start_date: string | null;
  end_date: string | null;
  character_game_ids?: number[];
  details?: ISummonDetails | null;
  characters: ISummonCharacter[];
}

export interface ITraitFilterCategory {
  id: number;
  label: GameText;
  priority: number;
  types: { type: string; label: GameText }[];
}

export interface IFilterGroups {
  link: ITraitFilterCategory[];
  ex: ITraitFilterCategory[];
  skill: ITraitFilterCategory[];
  special: { type: string; label: GameText }[];
  destruction: { type: string; label: GameText }[];
}

export interface IGameTrait {
  kind: "passive" | "tree" | "ex" | "link" | "destruction";
  type: string;
  value?: number | null;
  values?: number[] | null;
  ref?: string | null;
  // Soul trait only: its name, the text being its effect
  name?: GameText | null;
  // Elimination bonus only: enemies to defeat
  count?: number | null;
  text: GameText | null;
}

export interface IGameTraits {
  link: IGameTrait[];
  passive: IGameTrait[];
  tree: IGameTrait[];
  ex: IGameTrait[];
  destruction?: IGameTrait[];
}

export type AttackShape =
  | { kind: "sector"; radius: number | null; angle: number | null }
  | { kind: "rect"; width: number | null; length: number | null }
  | { kind: "circle"; radius: number | null; distance: number | null }
  | { kind: "projectile"; width: number | null; length: number | null; range: number | null; impact_radius: number | null };

export interface IAttackStep {
  step: number | null;
  // Second part of the same hit
  variant: number;
  power: number | null;
  weapon: number | null;
  // Unknown when the animations of the model were not extracted
  hits: number | null;
  knockdown: boolean;
  // Advanced strong attack (spiked button) and double strike
  advanced?: boolean;
  twice?: boolean;
  color: "R" | "B" | null;
  shape: AttackShape | null;
  statuses: { code: string; plus: boolean; name: GameText; probability: number | null; duration: number | null }[];
  status_probability: number | null;
  status_duration: number | null;
  heal: number | null;
  // target 1 = the character, 2 = the whole party
  buff: { target: number | null; atk: number | null; def: number | null; crt: number | null; sp: number | null; duration: number | null } | null;
  barrier: boolean;
  revival: boolean;
  // Area left on the ground that hits several times (vortex...): blasts, ms between them, total ms
  trap: { hits: number | null; interval: number | null; duration: number | null; homing: boolean; delay: number | null } | null;
}

export interface IStatusBonus {
  duration: number;
  probability: number;
  // belong: enemy categories (null = every one), affinity: enemy affinity (null = any)
  conditional: { value: number; belong: string[] | null; affinity: string | null }[];
}

// Attack buttons of a unit, distances in game units and durations in milliseconds
export type AttackButton = "normal" | "heavy1" | "heavy2" | "heavy3" | "ex" | "extra_action";
// hits: total of a strong attack whose steps share one animation, when it cannot be shared out.
// range_bonus: percent the unit's abilities widen the areas (already applied to the shapes);
// hit_bonus: extra hits given by its soul tree
export type IGameAttacks = Partial<Record<AttackButton, {
  cooldown: number | null;
  hits?: number | null;
  range_bonus?: number | null;
  hit_bonus?: number | null;
  // Status abilities of the unit: extra duration (ms) and chance (percent), and chances against some enemies only
  status_bonus?: IStatusBonus | null;
  steps: IAttackStep[];
}>>;

export interface IGameUnit {
  game_id: number;
  release_date: string | null;
  stats: ICharacterStats | null;
  traits: IGameTraits;
  attacks?: IGameAttacks;
}

export interface IGameSyncEntry {
  _id: string | null;
  game_id: number | null;
  name: string;
  version: string | null;
}

export interface IGameSyncResult {
  dryRun: boolean;
  languages: string[];
  statistics: {
    linked: number;
    firstLinks: number;
    updated: number;
    created: number;
    newImages: number;
    // Summon visuals to copy from the game files
    bannerImages?: number;
    duplicates: number;
    unmatched: number;
    ambiguous: number;
    banners?: number;
    newBanners?: number;
    legacyBanners?: number;
    accessories?: number;
    newAccessories?: number;
    // Accessories and sub-effects entered on the site, replaced by the game ones
    legacyAccessories?: number;
    accessoryImages?: number;
    skills?: number;
    newSkills?: number;
    // Bonus skills entered on the site, replaced by the game bonus abilities
    legacySkills?: number;
    // Models whose animations gave the hits of melee attacks (attack_hits.csv)
    attackHitModels?: number;
  };
  fieldCounts: Record<string, number>;
  preview: {
    created: IGameSyncEntry[];
    updated: (IGameSyncEntry & { changes: string[] })[];
    duplicates: { game_id: number; keep_id: string; merge_ids: string[] }[];
    unmatched: IGameSyncEntry[];
    ambiguous: (IGameSyncEntry & { candidates: number[] })[];
  };
  merged?: { keep_id: string; merged_id: string; albums: number; builds: number }[];
}

export interface ICharacterStats {
  end: string;
  atk: string;
  def: string;
  cct: string;
  pre: string;
}

export interface ICharactersResponse {
  data: ICharacter[];
  pagination: IPagination;
}

// Bonus skill of a build: a bonus ability of the game, at the value the game shows
export interface ISkill {
  _id: string;
  name: string;
  names?: GameText | null;
  value?: number | null;
  format?: "percent" | "plus" | null;
  description?: string;
  icon?: string;
}

// Character album of a bbs account: <character _id> -> spec (1 once owned, up to 5)
export interface IAlbum {
  bbs_id: string;
  characters: Record<string, number>;
  updated_at: string | null;
}

// Guild account with its album; characters is null when the account never filled it
export interface IGuildAlbumMember extends IUser {
  characters: Record<string, number> | null;
}

// Lightweight character catalog entry used by the album grid
export interface IAlbumCharacter {
  _id: string;
  name: string;
  search_name?: string;
  version?: string;
  affinity?: string;
  attack_type?: string;
  killers?: string[];
  categories?: string[];
  // Game ability types by filter group (link, ex, skill, special, destruction)
  filters?: Record<string, string[]>;
}
