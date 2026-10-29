import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest } from '@/utils/apiRequest';
import { albumUrl } from '@/hooks/api/useAlbums';
import type { IAlbum } from '@/interfaces';

export const useAlbumMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  // Every change of an editing session at once; spe = 0 removes the character from the album
  const saveAlbum = (bbsId: string, changes: Record<string, number>) =>
    request<{ success: boolean; data: IAlbum }>(albumUrl(bbsId), {
      method: 'PUT',
      body: JSON.stringify({ changes }),
    }, { fallbackError: "Erreur lors de la mise à jour de l'album" });

  return { saveAlbum };
};
