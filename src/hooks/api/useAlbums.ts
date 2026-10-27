import useSWR from 'swr';
import { useAuth } from '../../providers/AuthProvider';
import type { IAlbum, IAlbumCharacter, IGuildAlbumMember } from '../../interfaces';
import { apiUrl, fetcher, useAuthenticatedFetcher } from './shared';

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

// Albums of every account in a guild. Logged-in users only.
export const useGuildAlbums = (guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { token } = useAuth();
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IGuildAlbumMember[] }>(
    guildId && token ? `${apiUrl}/api/albums/guild/${encodeURIComponent(guildId)}` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );

  return { members: data?.data || [], isLoading, error };
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
