import type { BoxProps } from "@chakra-ui/react";
import type { IBuild, IBuildTeamMember } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { ownsCharacter } from "@/utils/buildOwnership";

// Helpers shared by the build list views (cards and rows)

export const thumbUrl = (id?: string) => (id ? `${bucketUrl}/characters/thumb/${id}.png` : undefined);

export const sortedTeam = (build: IBuild): IBuildTeamMember[] =>
  [...(build.team ?? [])].sort((a, b) => a.position - b.position).slice(0, 3);

export const formatBuildDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "";

const missingStyle = { filter: "grayscale(1)", opacity: 0.45 };

export const useMissing = (owned?: Record<string, number>) => (characterId?: string) =>
  owned && !ownsCharacter(owned, characterId) ? missingStyle : undefined;

// Whole item clickable and reachable with the keyboard
export const clickableProps = (build: IBuild, onOpen: (build: IBuild) => void): BoxProps => ({
  role: "button",
  tabIndex: 0,
  cursor: "pointer",
  onClick: () => onOpen(build),
  onKeyDown: (e) => { if (e.key === "Enter") onOpen(build); },
  _focusVisible: { outline: "2px solid", outlineColor: "purple.400", outlineOffset: "-2px" },
});

