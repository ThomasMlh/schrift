import type { GameText } from "@/interfaces";

// Text in the site language when the game data has it, French otherwise
export const gameText = (text: GameText | null | undefined, language: string) => {
  if (!text) return "";
  return text[language.slice(0, 2)] ?? text.fr ?? Object.values(text)[0] ?? "";
};
