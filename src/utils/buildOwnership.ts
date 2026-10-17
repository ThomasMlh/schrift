import type { IBbsAccount, IBuild } from "@/interfaces";

export interface BuildOwnership {
  missingTeam: string[];
  missingLinks: string[];
}

export const ownsCharacter = (owned: Record<string, number>, characterId?: string) =>
  !!characterId && (owned[characterId] ?? 0) > 0;

export const getBuildOwnership = (build: IBuild, owned: Record<string, number>): BuildOwnership => {
  const missingTeam: string[] = [];
  const missingLinks: string[] = [];
  for (const member of build.team ?? []) {
    if (!ownsCharacter(owned, member.id_character)) missingTeam.push(member.character?.name ?? "?");
    for (const link of member.links ?? []) {
      if (!ownsCharacter(owned, link.id_character)) missingLinks.push(link.character?.name ?? "?");
    }
  }
  return { missingTeam, missingLinks };
};

export const albumTabUrl = (account: IBbsAccount) =>
  `/joueur/${encodeURIComponent(account.bbs_name ?? "")}?compte=${encodeURIComponent(account.bbs_id)}&tab=album`;
