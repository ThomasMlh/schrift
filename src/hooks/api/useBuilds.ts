import useSWR from 'swr';
import type { IBuild, IBuildsResponse } from '../../interfaces';
import { apiUrl, fetcher, useAuthenticatedFetcher } from './shared';

export const useBuilds = (options?: {
  page?: number;
  limit?: number;
  rotation_id?: string;
  isValid?: boolean;
  authenticated?: boolean;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { page = 1, limit = 20, rotation_id, isValid, authenticated = false } = options || {};

  let url = `${apiUrl}/api/builds?page=${page}&limit=${limit}`;
  if (rotation_id) url += `&rotation_id=${encodeURIComponent(rotation_id)}`;
  if (isValid !== undefined) url += `&isValid=${isValid}`;

  const { data, error, isLoading, mutate } = useSWR<IBuildsResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return { builds: data?.data || [], pagination: data?.pagination, filters: data?.filters, isLoading, error, mutate };
};

export const useBuild = (buildId?: string, authenticated: boolean = false) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = buildId ? `${apiUrl}/api/builds/${buildId}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: IBuild }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false }
  );

  return { build: data?.data, isLoading, error, mutate };
};
