import useSWR from 'swr';
import type {
  ICycleRecap, IDeclineAlert, IMissingScoresResponse, IPagination, IRotationPreparation, IScoreAnomaly,
  IScoreHistoryEntry, ScoreHistoryAction,
} from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Members' declines (leaders: their guilds; admins: all, or guildId).
export const useDeclineAlerts = (guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/scores/decline-alerts${guildId ? `?guild_id=${guildId}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; alerts: IDeclineAlert[] }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );

  return { alerts: data?.alerts ?? [], isLoading, error, mutate };
};

// Preview of a guild's end-of-cycle recap (admin), without sending anything.
export const useCycleRecapPreview = (cycleId?: string, guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = cycleId && guildId ? `${apiUrl}/api/podium/cycle-recap?cycle_id=${cycleId}&guild_id=${guildId}` : null;

  const { data, error, isLoading } = useSWR<{ success: boolean; recap: ICycleRecap }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );

  return { recap: data?.recap ?? null, isLoading, error };
};

// Scores to review (probable typos) on recent cycles.
export const useScoreAnomalies = (guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/scores/anomalies${guildId ? `?guild_id=${guildId}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; anomalies: IScoreAnomaly[] }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );

  return { anomalies: data?.anomalies ?? [], isLoading, error, mutate };
};

// Paginated history of score changes (leaders: their guilds; admins: everything).
export const useScoreHistory = (filters: { guildId?: string; action?: ScoreHistoryAction; page?: number }) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const params = new URLSearchParams({ page: String(filters.page ?? 1), limit: '30' });
  if (filters.guildId) params.set('guild_id', filters.guildId);
  if (filters.action) params.set('action', filters.action);

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; entries: IScoreHistoryEntry[]; pagination: IPagination }>(
    `${apiUrl}/api/scores/history?${params.toString()}`,
    authenticatedFetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  return { entries: data?.entries ?? [], pagination: data?.pagination ?? null, isLoading, error, mutate };
};

// Missing scores of a cycle (current cycle by default) for a guild.
export const useMissingScores = (guildId?: string, cycleId?: string, enabled = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const params = new URLSearchParams();
  if (guildId) params.set('guild_id', guildId);
  if (cycleId) params.set('cycle_id', cycleId);
  const url = enabled ? `${apiUrl}/api/scores/missing?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<IMissingScoresResponse>(url, authenticatedFetcher, { revalidateOnFocus: false });
  return { data: data ?? null, isLoading, error, mutate };
};

// Rotation preparation sheet (next rotation of the current cycle by default).
export const useRotationPreparation = (guildId?: string, rotationId?: string, cycleId?: string, enabled = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const params = new URLSearchParams();
  if (guildId) params.set('guild_id', guildId);
  if (rotationId) params.set('rotation_id', rotationId);
  if (cycleId) params.set('cycle_id', cycleId);
  const url = enabled ? `${apiUrl}/api/scores/preparation?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<IRotationPreparation>(url, authenticatedFetcher, { revalidateOnFocus: false });
  return { data: data ?? null, isLoading, error };
};
