// Types généraux
export type Page = "guilds" | "characters";
export type AdminPage = "guilds" | "draft" | "cycles" | "scores" | "users" | "guides" | "banned" | "images" | "notifications" | "activity" | "messages" | "alerts" | "score-control";
export type Role = "chef" | "sous-chef" | "membre";

export type NotificationType =
  | "scores" | "podium_snapshot" | "score_edit" | "rotation_transfer" | "character_update" | "image_upload"
  | "ban" | "draft" | "guild_toggle" | "build_proposal" | "build_delete" | "cycle_change"
  | "guild_change" | "membre_role_change" | "guild_member_change" | "personal_record" | "cycle_recap";

export interface IGuild {
  _id: string;
  name: string;
  disabled?: boolean;
  discord_channel_id?: string; // salon "chef" (accès restreint)
  discord_general_channel_id?: string; // salon général, tous les membres
  disabled_notification_types?: NotificationType[];
}

export interface IDiscordChannelMember {
  id: string;
  username: string;
  display_name: string;
}

export interface IDiscordChannel {
  id: string;
  name: string;
  guild_id: string;
  guild_name: string;
  category: string | null; // nom de la catégorie Discord ; null si le salon n'en a pas
  members: IDiscordChannelMember[];
}

export interface IDiscordEmoji {
  id: string;
  name: string;
  animated: boolean;
  url: string;
  guild_id: string; // serveur Discord auquel appartient l'emoji
}

// Auteur d'un record sur un killer (GET /api/rotations/:id/history)
export interface IKillerRecordHolder {
  score: number;
  bbs_id: string;
  bbs_name: string | null;
  guild_id: string | null;
  guild_name: string | null;
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
}

export interface IRotationHistoryCycle {
  cycle_id: string;
  cycle_name: string;
  cycle_year: number;
  average: number | null;
  count: number;
  guild_average: number | null;
  guild_count: number | null;
}

export interface IRotationHistory {
  rotation_id: string;
  absolute_record: IKillerRecordHolder | null;
  guild_record: IKillerRecordHolder | null;
  record_to_beat: IKillerRecordHolder | null; // meilleur score des AUTRES cycles (périmètre guilde si filtrée)
  current_cycle_best: IKillerRecordHolder | null;
  per_cycle: IRotationHistoryCycle[];
}

// Record personnel d'un compte bbs sur un killer (GET /api/users/:userId/records)
export interface IAccountKillerRecord {
  rotation_id: string;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  score: number;
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
  attempts: number;
}

export interface IUserAccountRecords {
  bbs_id: string;
  bbs_name: string | null;
  is_primary: boolean;
  records: IAccountKillerRecord[];
}

export interface IActivityLogEntry {
  _id: string;
  type: NotificationType | string;
  data: Record<string, unknown>;
  channel_id: string | null;
  guilde_id: string | null;
  created_at: string;
}

export interface IActivityResponse {
  success: boolean;
  activity: IActivityLogEntry[];
  pagination: IPagination;
}

// Un compte bbs (principal ou alt) rattaché à un user. guilde_id/role sont propres à CE compte —
// un même user peut avoir un compte chef d'une guilde et un autre simple membre d'une autre.
export interface IBbsAccount {
  bbs_id: string;
  bbs_name?: string | null;
  guilde_id?: string | null;
  role?: Role | null;
  is_primary: boolean;
  linked_at?: string;
}

// Un grant chef/sous-chef embarqué dans le JWT, un par compte ayant un rôle élevé — permet de
// scoper la saisie de scores à la/les guilde(s) réellement gérée(s) via CE compte.
export interface IGuildRoleGrant {
  bbs_id: string;
  guilde_id: string;
  role: Role;
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
  bbs_accounts?: IBbsAccount[];
  guild_roles?: IGuildRoleGrant[];
  last_login?: string;
  exp?: number;
  guild_name?: string;
  banner?: string;
  is_banned?: boolean;
  ban_reason?: string;
  banned_at?: string;
}

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
  rotations: ICycleRotation[];
  year: number;
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
  bbs_id: string;
  bbs_name?: string | null;
  cycle_id: string;
  rotation_id: string;
  guild_id: string;
  score: number;
  raw_score: number;
  is_differential?: boolean;
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
  bbs_id: string;
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
  cycle: ICycle | null;
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
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  score?: number; // Score individuel (si rotation spécifiée)
  raw_score?: number;
  is_differential?: boolean;
  averageScore?: number; // Moyenne des scores (si mode cycle en moyenne)
  totalScore?: number; // Somme des scores (si mode cycle en max)
  previousAverageScore?: number; // Moyenne au cycle précédent (classement progression)
  progression?: number; // Écart de moyenne avec le cycle précédent (classement progression)
  progressionPercent?: number; // Écart en % (classement progression)
  totalScores: number; // Nombre de scores pris en compte pour la moyenne
  totalRawScore?: number;
  avatar?: string;
  hasUser: boolean;
  username: string;
  guild_name?: string; // Nom de la guilde du joueur
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

export type PodiumRankingType = "average" | "max" | "progression";
export type PodiumType = "individual_scores" | "average_scores" | "max_scores" | "progression";

