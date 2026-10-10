import useSWR from 'swr';
import type { IAlbum, IAlbumCharacter } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

export const albumUrl = (bbsId: string) => `${apiUrl}/api/albums/${encodeURIComponent(bbsId)}`;

// Album de personnages d'un compte bbs (public)
export const useAlbum = (bbsId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: IAlbum }>(
    bbsId ? albumUrl(bbsId) : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { album: data?.data, isLoading, error, mutate };
};

// Catalogue complet des personnages, léger, pour la grille de l'album
export const useCharacterCatalog = () => {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IAlbumCharacter[] }>(
    `${apiUrl}/api/characters/catalog`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return { characters: data?.data || [], isLoading, error };
};
