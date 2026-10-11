// bucketUrl : passe par le proxy Discord en Activity (/.proxy/bucket), https sinon
import { bucketUrl } from "./apiRequest";

// Mapping des affinités avec leurs icônes
const affinitySlugMap: Record<string, string> = {
  "Force": "force",
  "Vitesse": "vitesse",
  "Instinct": "instinct",
  "Technique": "technique",
  "Connaissance": "connaissance",
  "Goton": "goton"
};

// Mapping des statistiques avec leurs icônes
const statSlugMap: Record<string, string> = {
  "atk": "atk",
  "def": "def",
  "cct": "cct",
  "pre": "pre",
  "end": "end",
};

// Mapping des slugs pour les tueurs
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

// Mapping des catégories avec leurs icônes
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
 * Récupère l'URL de l'icône d'une affinité
 * @param affinity - Le nom de l'affinité
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getAffinityIcon = (affinity: string): string | null => {
  const slug = affinitySlugMap[affinity] || "goton";
  return `${bucketUrl}/affinity/${slug}.png`;
};

/**
 * Récupère l'URL de l'icône d'un tueur dynamiquement
 * @param killer - Le nom du tueur
 * @returns L'URL de l'icône ou null si non trouvée
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
 * Récupère l'URL de l'icône d'une catégorie
 * @param category - Le nom de la catégorie
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getCategoryIcon = (category: string): string => {
  const slug = categorySlugMap[category] || "tous";
  return `${bucketUrl}/categories/cat-${slug}.png`;
};

/**
 * Récupère toutes les affinités disponibles avec leurs icônes
 * @returns Objet avec toutes les affinités et leurs URLs d'icônes
 */
export const getAllAffinities = () => {
  return affinitySlugMap;
};

/**
 * Récupère tous les tueurs disponibles avec leurs icônes
 * @returns Objet avec tous les tueurs et leurs URLs d'icônes
 */
export const getAllKillers = () => {
  return killerSlugMap;
};

/**
 * Récupère toutes les catégories disponibles avec leurs icônes
 * @returns Objet avec toutes les catégories et leurs URLs d'icônes
 */
export const getAllCategories = () => {
  return categorySlugMap;
};

/**
 * Récupère l'URL de l'icône d'une statistique
 * @param stat - Le nom de la statistique
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getStatIcon = (stat: string): string | null => {
  const slug = statSlugMap[stat as keyof typeof statSlugMap] || null;
  return slug ? `${bucketUrl}/stats/${slug}.png` : null;
};