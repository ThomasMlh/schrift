import useSWR from 'swr';
import type { ICharactersResponse, ICharacter } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

export const useCharacters = (options?: {
  page?: number;
  limit?: number;
  affinity?: string;
  category?: string;
  killer?: string;
  attackType?: string;
  soulTrait?: string;
  exSoulTrait?: string;
  searchQuery?: string;
}) => {
  const { page = 1, limit = 20, affinity, category, killer, attackType, soulTrait, exSoulTrait, searchQuery } = options || {};

  let url = `${apiUrl}/api/characters?page=${page}&limit=${limit}`;
  if (affinity) url += `&affinity=${encodeURIComponent(affinity)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (killer) url += `&killer=${encodeURIComponent(killer)}`;
  if (attackType) url += `&attack_type=${encodeURIComponent(attackType)}`;
  if (soulTrait) url += `&soul_trait=${encodeURIComponent(soulTrait)}`;
  if (exSoulTrait) url += `&ex_soul_trait=${encodeURIComponent(exSoulTrait)}`;
  if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

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
    soul_traits: string[];
    ex_soul_traits: string[];
  }>(url, fetcher, { revalidateOnFocus: false, dedupingInterval: 300000 });

  return {
    killers: data?.killers || [],
    categories: data?.categories || [],
    affinities: data?.affinities || [],
    soulTraits: data?.soul_traits || [],
    exSoulTraits: data?.ex_soul_traits || [],
    isLoading,
    error,
  };
};