export interface IPodiumResponse {
  success: boolean;
  podium?: IPodiumPlayer[]; // Nouvelle API retourne podium
  data?: IPodiumPlayer[]; // Ancienne API retournait data
  pagination: IPagination;
  filters: {
    cycle_name: string;
    cycle_id: string;
    rotation_id: string | null;
    guild_name?: string;
    ranking_type?: PodiumRankingType | null;
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
    podiumType: PodiumType;
    averageScore?: number;
    previousCycle?: { _id: string; name: string; year: number } | null;
  };
}

// Interfaces pour le podium weekly
export interface IPodiumWeeklyPlayer {
  rank: number;
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  guild_name?: string;
  week_total_score: number;
  rotation1_score: number;
  rotation2_score: number;
  avatar?: string;
  hasUser: boolean;
  username: string;
}

export interface IPodiumWeeklyResponse {
  success: boolean;
  data: IPodiumWeeklyPlayer[];
  pagination: IPagination;
  filters: {
    cycle_name: string;
    cycle_id: string;
    week_number: number;
    guild_name?: string;
  };
  meta: {
    weekNumber: number;
    rotationsInfo: Array<{
      position: number;
      killer: string;
      attack: string;
      start_date: string;
      end_date: string;
    }>;
    totalPlayers: number;
    averageWeekScore: number;
  };
}

// Interfaces pour le podium misses
export interface IPodiumMissPlayer {
  rank: number;
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  discord_id?: string;
  global_name: string;
  guild_name?: string;
  total_misses: number;
  total_negative_score: number;
  missed_rotations: Array<{
    rotation_position: number;
    score: number;
  }>;
  avatar?: string;
  hasUser: boolean;
  username: string;
}

export interface IPodiumMissesResponse {
  success: boolean;
  data: IPodiumMissPlayer[];
  pagination: IPagination;
  filters: {
    cycle_name: string;
    cycle_id: string;
    guild_name?: string;
  };
  meta: {
    totalPlayersWithMisses: number;
    totalMissesInCycle: number;
    averageMissesPerPlayer: number;
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

// Baisses de régime (espace chefs/admins) : derniers scores comparés à l'habitude du joueur
// sur les mêmes killers
export interface IDeclineSample {
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
  rotation_id: string;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  score: number;
  usual: number;
}

export interface IDeclineAlert {
  bbs_id: string;
  bbs_name: string | null;
  user_id: string;
  discord_id?: string;
  global_name?: string;
  avatar?: string;
  guild_id: string;
  guild_name: string | null;
  ratio: number;
  drop_percent: number;
  samples: IDeclineSample[];
}

// Bilan de fin de cycle d'une guilde (aperçu avant publication sur Discord)
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

// Contrôle des scores (espace chefs/admins) : scores à vérifier et historique des modifications
export type ScoreAnomalyType = "above_killer_record" | "far_above_usual" | "far_below_usual" | "missing_base" | "same_value";

export interface IScoreAnomaly {
  score_id: string;
  bbs_id: string;
  bbs_name: string | null;
  user_id: string | null;
  guild_id: string;
  guild_name: string | null;
  cycle_id: string;
  cycle_name: string | null;
  cycle_year: number | null;
  rotation_id: string;
  rotation_position: number | null;
  killer: string | null;
  attack: string | null;
  alteration: string | null;
  score: number;
  raw_score: number;
  is_differential: boolean;
  issues: { type: ScoreAnomalyType; reference?: number; with?: string[] }[];
}

export type ScoreHistoryAction = "create" | "update" | "delete" | "transfer_account" | "transfer_rotation" | "recalculate";

export interface IScoreSnapshot {
  score?: number;
  raw_score?: number;
  is_differential?: boolean;
  bbs_id?: string;
  bbs_name?: string | null;
  guild_id?: string;
  rotation_id?: string;
  cycle_id?: string;
}

export interface IScoreHistoryEntry {
  _id: string;
  score_id: string | null;
  action: ScoreHistoryAction;
  source: string;
  bbs_id: string | null;
  bbs_name: string | null;
  guild_id: string | null;
  guild_name: string | null;
  cycle_id: string | null;
  cycle_name: string | null;
  cycle_year: number | null;
  rotation_id: string | null;
  rotation_position: number | null;
  killer: string | null;
  attack: string | null;
  before: IScoreSnapshot | null;
  after: IScoreSnapshot | null;
  by_user_id: string | null;
  by_name: string | null;
  created_at: string;
}

// Succès (calculés côté API à partir des scores)
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
export type AchievementCategory = "scores" | "records" | "regularity" | "progression" | "podium" | "versatility";
export type AchievementUnit = "count" | "score" | "billions" | "percent" | "flag";

export interface IAchievementTierState {
  tier: AchievementTier;
  threshold: number;
  unlocked_at: number | null; // timestamp (ms) de la rotation ou du cycle qui l'a débloqué
  rarity: number; // % des comptes l'ayant débloqué
}

export interface IAchievement {
  code: string;
  category: AchievementCategory;
  unit: AchievementUnit;
  value: number;
  current_tier: AchievementTier | null;
  next_tier: { tier: AchievementTier; threshold: number } | null;
  tiers: IAchievementTierState[];
}

export interface IUserAccountAchievements {
  bbs_id: string;
  bbs_name: string | null;
  is_primary: boolean;
  achievements: IAchievement[];
}
