import useSWR from 'swr';
import type { IAlbum, IAlbumCharacter } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

export const albumUrl = (bbsId: string) => `${apiUrl}/api/albums/${encodeURIComponent(bbsId)}`;

// Character album of a bbs account (public)
export const useAlbum = (bbsId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: IAlbum }>(
    bbsId ? albumUrl(bbsId) : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { album: data?.data, isLoading, error, mutate };
};

// Full, lightweight character catalog for the album grid
export const useCharacterCatalog = () => {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IAlbumCharacter[] }>(
    `${apiUrl}/api/characters/catalog`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return { characters: data?.data || [], isLoading, error };
};
