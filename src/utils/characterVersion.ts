import type { ICharacter } from "@/interfaces";

const SERIES_SHORT_NAMES: Record<string, string> = {
  "Thousand-Year Blood War": "TYBW",
};

// "Thousand-Year Blood War,Refine,Ichigo Kurosaki" -> "TYBW : Refine"
export const characterVersionLabel = (character: Pick<ICharacter, "name" | "version_name" | "game_version">) => {
  // Characters added by the game sync have no hand-entered version: the game one, without its "version " prefix
  if (!character.version_name) return (character.game_version?.fr ?? "").replace(/^version\s+/i, "");
  const parts = (character.version_name ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  // "<series>,<version>,<name>": the name part can be an older spelling of the character name
  if (parts.length >= 3 || (parts.length > 1 && parts[parts.length - 1] === character.name)) parts.pop();
  const [series, ...rest] = parts;
  if (!series) return "";
  return [SERIES_SHORT_NAMES[series] ?? series, ...rest].join(" : ");
};
