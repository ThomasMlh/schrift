import type { IAlbumCharacter } from "@/interfaces";
import type { CharacterFilterValues } from "@/components/characters/filters/CharacterFiltersPanel";
import { EMPTY_GROUPS, FILTER_GROUP_KEYS, type FilterGroupKey } from "@/components/characters/filters/filterGroups";

export const MAX_SPE = 5;
export const SPE_LEVELS = Array.from({ length: MAX_SPE }, (_, i) => i + 1);

export type OwnershipFilter = "all" | "owned" | "missing";

export interface AlbumFilterValues extends CharacterFilterValues {
  search: string;
  ownership: OwnershipFilter;
}

export const EMPTY_ALBUM_FILTERS: AlbumFilterValues = {
  search: "",
  ownership: "all",
  affinities: [],
  killers: [],
  attackType: "",
  categories: [],
  groups: EMPTY_GROUPS,
  partialGroups: [],
};

// Group of the character `filters` field behind each filter of the panel
const GROUP_FIELDS: Record<FilterGroupKey, string> = {
  soul_traits: "link", ex_skills: "ex", skills: "skill", special: "special", destruction: "destruction",
};

// Filters of the panel in use, shown as a count on its toggle
export const countPanelFilters = (filters: AlbumFilterValues) => filters.affinities.length + filters.killers.length
  + filters.categories.length + (filters.attackType ? 1 : 0)
  + FILTER_GROUP_KEYS.reduce((sum, key) => sum + filters.groups[key].length, 0);

export const hasAlbumFilters = (filters: AlbumFilterValues) =>
  Boolean(filters.search || filters.ownership !== "all" || countPanelFilters(filters));

const anyOf = (selected: string[], values: string[] | undefined) =>
  selected.length === 0 || selected.some((value) => values?.includes(value));

// Same rules as the server filter of the Characters page: one of the choices within a section, a killer
// also covers its "+" version, all the picked abilities of a group (or one of them in partial match)
export const filterAlbumCharacters = (
  characters: IAlbumCharacter[],
  filters: AlbumFilterValues,
  isOwned: (characterId: string) => boolean,
) => {
  const term = filters.search.trim().toLowerCase();
  const killers = filters.killers.flatMap((killer) => [killer, `${killer} +`]);
  return characters.filter((c) => {
    const owned = isOwned(c._id);
    if (filters.ownership === "owned" && !owned) return false;
    if (filters.ownership === "missing" && owned) return false;
    if (filters.affinities.length > 0 && !filters.affinities.includes(c.affinity ?? "")) return false;
    if (filters.attackType && c.attack_type !== filters.attackType) return false;
    if (!anyOf(filters.categories, c.categories) || !anyOf(killers, c.killers)) return false;
    for (const key of FILTER_GROUP_KEYS) {
      const picked = filters.groups[key];
      if (picked.length === 0) continue;
      const types = c.filters?.[GROUP_FIELDS[key]] ?? [];
      const matches = filters.partialGroups.includes(key)
        ? picked.some((type) => types.includes(type))
        : picked.every((type) => types.includes(type));
      if (!matches) return false;
    }
    if (!term) return true;
    return [c.name, c.search_name, c.version].some((s) => s?.toLowerCase().includes(term));
  });
};
