import type { ICharacter } from "@/interfaces";
import { gameText } from "@/utils/gameText";

// Short series names, as the game shortens them in its event list ("TYBW")
const SERIES_SHORT_NAMES: [RegExp, string][] = [
  [/guerre sanglante de mille ans/i, "TYBW"],
  [/thousand-year blood war/i, "TYBW"],
];

// Game version of the character: "version guerre sanglante de mille ans/Refine 3" -> "TYBW : Refine 3"
export const characterVersionLabel = (character: Pick<ICharacter, "game_version">, language = "fr") => {
  const raw = gameText(character.game_version, language).replace(/^version\s+/i, "").trim();
  if (!raw) return "";
  const label = raw
    .split("/")
    .map((part) => SERIES_SHORT_NAMES.reduce((text, [pattern, short]) => text.replace(pattern, short), part.trim()))
    .join(" : ");
  return label.charAt(0).toUpperCase() + label.slice(1);
};
