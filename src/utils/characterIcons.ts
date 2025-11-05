// Mapping des affinités avec leurs icônes
const affinityIcons = {
  "Force": "https://i.ibb.co/b5v862B/force.png",
  "Vitesse": "https://i.ibb.co/ZztJNN5/vitesse.png",
  "Instinct": "https://i.ibb.co/3rSSC0f/instinct.png",
  "Technique": "https://i.ibb.co/ZTSx63H/technique.png",
  "Connaissance": "https://i.ibb.co/jkCHQNP/connaissance.png",
  "Goton": "https://i.ibb.co/WtBTMKw/goton.png"
};

// Mapping des statistiques avec leurs icônes
const statIcons = {
  "atk": "https://i.ibb.co/DcHQ9mY/atk.png",
  "def": "https://i.ibb.co/xKbShNPc/def.png",
  "cct": "https://i.ibb.co/N6Jwz0fB/cct.png",
  "pre": "https://i.ibb.co/v6FShNNV/spe.png",
  "end": "https://i.ibb.co/zWbCn4Dz/end.png",
};

// Mapping des tueurs avec leurs icônes
const killerIcons = {
  "Shinigami": "https://i.ibb.co/tC1NZcN/killer-shini.png",
  "Shinigami +": "https://i.ibb.co/qMbJ8pys/shini.png",
  "Capitaine": "https://i.ibb.co/6tFYF6g/killer-cap.png",
  "Capitaine +": "https://i.ibb.co/FLbtkhQM/capitaine.png",
  "Division 0": "https://i.ibb.co/xJtrT5b/killer-div0.png",
  "Division 0 +": "https://i.ibb.co/0whxXGZ/div0.png",
  "Hollow": "https://i.ibb.co/RPQQSz2/killer-hollow.png",
  "Hollow +": "https://i.ibb.co/C5vh6kJK/hollow.png",
  "Arrancar": "https://i.ibb.co/h8jfc0R/killer-arrancar.png",
  "Arrancar +": "https://i.ibb.co/RkVzJWnL/arrancar.png",
  "Espada": "https://i.ibb.co/Cvq6bG2/killer-espada.png",
  "Espada +": "https://i.ibb.co/V0h4Z4RF/espada.png",
  "Humain": "https://i.ibb.co/9qc5rc0/killer-humain.png",
  "Humain +": "https://i.ibb.co/CsMfWRKX/humain.png",
  "Quincy": "https://i.ibb.co/3cn59jx/killer-quincy.png",
  "Quincy +": "https://i.ibb.co/NXDB2ph/quincy.png",
  "Stern Ritter": "https://i.ibb.co/RS3Xg1b/killer-stern.png",
  "Stern Ritter +": "https://i.ibb.co/yc9ssfnK/stern.png",
  "Aucun": "https://i.ibb.co/6F5bqFw/killer-aucun.png",
  "Aucun +": "https://i.ibb.co/r2cJ4Zb9/aucun.png"
};

// Mapping des catégories avec leurs icônes
const categoryIcons = {
  "Shinigami": "https://i.ibb.co/bzSVpGp/cat-shini.png",
  "Capitaine": "https://i.ibb.co/GkL0Qh5/cat-cap.png",
  "Division 0": "https://i.ibb.co/5WxnTzb/cat-div0.png",
  "Hollow": "https://i.ibb.co/gvG7s8b/cat-hollow.png",
  "Arrancar": "https://i.ibb.co/bdTvqfg/cat-arrancar.png",
  "Espada": "https://i.ibb.co/1sRpP8D/cat-espada.png",
  "Aucun": "https://i.ibb.co/nb8LXqg/cat-aucun.png",
  "Humain": "https://i.ibb.co/kQMDQQ4/cat-humain.png",
  "Quincy": "https://i.ibb.co/Nm0TBL9/cat-quincy.png",
  "Stern Ritter": "https://i.ibb.co/S3hRrjG/cat-stern.png",
  "Toutes": "https://i.ibb.co/LZbZNx5/cat-tous.png"
};

/**
 * Récupère l'URL de l'icône d'une affinité
 * @param affinity - Le nom de l'affinité
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getAffinityIcon = (affinity: string): string | null => {
  return affinityIcons[affinity as keyof typeof affinityIcons] || null;
};

/**
 * Récupère l'URL de l'icône d'un tueur
 * @param killer - Le nom du tueur
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getKillerIcon = (killer: string): string | null => {
  return killerIcons[killer as keyof typeof killerIcons] || null;
};

/**
 * Récupère l'URL de l'icône d'une catégorie
 * @param category - Le nom de la catégorie
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getCategoryIcon = (category: string): string | null => {
  return categoryIcons[category as keyof typeof categoryIcons] || null;
};

/**
 * Récupère toutes les affinités disponibles avec leurs icônes
 * @returns Objet avec toutes les affinités et leurs URLs d'icônes
 */
export const getAllAffinities = () => {
  return affinityIcons;
};

/**
 * Récupère tous les tueurs disponibles avec leurs icônes
 * @returns Objet avec tous les tueurs et leurs URLs d'icônes
 */
export const getAllKillers = () => {
  return killerIcons;
};

/**
 * Récupère toutes les catégories disponibles avec leurs icônes
 * @returns Objet avec toutes les catégories et leurs URLs d'icônes
 */
export const getAllCategories = () => {
  return categoryIcons;
};

/**
 * Récupère l'URL de l'icône d'une statistique
 * @param stat - Le nom de la statistique
 * @returns L'URL de l'icône ou null si non trouvée
 */
export const getStatIcon = (stat: string): string | null => {
  return statIcons[stat as keyof typeof statIcons] || null;
};