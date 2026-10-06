import useSWR from 'swr';
import type { IGuildGoalsResponse } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

// Objectifs d'une guilde sur un cycle (cycle en cours par défaut), avec leur progression. Public.
export const useGuildGoals = (guildId?: string, cycleId?: string) => {
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/goals${cycleId ? `?cycle_id=${cycleId}` : ''}` : null;
  const { data, error, isLoading, mutate } = useSWR<IGuildGoalsResponse>(url, fetcher, { revalidateOnFocus: false });
  return { data: data ?? null, isLoading, error, mutate };
};
