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

export interface ICharacterSyncEntry {
  search_name: string;
  name: string;
}

export interface ICharacterSyncResult {
  message: string;
  dryRun?: boolean;
  statistics: {
    totalProcessed: number;
    inserted: number;
    updated: number;
    renamed: number;
    skipped: number;
    imagesChanged?: number;
    silhouettes?: number;
    imagesUploaded?: number;
  };
  preview?: {
    inserted: ICharacterSyncEntry[];
    renamed: (ICharacterSyncEntry & { previous: string })[];
    images: (ICharacterSyncEntry & { targets: string[] })[];
    duplicates: { search_name: string; count: number }[];
  };
}

// Game texts: one entry per language present in the game data (fr at least)
export type GameText = Partial<Record<string, string>>;

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
  hits: number;
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
  trap: boolean;
}

// Attack buttons of a unit, distances in game units and durations in milliseconds
export type AttackButton = "normal" | "heavy1" | "heavy2" | "heavy3" | "ex" | "extra_action";
export type IGameAttacks = Partial<Record<AttackButton, { cooldown: number | null; steps: IAttackStep[] }>>;

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
    duplicates: number;
    unmatched: number;
    ambiguous: number;
    banners?: number;
    newBanners?: number;
    legacyBanners?: number;
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

export interface ISkill {
  _id: string;
  name: string;
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
}
