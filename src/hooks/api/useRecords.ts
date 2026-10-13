import useSWR from 'swr';
import type { IRotationHistory, IUserAccountAchievements, IUserAccountRecords } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

// History of a killer across all cycles (records, per-cycle averages, score to beat).
// guildId restricts records/averages to the guild; cycleId is used for the score to beat.
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

// Personal records (best score per killer) of each bbs account of a player.
export const useUserRecords = (userId?: string) => {
  const url = userId ? `${apiUrl}/api/users/${userId}/records` : null;

  const { data, error, isLoading } = useSWR<{ success: boolean; data: IUserAccountRecords[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { accounts: data?.data ?? [], isLoading, error };
};

// Achievements of each bbs account of a player, with the rarity of each tier.
export const useUserAchievements = (userId?: string) => {
  const url = userId ? `${apiUrl}/api/users/${userId}/achievements` : null;

  const { data, error, isLoading } = useSWR<{ success: boolean; total_accounts: number; data: IUserAccountAchievements[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { accounts: data?.data ?? [], totalAccounts: data?.total_accounts ?? 0, isLoading, error };
};
