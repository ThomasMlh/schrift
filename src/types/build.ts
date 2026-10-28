// Builds, accessories and guides
import type { GameText, ISkill } from "./character";
import type { IPagination } from "./common";
import type { IUser } from "./user";

// Accessory of the game, at its strongest version (5★+ when it exists) and max level, worn by a
// character of its affinity: values include that bonus (same_affinity_rate), null without affinity
export interface IAccessory {
  _id: string;
  name: string;
  names?: GameText | null;
  code?: string;
  rarity?: string;
  effect?: { type: string; values: number[]; base_values?: number[]; text: GameText | null } | null;
  same_affinity_rate?: number | null;
}

export interface IAccessorySubeffect {
  _id: string;
  name: string;
  names?: GameText | null;
  value?: number;
  // Without the affinity bonus, on an accessory that has no affinity
  base_value?: number;
  base_names?: GameText | null;
}

export interface IBuildAccessory {
  id_accessory: string;
  id_subeffect?: string;
  accessory?: IAccessory;
  subeffect?: IAccessorySubeffect;
}

export interface IBuildLink {
  id_character: string;
  character?: {
    _id: string;
    name: string;
    image?: string;
    rarity?: string;
    element?: string;
    affinity?: string;
    soul_traits?: string[];
  };
}

export interface IBuildTeamMember {
  id_character: string;
  position: number; // 1, 2 or 3
  links?: IBuildLink[];
  skills?: string[] | ISkill[]; // Ids or populated objects
  accessories?: IBuildAccessory[];
  character?: {
    _id: string;
    name: string;
    image?: string;
    rarity?: string;
    element?: string;
    affinity?: string;
  };
}

export interface IBuild {
  _id?: string;
  rotation_id: string;
  rotation?: {
    _id: string;
    killer: string;
    attack: string;
    alteration: string;
    start_date?: string;
    end_date?: string;
    cycle_id?: string;
  };
  description?: string;
  isValid: boolean;
  user_id?: string;
  user?: IUser;
  team: IBuildTeamMember[];
  score?: number | null; // Score obtained on the rotation with this build
  time_normal_wave?: number | null; // Normal wave time, in seconds (56.598)
  time_extra_wave?: number | null; // Extra wave time, in seconds
  screenshot?: string | null; // File name in bucket/builds/
  validated_at?: string;
  validated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IBuildsResponse {
  success: boolean;
  data: IBuild[];
  pagination: IPagination;
  filters: {
    rotation_id?: string | null;
    isValid?: boolean | null;
  };
}

export interface IGuideOrb {
  _id: string;
  title: string;
  description: string;
  amount: number;
}

export interface IOrbGuideResponse {
  success: boolean;
  data: IGuideOrb[];
  totalOrbes: number;
}

export interface IGuideAbilitySlot {
  _id: string;
  category: string;
  name: string;
  star1: string;
  star2: string;
  star3: string;
  order: number;
}

export interface IAbilitySlotsGuideResponse {
  data: IGuideAbilitySlot[];
}
