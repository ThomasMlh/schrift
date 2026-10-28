import type { ISkill } from "@/interfaces";
import { gameText } from "./gameText";

// "Esquive 15 %", "ATT +200", or the name alone for a skill without value
export const skillLabel = (skill: ISkill, language: string) => {
  const name = gameText(skill.names, language) || skill.name;
  if (skill.value == null) return name;
  if (skill.format === "plus") return `${name} +${skill.value}`;
  return language.startsWith("fr") ? `${name} ${skill.value}\u00a0%` : `${name} ${skill.value}%`;
};
