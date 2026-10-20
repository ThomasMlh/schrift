// Cross-cutting types: pages, roles, notifications, pagination, activity log

export type Page = "guilds" | "characters";

export type AdminPage = "overview" | "guilds" | "draft" | "cycles" | "scores" | "users" | "guides" | "banned" | "images" | "notifications" | "activity" | "messages" | "alerts" | "score-control" | "preparation" | "applications";

export type Role = "chef" | "sous-chef" | "membre";

export type NotificationType =
  | "scores" | "podium_snapshot" | "score_edit" | "rotation_transfer" | "character_update" | "image_upload"
  | "ban" | "draft" | "guild_toggle" | "build_proposal" | "build_delete" | "cycle_change"
  | "guild_change" | "membre_role_change" | "guild_member_change" | "personal_record" | "cycle_recap" | "achievement_unlock";

export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
  itemsOnPage: number;
}

export interface IProtectedRoute {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuildManager: boolean;
  isLoading: boolean;
  children: React.ReactNode;
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
