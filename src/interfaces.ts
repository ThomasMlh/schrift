// Types généraux
export type Page = "guilds" | "characters";
export type AdminPage = "guilds" | "cycles" | "scores" | "users" | "guides";
export type Role = "chef" | "sous-chef" | "membre";

export interface IGuild {
  _id: string;
  name: string;
}

export interface IUser {
  _id: string;
  username: string;
  global_name: string;
  avatar?: string;
  discord_id?: string;
  guilde_id?: string;
  role: Role;
  is_admin?: boolean;
  bbs_id?: string;
  bbs_name?: string;
  last_login?: string;
  exp?: number;
}

export interface ICharacter {
  _id: string;
  name: string;
  search_name?: string;
  affinity?: string;
  categories?: string[];
  killers?: string[];
  link?: string;
  attack_type: string;
}

export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
  itemsOnPage: number;
}

export interface ICharactersResponse {
  data: ICharacter[];
  pagination: IPagination;
}

export interface IUsersResponse {
  success: boolean;
  users: IUser[];
  pagination: IPagination;
  activeFilters?: {
    guilde_id?: string | null;
    role?: string | null;
    search?: string | null;
  };
}

export interface IRotationTemplate {
  _id: string;
  killer: string;
  attack: string;
  alteration: string;
}

export interface ICycleRotation {
  _id?: string;
  start_date: string; // Format DD/MM/YYYY
  end_date: string; // Format DD/MM/YYYY
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
  isActive?: boolean;
  rotations: ICycleRotation[];
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

export interface IScore {
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

export interface IScoreWithUser
  extends Omit<IScore, "cycle_id" | "rotation_id" | "guild_id" | "raw_score"> {
  _id: string;
  user: IUser;
  created_at: string;
  rank: number;
}

export interface IScoreFormData {
  user_id: string;
  cycle_id: string;
  rotation_id: string;
  guild_id: string;
  raw_score?: number;
  score?: number;
}

export interface IScoresResponse {
  data: IScore[];
  pagination: IPagination;
}

export interface IScoreDetailApiResponse {
  success: boolean;
  data: IScoreWithUser[];
  cycle: string;
  rotation: IRotationTemplate | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface IRankInfo {
  rank: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface IPodiumPlayer {
    rank: number;
    user_id: string;
    bbs_name?: string;
    discord_id?: string;
    global_name: string;
    score?: number; // Score individuel (si rotation spécifiée)
    raw_score?: number;
    is_differential?: boolean;
    averageScore: number; // Moyenne des scores (si pas de rotation)
    totalScores: number; // Nombre de scores pris en compte pour la moyenne
    totalRawScore?: number;
    avatar?: string;
    hasUser: boolean;
    username: string;
}

export interface IPodiumData {
  success: boolean;
  podium: IPodiumPlayer[];
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

export interface IProtectedRoute {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuildManager: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

export interface IPodiumResponse {
    success: boolean;
    data: IPodiumPlayer[];
    pagination: IPagination;
    filters: {
        cycle_name: string;
        cycle_id: string;
        rotation_id: string;
        guild_name?: string;
    };
    meta: {
        totalPlayers: number;
        cycleName: string;
        rotationInfo?: {
            _id: string;
            position: number;
            killer: string;
            attack: string;
            start_date: string;
            end_date: string;
            period: string;
        };
        guildSpecific: boolean;
        fullPodium: boolean;
        podiumType: 'individual_scores' | 'average_scores';
        averageScore?: number;
    };
}

// Interfaces pour le comparateur
export interface IComparisonStats {
  averageScore: number;
  averageRawScore: number;
  totalScores: number;
  maxScore: number;
  minScore: number;
  maxRawScore: number;
  minRawScore: number;
}

export interface IComparisonEntityInfo {
  _id?: string;
  global_name?: string;
  bbs_name?: string;
  discord_id?: string;
  avatar?: string;
  name?: string;
  description?: string;
}

export interface IComparisonEntity {
  entityInfo: IComparisonEntityInfo | null;
  stats: IComparisonStats;
}

export interface IComparisonDifferences {
  averageScore: {
    difference: number;
    percentage: number | null;
  };
  averageRawScore: {
    difference: number;
    percentage: number | null;
  };
  totalScores: {
    difference: number;
    percentage: number | null;
  };
}

export interface IComparisonSummary {
  entity1: {
    id: string;
    averageScore: number;
    totalScores: number;
  };
  entity2: {
    id: string;
    averageScore: number;
    totalScores: number;
  };
}

export interface IComparisonResult {
  entities: {
    [entityId: string]: IComparisonEntity;
  };
  differences: IComparisonDifferences;
  winner: string | null;
  summary: IComparisonSummary;
}

export interface IComparisonFilters {
  type: "players" | "guilds";
  entity1: string;
  entity2: string;
  cycle_id: string | null;
  rotation_id: string | null;
}

export interface IComparisonMeta {
  comparisonType: "players" | "guilds";
  hasFilters: boolean;
  scopeDescription: string;
}

export interface IComparisonResponse {
  success: boolean;
  comparison: IComparisonResult;
  filters: IComparisonFilters;
}

// Interface pour les skills
export interface ISkill {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

// Interfaces pour les accessories
export interface IAccessory {
  _id: string;
  name: string;
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
    link?: string;
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
    link?: string;
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
  name: string;
  description: string;
  amount: number;
}