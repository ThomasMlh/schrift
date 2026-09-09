import useSWR from 'swr';
import type { IActivityLogEntry, IActivityResponse } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Référence stable — voir la même précaution dans useSettings.ts.
const EMPTY_ACTIVITY: IActivityLogEntry[] = [];

export const useActivity = (options?: {
  enabled?: boolean;
  page?: number;
  limit?: number;
  guilde_id?: string;
  type?: string;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { enabled = true, page = 1, limit = 20, guilde_id, type } = options || {};

  let url: string | null = `${apiUrl}/api/activity`;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (guilde_id) params.append('guilde_id', guilde_id);
  if (type) params.append('type', type);
  if (params.toString()) url += `?${params.toString()}`;
  if (!enabled) url = null;

  const { data, error, isLoading, mutate } = useSWR<IActivityResponse>(url, authenticatedFetcher, {
    revalidateOnFocus: false,
  });

  return {
    activity: data?.activity ?? EMPTY_ACTIVITY,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
};
