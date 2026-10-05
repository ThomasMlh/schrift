// Utilisateurs et comptes de jeu (bbs)
import type { IPagination, Role } from "./common";

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
