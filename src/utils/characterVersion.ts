import type { ICharacter } from "@/interfaces";

const SERIES_SHORT_NAMES: Record<string, string> = {
  "Thousand-Year Blood War": "TYBW",
};

// "Thousand-Year Blood War,Refine,Ichigo Kurosaki" -> "TYBW : Refine"
export const characterVersionLabel = (character: Pick<ICharacter, "name" | "version_name">) => {
  const parts = (character.version_name ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1 && parts[parts.length - 1] === character.name) parts.pop();
  const [series, ...rest] = parts;
  if (!series) return "";
  return [SERIES_SHORT_NAMES[series] ?? series, ...rest].join(" : ");
};
