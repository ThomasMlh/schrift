// Builds, accessoires et guides
import type { ISkill } from "./character";
import type { IPagination } from "./common";
import type { IUser } from "./user";

// Interfaces pour les accessories
export interface IAccessory {
  _id: string;
  name: string;
  code?: string;
}

export interface IAccessorySubeffect {
  _id: string;
  name: string;
}

export interface IBuildAccessory {
  id_accessory: string;
  id_subeffect?: string;
  accessory?: IAccessory;
  subeffect?: IAccessorySubeffect;
}

// Interfaces pour les builds/teams
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
  position: number; // 1, 2 ou 3
  links?: IBuildLink[];
  skills?: string[] | ISkill[]; // Array d'IDs ou d'objets enrichis
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
