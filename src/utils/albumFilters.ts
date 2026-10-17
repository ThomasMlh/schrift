import type { IAlbumCharacter } from "@/interfaces";

export const MAX_SPE = 5;
export const SPE_LEVELS = Array.from({ length: MAX_SPE }, (_, i) => i + 1);

export type OwnershipFilter = "all" | "owned" | "missing";

export interface AlbumFilterValues {
  search: string;
  affinity: string;
  category: string;
  killer: string;
  attackType: string;
  ownership: OwnershipFilter;
}

export const EMPTY_ALBUM_FILTERS: AlbumFilterValues = {
  search: "",
  affinity: "",
  category: "",
  killer: "",
  attackType: "",
  ownership: "all",
};

export const hasAlbumFilters = (filters: AlbumFilterValues) =>
  Object.entries(filters).some(([key, value]) => value !== EMPTY_ALBUM_FILTERS[key as keyof AlbumFilterValues]);

// Same matching as the server-side filter of the Characters page: case-insensitive substring, so
// "Capitaine" also matches "Capitaine +"
const matchesAny = (values: string[] | undefined, selected: string) =>
  !selected || (values ?? []).some((v) => v.toLowerCase().includes(selected.toLowerCase()));

// `isOwned` drives the ownership filter: owned by the account, or by at least one guild member
export const filterAlbumCharacters = (
  characters: IAlbumCharacter[],
  filters: AlbumFilterValues,
  isOwned: (characterId: string) => boolean,
) => {
  const term = filters.search.trim().toLowerCase();
  return characters.filter((c) => {
    const owned = isOwned(c._id);
    if (filters.ownership === "owned" && !owned) return false;
    if (filters.ownership === "missing" && owned) return false;
    if (filters.affinity && c.affinity !== filters.affinity) return false;
    if (filters.attackType && c.attack_type !== filters.attackType) return false;
    if (!matchesAny(c.categories, filters.category) || !matchesAny(c.killers, filters.killer)) return false;
    if (!term) return true;
    return [c.name, c.search_name, c.version].some((s) => s?.toLowerCase().includes(term));
  });
};
