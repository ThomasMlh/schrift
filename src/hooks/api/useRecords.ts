import useSWR from 'swr';
import type { IRotationHistory, IUserAccountRecords } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

// Historique d'un killer sur tous les cycles (records, moyennes par cycle, score à battre).
// guildId restreint records/moyennes à la guilde ; cycleId sert à calculer le score à battre.
export const useRotationHistory = (rotationId?: string, guildId?: string, cycleId?: string) => {
  const params = new URLSearchParams();
  if (guildId) params.set('guild_id', guildId);
  if (cycleId) params.set('cycle_id', cycleId);
  const url = rotationId ? `${apiUrl}/api/rotations/${rotationId}/history?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<{ success: boolean; data: IRotationHistory }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { history: data?.data ?? null, isLoading, error };
};

// Records personnels (meilleur score par killer) de chaque compte bbs d'un joueur.
export const useUserRecords = (userId?: string) => {
  const url = userId ? `${apiUrl}/api/users/${userId}/records` : null;

  const { data, error, isLoading } = useSWR<{ success: boolean; data: IUserAccountRecords[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { accounts: data?.data ?? [], isLoading, error };
};
