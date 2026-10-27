import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';
import type { ICharacterSyncResult, IGameSyncResult } from '@/types/character';

export const useAdminMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const updateCharacters = async (options: { dryRun?: boolean } = {}) => {
    return request<ICharacterSyncResult>(`${apiUrl}/api/characters/update`, {
      method: 'POST',
      body: JSON.stringify({ dryRun: options.dryRun === true }),
    }, { fallbackError: 'Erreur lors de la mise à jour des personnages' });
  };

  // Sync from the game master tables; a simulation unless dryRun is false
  const syncGameCharacters = async (options: { dryRun: boolean }) => {
    return request<IGameSyncResult>(`${apiUrl}/api/characters/game-sync`, {
      method: 'POST',
      body: JSON.stringify({ dryRun: options.dryRun }),
    }, { fallbackError: 'Erreur lors de la synchronisation avec les tables du jeu' });
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

  // Asks the bot to resync Discord banners, avatars and names (may take 1-2 min)
  const syncDiscordProfiles = async () => {
    return request<{
      success: boolean;
      total: number;
      updated: number;
      unchanged: number;
      null_set: number;
      missing_on_server: number;
      lookup_errors: number;
      patch_errors: number;
      servers?: string[];
      changed_players?: { name: string; discord_id: string; changes: string[] }[];
    }>(`${apiUrl}/api/admin/sync-profiles`, {
      method: 'POST',
    }, { fallbackError: 'Erreur lors de la synchronisation des profils Discord' });
  };

  const createIndexes = async () => {
    return request<{
      success: boolean;
      total: number;
      created: number;
      failed: { collection: string; error?: string }[];
    }>(`${apiUrl}/api/admin/create-indexes`, {
      method: 'POST',
    }, { fallbackError: 'Erreur lors de la création des index' });
  };

  return { updateCharacters, syncGameCharacters, checkBotHealth, uploadImages, syncDiscordProfiles, createIndexes };
};
