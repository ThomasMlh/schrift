// Types généraux
export type Page = "guilds" | "characters";
export type AdminPage = "guilds" | "cycles" | "scores" | "users";
export type Role = "chef" | "sous-chef" | "membre";

export interface Guild {
    _id: string;
    name: string;
}

export interface User {
    _id: string;
    userId?: string;
    username: string;
    discordId?: string;
    global_name: string;
    avatar?: string;
    discord_id?: string;
    guilde_id?: string;
    role: Role;
    isAdmin?: boolean;
    bbs_id?: string;
    bbs_name?: string;
    [key: string]: any;
}

export interface Character {
    _id: string;
    name: string;
    search_name?: string;
    affinity?: string;
    categories?: string[];
    killers?: string[];
    link?: string;
    [key: string]: any; 
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
}

export interface UsersResponse {
    success: boolean;
    users: User[];
    pagination: Pagination;
    activeFilters?: {
        guilde_id?: string | null;
        role?: string | null;
        search?: string | null;
    };
}

export interface RotationTemplate {
    _id: string;
    killer: string;
    attack: string;
    alteration: string;
}

export interface CycleRotation {
    _id?: string;
    start_date: string; // Format DD/MM/YYYY
    end_date: string;   // Format DD/MM/YYYY
    period: "Mardi-Jeudi" | "Vendredi-Dimanche";
    killer: string;
    attack: string;
    alteration: string;
    position: number;
    rotation_id: string;
}

export interface Cycle {
    _id?: string;
    name: string;
    created_at?: string;
    updated_at?: string;
    isActive?: boolean;
    rotations: CycleRotation[];
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

export interface Score {
    _id?: string;
    user_id: string;
    cycle_id: string;
    rotation_id: string;
    guild_id: string;
    score: number;
    raw_score: number;
    rank?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ScoreWithUser extends Omit<Score, 'cycle_id' | 'rotation_id' | 'guild_id' | 'raw_score'> {
    _id: string; 
    user: User;
    created_at: string; 
    rank: number;
}

export interface ScoreFormData {
    user_id: string;
    cycle_id: string;
    rotation_id: string;
    guild_id: string;
    raw_score: number;
}

export interface ScoresResponse {
    data: Score[];
    pagination: Pagination;
}

export interface ScoreDetailApiResponse {
    success: boolean;
    data: ScoreWithUser[];
    cycle: string;
    rotation: RotationTemplate | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface RankInfo {
    rank: number;
    color: string;
    bgColor: string;
    borderColor: string;
}

export interface PodiumPlayer {
    rank: number;
    user_id: string;
    bbs_name: string;
    discord_id: string;
    global_name: string;
    averageScore: number;
    totalScores: number;
    avatar: string;
}

export interface PodiumData {
    success: boolean;
    podium: PodiumPlayer[];
    filters: {
        cycle_id: string;
        guild_id: string | null;
    };
    meta: {
        totalPlayers: number;
        cycleId: string;
        guildSpecific: boolean;
    };
}