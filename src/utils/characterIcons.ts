// bucketUrl goes through the Discord proxy in an Activity (/.proxy/bucket), https otherwise
import { bucketUrl } from "./apiRequest";

const affinitySlugMap: Record<string, string> = {
  "Force": "force",
  "Vitesse": "vitesse",
  "Instinct": "instinct",
  "Technique": "technique",
  "Connaissance": "connaissance",
  "Goton": "goton"
};

const statSlugMap: Record<string, string> = {
  "atk": "atk",
  "def": "def",
  "cct": "cct",
  "pre": "pre",
  "end": "end",
};

const killerSlugMap: Record<string, string> = {
  "Shinigami": "shini",
  "Capitaine": "cap",
  "Division 0": "div0",
  "Hollow": "hollow",
  "Arrancar": "arrancar",
  "Espada": "espada",
  "Aucun": "aucun",
  "Humain": "humain",
  "Quincy": "quincy",
  "Stern Ritter": "stern",
  "Toutes": "all"
};

const categorySlugMap: Record<string, string> = {
  "Shinigami": "shini",
  "Capitaine": "cap",
  "Division 0": "div0",
  "Hollow": "hollow",
  "Arrancar": "arrancar",
  "Espada": "espada",
  "Aucun": "aucun",
  "Humain": "humain",
  "Quincy": "quincy",
  "Stern Ritter": "stern",
  "Toutes": "tous"
};

/**
 * Icon URL of an affinity
 */
export const getAffinityIcon = (affinity: string): string | null => {
  const slug = affinitySlugMap[affinity];
  // The game has no icon for the Goton placeholder
  if (!slug || slug === "goton") return `${bucketUrl}/affinity/goton.png`;
  return `${bucketUrl}/affinity/${slug}_small.png`;
};

/**
 * Icon URL of a killer ("+" variants included)
 */
export const getKillerIcon = (killer: string): string | null => {
  if (!killer) return null;
  let base = killer.trim();
  let isPlus = false;
  if (base.endsWith("+")) {
    isPlus = true;
    base = base.replace(/\s*\+$/, "");
  }
  const slug = killerSlugMap[base] || "all";
  const plusPart = isPlus ? "-plus" : "";
  return `${bucketUrl}/killers/killer-${slug}${plusPart}.png`;
};

/**
 * Icon URL of a category
 */
export const getCategoryIcon = (category: string): string => {
  const slug = categorySlugMap[category] || "tous";
  return `${bucketUrl}/categories/cat-${slug}.png`;
};

export const getAllAffinities = () => {
  return affinitySlugMap;
};

export const getAllKillers = () => {
  return killerSlugMap;
};

export const getAllCategories = () => {
  return categorySlugMap;
};

/**
 * Icon URL of a stat, or null when unknown
 */
export const getStatIcon = (stat: string): string | null => {
  const slug = statSlugMap[stat as keyof typeof statSlugMap] || null;
  return slug ? `${bucketUrl}/stats/${slug}.png` : null;
};