import type { ITopAchievement } from "./records";
// Users and game (bbs) accounts
import type { IPagination, Role } from "./common";

// A bbs account (main or alt) attached to a user. guilde_id/role belong to THIS account: one user can
// lead a guild with one account and be a regular member of another guild with a second one.
export interface IBbsAccount {
  bbs_id: string;
  bbs_name?: string | null;
  guilde_id?: string | null;
  role?: Role | null;
  is_primary: boolean;
  linked_at?: string;
}

// A leader/officer grant embedded in the JWT, one per account with an elevated role, so score entry
// is scoped to the guild(s) actually managed through THAT account.
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
  top_achievement?: ITopAchievement | null; // Rarest achievement (public account list)
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
