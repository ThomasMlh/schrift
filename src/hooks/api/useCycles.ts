import useSWR from 'swr';
import { useState, useCallback } from 'react';
import type { ICycle, IRotationTemplate, IScoreDetailApiResponse, IPagination } from '../../interfaces';
import { apiUrl, fetcher, normalizeList, useAuthenticatedFetcher } from './shared';

export const useCycles = (options?: { limit?: number; page?: number; authenticated?: boolean }) => {
  const { limit, page, authenticated = false } = options || {};
  const authenticatedFetcher = useAuthenticatedFetcher();

  let url = `${apiUrl}/api/cycles`;
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (page) params.append('page', page.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: ICycle[]; success?: boolean; pagination?: IPagination }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { items: cycles, pagination } = normalizeList<ICycle>(data);
  return { cycles, pagination, isLoading, error, mutate };
};

export const useCycle = (cycleId?: string) => {
  const url = cycleId ? `${apiUrl}/api/cycles/${cycleId}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ cycle?: ICycle; success?: boolean }>(
    url,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { cycle: data?.cycle, isLoading, error, mutate };
};

export const useRotations = () => {
  const url = `${apiUrl}/api/rotations`;

  const { data, error, isLoading, mutate } = useSWR<IRotationTemplate[] | { data?: IRotationTemplate[]; rotations?: IRotationTemplate[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { items: rotations } = normalizeList<IRotationTemplate>(data, ['rotations']);
  return { rotations, isLoading, error, mutate };
};

export const useRotationScores = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRotationScores = useCallback(async (
    cycleId: string,
    position: string,
    options: { page?: number; limit?: number; guildName?: string } = {}
  ): Promise<IScoreDetailApiResponse | null> => {
    if (!cycleId || !position) return null;

    const { page = 1, limit = 20, guildName } = options;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (guildName) params.append('guild', guildName);

      const response = await fetch(
        `${apiUrl}/api/cycles/${cycleId}/rotations/${position}/scores?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Rotation introuvable' : 'Erreur lors du chargement des scores');
      }

      return await response.json() as IScoreDetailApiResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchRotationScores, isLoading, error };
};
