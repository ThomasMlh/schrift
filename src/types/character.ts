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
  banner_id?: string;
  resurrection_release?: string;
  created_at?: string;
  updated_at?: string;
  source_images?: { quote_en?: string | null };
  // Bumped each time the bucket images are re-uploaded, used to bypass the browser cache
  images_version?: number;
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
