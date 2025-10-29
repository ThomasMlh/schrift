// Types généraux
export type Page = "guilds" | "characters";
export type AdminPage = "guilds" | "cycles" | "scores";
export type Role = "chef" | "sous-chef" | "membre";

// Interfaces Guildes
export interface Guild {
    _id: string;
    name: string;
}

export interface GuildAPI extends Guild {
    members: User[];
}

// Interfaces Utilisateurs
export interface User {
    _id: string;
    userId?: string;
    username: string;
    discordId?: string;
    global_name: string;
    avatar?: string;
    discord_id?: string;
    guilde_id: string;
    role: Role;
    isAdmin?: boolean;
    [key: string]: any;
}

// Interfaces Personnages
export interface Character {
    _id: string;
    name: string;
    search_name?: string;
    affinity?: string;
    categories?: string[];
    killers?: string[];
    link?: string; // URL de l'image
    [key: string]: any; // Pour les autres propriétés
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
    itemsOnPage: number;
}

export interface CharactersResponse {
    data: Character[];
    pagination: Pagination;
    searchTerm?: string;
    affinity?: string;
    category?: string;
    killer?: string;
}

// Interfaces Cycles et Rotations
export interface RotationTemplate {
    _id: string;
    killer: string;
    attack: string;
    alteration: string;
}

export interface CycleRotation {
    _id: string;
    start_date: string; // Format DD/MM/YYYY
    end_date: string;   // Format DD/MM/YYYY
    period: "Mardi-Jeudi" | "Vendredi-Dimanche";
    killer: string;
    attack: string;
    alteration: string;
}

export interface Cycle {
    _id?: string;
    name: string;
    rotations: CycleRotation[]; // Exactement 20 rotations
}

export interface CycleFormData {
    name: string;
    rotations: CycleRotation[];
}

export interface CyclesResponse {
    success: boolean;
    data: Cycle[];
    pagination: Pagination;
}

// Interfaces Scores
export interface Score {
    _id?: string;
    user_id: string;
    cycle_id: string;
    rotation_id: string;
    guild_id: string;
    score: number;
    created_at?: string;
    updated_at?: string;
}

export interface ScoreFormData {
    user_id: string;
    cycle_id: string;
    rotation_id: string;
    guild_id: string;
    score: number;
}

export interface ScoresResponse {
    data: Score[];
    pagination: Pagination;
}