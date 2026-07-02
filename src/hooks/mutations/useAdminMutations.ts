import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';

export const useAdminMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const updateCharacters = async () => {
    return request(`${apiUrl}/api/characters/update`, {
      method: 'POST',
    }, { fallbackError: 'Erreur lors de la mise à jour des personnages' });
  };

  const updateCharactersFromGameDB = async () => {
    return request(`${apiUrl}/api/characters/update/game-db`, {
      method: 'POST',
    }, { fallbackError: 'Erreur lors de la synchronisation depuis la DB du jeu' });
  };

  const checkBotHealth = async (): Promise<{
    success: boolean;
    online: boolean;
    data?: { status?: string; bot?: string };
    error?: string;
  }> => {
    return request<{ success: boolean; online: boolean; data?: { status?: string; bot?: string }; error?: string }>(`${apiUrl}/api/admin/bot-health`, {
      method: 'GET',
    }, { fallbackError: 'Erreur vérification bot' });
  };

  const uploadImages = async (
    batchSize = 100,
    onProgress?: (totalUploaded: number, remaining: number) => void
  ): Promise<{ totalUploaded: number }> => {
    let totalUploaded = 0;
    let remaining = 1;

    while (remaining > 0) {
      const data = await request<{ statistics?: { uploaded?: number; remaining?: number } }>(
        `${apiUrl}/api/characters/update/images`,
        { method: 'POST', body: JSON.stringify({ batchSize }) },
        { fallbackError: 'Erreur upload images' }
      );
      totalUploaded += data.statistics?.uploaded || 0;
      remaining = data.statistics?.remaining || 0;
      onProgress?.(totalUploaded, remaining);
    }

    return { totalUploaded };
  };

  const uploadGameDbImages = async (
    batchSize = 50,
    onProgress?: (totalUploaded: number, remaining: number) => void
  ): Promise<{ totalUploaded: number }> => {
    let totalUploaded = 0;
    let remaining = 1;

    while (remaining > 0) {
      const data = await request<{ statistics?: { uploaded?: number; remaining?: number } }>(
        `${apiUrl}/api/characters/update/game-db/images`,
        { method: 'POST', body: JSON.stringify({ batchSize }) },
        { fallbackError: 'Erreur upload images DB du jeu' }
      );
      totalUploaded += data.statistics?.uploaded || 0;
      remaining = data.statistics?.remaining || 0;
      onProgress?.(totalUploaded, remaining);
    }

    return { totalUploaded };
  };

  return { updateCharacters, checkBotHealth, uploadImages, updateCharactersFromGameDB, uploadGameDbImages };
};
