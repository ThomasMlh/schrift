import useSWR from 'swr';
import type {
  IRotationHistory, IRotationRankedScore, IRotationRecord, IUserAccountAchievements, IUserAccountRecords,
} from '../../interfaces';
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

interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { currentPage: number; totalPages: number; totalCount: number };
}

const pageParams = (page: number, limit: number, guildId?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (guildId) params.set('guild_id', guildId);
  return params;
};

// Ranking of a rotation in one cycle, with each player's score on its previous passage
export const useRotationRanking = (rotationId: string | undefined, cycleId: string | undefined, guildId: string | undefined, page: number, limit: number) => {
  const params = pageParams(page, limit, guildId);
  if (cycleId) params.set('cycle_id', cycleId);
  const url = rotationId && cycleId ? `${apiUrl}/api/rotations/${rotationId}/scores?${params.toString()}` : null;
  const { data, error, isLoading } = useSWR<Paginated<IRotationRankedScore>>(url, fetcher, { revalidateOnFocus: false, keepPreviousData: true });
  return { scores: data?.data ?? [], pagination: data?.pagination ?? null, isLoading, error };
};

// Best score of each player on a rotation over every cycle
export const useRotationRecords = (rotationId: string | undefined, guildId: string | undefined, page: number, limit: number, enabled = true) => {
  const url = rotationId && enabled ? `${apiUrl}/api/rotations/${rotationId}/records?${pageParams(page, limit, guildId).toString()}` : null;
  const { data, error, isLoading } = useSWR<Paginated<IRotationRecord>>(url, fetcher, { revalidateOnFocus: false, keepPreviousData: true });
  return { records: data?.data ?? [], pagination: data?.pagination ?? null, isLoading, error };
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
