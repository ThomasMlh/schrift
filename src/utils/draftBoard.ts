import type { IUser, Role } from "@/interfaces";

// Draft board state: one pending change per bbs account (a user can have several accounts)

export interface DraftAccount {
  user: IUser;
  bbsId: string;
  name: string;
  guildId: string | null;
  role: Role | null;
}

export interface DraftChange {
  account: DraftAccount;
  toGuildId: string | null;
  role: Role | null;
}

export type DraftChanges = Record<string, DraftChange>;

export const toDraftAccount = (user: IUser, guildId: string | null): DraftAccount => ({
  user,
  bbsId: user.bbs_id!,
  name: user.bbs_name || user.global_name || user.username,
  guildId,
  role: guildId ? (user.role ?? "membre") : null,
});

// Where the account ends up once the draft runs
export const finalState = (account: DraftAccount, changes: DraftChanges) => {
  const change = changes[account.bbsId];
  return change ? { guildId: change.toGuildId, role: change.role } : { guildId: account.guildId, role: account.role };
};

export const isTransfer = (change: DraftChange) => change.toGuildId !== change.account.guildId;

// A role worth mentioning: changed inside the guild, or anything but "membre" on arrival
export const isRoleChange = (change: DraftChange) =>
  !!change.toGuildId && change.role !== (isTransfer(change) ? "membre" : change.account.role);

// Sets the account's destination and role; a change back to the current state is dropped
export const setChange = (
  changes: DraftChanges,
  account: DraftAccount,
  next: { toGuildId?: string | null; role?: Role },
): DraftChanges => {
  const current = finalState(account, changes);
  const toGuildId = next.toGuildId !== undefined ? next.toGuildId : current.guildId;
  const movesGuild = toGuildId !== current.guildId;
  const role: Role | null = !toGuildId
    ? null
    : next.role ?? (movesGuild ? (toGuildId === account.guildId ? account.role : "membre") : current.role);

  const rest = { ...changes };
  delete rest[account.bbsId];
  if (toGuildId === account.guildId && role === account.role) return rest;
  return { ...rest, [account.bbsId]: { account, toGuildId, role } };
};

export const ROLE_ORDER: Record<string, number> = { chef: 0, "sous-chef": 1, membre: 2 };

// Accounts shown in a guild column (null = guildless): arrivals, departures, then the others by role
export const columnEntries = (guildId: string | null, members: DraftAccount[], changes: DraftChanges) => {
  const incoming = Object.values(changes)
    .filter((change) => change.toGuildId === guildId && change.account.guildId !== guildId)
    .map((change) => change.account);
  const outgoing = members.filter((account) => changes[account.bbsId] && isTransfer(changes[account.bbsId]));
  const staying = members
    .filter((account) => !outgoing.includes(account))
    .sort((a, b) => {
      const ra = ROLE_ORDER[finalState(a, changes).role ?? "membre"];
      const rb = ROLE_ORDER[finalState(b, changes).role ?? "membre"];
      return ra - rb || a.name.localeCompare(b.name);
    });
  return { incoming, outgoing, staying };
};
