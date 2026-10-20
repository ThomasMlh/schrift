// Cycles, rotations and end-of-cycle recap
import type { IPagination } from "./common";

export interface IRotationTemplate {
  _id: string;
  killer: string;
  attack: string;
  alteration: string;
}

export interface ICycleRotation {
  _id?: string;
  start_date: string; // DD/MM/YYYY
  end_date: string; // DD/MM/YYYY
  period: "Mardi-Jeudi" | "Vendredi-Dimanche";
  killer: string;
  attack: string;
  alteration: string;
  position: number;
  rotation_id: string;
}

export interface ICycle {
  _id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  rotations: ICycleRotation[];
  year: number;
  // Leaders/officers can no longer change this cycle's scores (admins still can)
  scores_locked?: boolean;
}

export interface ICycleFormData {
  name: string;
  rotations: ICycleRotation[];
}

export interface ICyclesResponse {
  success: boolean;
  data: ICycle[];
  pagination: IPagination;
}

export interface IEvent {
  cycleName: string;
  rotationNumber: number;
  killer: string;
  attack: string;
  alteration: string;
  start_date: string;
  end_date: string;
  period: string;
}

// End-of-cycle recap of a guild (preview before publishing on Discord)
export interface ICycleRecap {
  guild_name: string;
  cycle_name: string;
  cycle_year: number;
  previous_cycle_name: string | null;
  participants: number;
  top3: { rank: number; pseudo: string; average: number }[];
  records_count: number;
  records: { pseudo: string; killer: string; attack: string; previous_score: number; new_score: number }[];
  best_progression: { pseudo: string; previous_average: number; average: number; percent: number } | null;
  guild_average: number | null;
  previous_guild_average: number | null;
}
