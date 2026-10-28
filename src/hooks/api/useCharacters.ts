import useSWR from 'swr';
import type { ICharactersResponse, ICharacter, IFilterGroups, ITraitFilterCategory } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

export const useCharacters = (options?: {
  page?: number;
  limit?: number;
  affinity?: string;
  category?: string;
  killer?: string;
  attackType?: string;
  searchQuery?: string;
  traits?: string[];
  resurrection?: string;
  // Groups of the game filter, by query parameter (soul_traits, ex_skills, skills, special, destruction)
  groups?: Record<string, string[]>;
  // Groups matched on one of their entries instead of all of them
  partialGroups?: string[];
}) => {
  const {
    page = 1, limit = 20, affinity, category, killer, attackType, searchQuery, traits = [], resurrection, groups = {}, partialGroups = [],
  } = options || {};

  let url = `${apiUrl}/api/characters?page=${page}&limit=${limit}`;
  if (affinity) url += `&affinity=${encodeURIComponent(affinity)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (killer) url += `&killer=${encodeURIComponent(killer)}`;
  if (attackType) url += `&attack_type=${encodeURIComponent(attackType)}`;
  if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
  if (traits.length > 0) url += `&traits=${encodeURIComponent(traits.join(','))}`;
  if (resurrection) url += `&resurrection=${encodeURIComponent(resurrection)}`;
  for (const [param, types] of Object.entries(groups)) {
    if (types.length > 0) url += `&${param}=${encodeURIComponent(types.join(','))}${partialGroups.includes(param) ? `&${param}_match=any` : ''}`;
  }

  const { data, error, isLoading, mutate } = useSWR<ICharactersResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return { characters: data?.data || [], pagination: data?.pagination, isLoading, error, mutate };
};

export const useCharacter = (characterId?: string) => {
  const url = characterId ? `${apiUrl}/api/characters/${characterId}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: ICharacter }>(
    url,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { character: data?.data, isLoading, error, mutate };
};

export const useCharacterMeta = () => {
  const url = `${apiUrl}/api/characters/meta`;
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    killers: string[];
    categories: string[];
    affinities: string[];
    trait_filters?: ITraitFilterCategory[];
    filter_groups?: IFilterGroups;
  }>(url, fetcher, { revalidateOnFocus: false, dedupingInterval: 300000 });

  return {
    traitFilters: data?.trait_filters || [],
    filterGroups: data?.filter_groups ?? null,
    killers: data?.killers || [],
    categories: data?.categories || [],
    affinities: data?.affinities || [],
    isLoading,
    error,
  };
};
