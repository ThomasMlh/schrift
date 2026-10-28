// Groups of the game filter picked in a dialog, by list query parameter
export type FilterGroupKey = "soul_traits" | "ex_skills" | "skills" | "special" | "destruction";
export type FilterGroupSelection = Record<FilterGroupKey, string[]>;

export const EMPTY_GROUPS: FilterGroupSelection = { soul_traits: [], ex_skills: [], skills: [], special: [], destruction: [] };
export const FILTER_GROUP_KEYS = Object.keys(EMPTY_GROUPS) as FilterGroupKey[];

// Comma separated list of the URL, e.g. ?affinity=Force,Vitesse
export const listParam = (value: string | null) => (value || "").split(",").filter(Boolean);
