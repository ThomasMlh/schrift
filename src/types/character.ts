// Personnages et compétences
import type { IPagination } from "./common";

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
  banner_id?: string;
  resurrection_release?: string;
  created_at?: string;
  updated_at?: string;
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

// Interface pour les skills
export interface ISkill {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}
