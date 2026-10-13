import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest } from '@/utils/apiRequest';
import { albumUrl } from '@/hooks/api/useAlbums';
import type { IAlbum } from '@/interfaces';

export const useAlbumMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  // spe = 0 removes the character from the album
  const setCharacterSpe = (bbsId: string, characterId: string, spe: number) =>
    request<{ success: boolean; data: IAlbum }>(`${albumUrl(bbsId)}/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify({ spe }),
    }, { fallbackError: "Erreur lors de la mise à jour de l'album" });

  return { setCharacterSpe };
};
