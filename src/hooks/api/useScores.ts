import useSWR from 'swr';
import { useState, useCallback } from 'react';
import type { IScoresResponse, IPodiumResponse, IPodiumWeeklyResponse, IPodiumMissesResponse, PodiumRankingType } from '../../interfaces';
import { apiUrl, fetcher, useAuthenticatedFetcher } from './shared';

export const useScores = (options?: {
  page?: number;
  limit?: number;
  search?: string;
  cycle_id?: string;
  rotation_id?: string;
  guild_id?: string;
  bbs_id?: string;
  authenticated?: boolean;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { page = 1, limit = 20, search, cycle_id, rotation_id, guild_id, bbs_id, authenticated = false } = options || {};

  let url = `${apiUrl}/api/scores?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (cycle_id) url += `&cycle_id=${encodeURIComponent(cycle_id)}`;
  if (rotation_id) url += `&rotation_id=${encodeURIComponent(rotation_id)}`;
  if (guild_id) url += `&guild_id=${encodeURIComponent(guild_id)}`;
  if (bbs_id) url += `&bbs_id=${encodeURIComponent(bbs_id)}`;

  const { data, error, isLoading, mutate } = useSWR<IScoresResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return { scores: data?.data || [], pagination: data?.pagination, isLoading, error, mutate };
};

export const usePodium = (options?: {
  cycle_id?: string;
  guild_id?: string | null;
  rotation_id?: string;
  authenticated?: boolean;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { cycle_id, guild_id, rotation_id, authenticated = false } = options || {};

  let url: string | null = null;
  if (cycle_id) {
    const params = new URLSearchParams({ cycle_id });
    if (guild_id) params.append('guild_id', guild_id);
    if (rotation_id) params.append('rotation_id', rotation_id);
    url = `${apiUrl}/api/podium?${params.toString()}`;
  }

  const { data, error, isLoading, mutate } = useSWR<IPodiumResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    podium: data?.podium || data?.data || [],
    pagination: data?.pagination,
    meta: data?.meta,
    filters: data?.filters,
    isLoading,
    error,
    mutate,
  };
};

export const usePodiumFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodium = useCallback(async (
    mode: 'cycle' | 'rotation' | 'weekly' | 'misses',
    cycleName: string,
    options: {
      cycleYear?: number;
      rankingType?: PodiumRankingType;
      rotationId?: string;
      weekNumber?: string;
      guildName?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse | null> => {
    if (!cycleName) return null;

    const { cycleYear, rankingType = 'average', rotationId, weekNumber, guildName, page = 1, limit = 50 } = options;
    setIsLoading(true);
    setError(null);

    try {
      let url = '';

      if (mode === 'weekly') {
        if (!weekNumber) return null;
        url = `${apiUrl}/api/podium/weekly?cycle_name=${encodeURIComponent(cycleName)}&week_number=${weekNumber}&page=${page}&limit=${limit}`;
      } else if (mode === 'misses') {
        url = `${apiUrl}/api/podium/misses?cycle_name=${encodeURIComponent(cycleName)}&page=${page}&limit=${limit}`;
      } else {
        url = `${apiUrl}/api/podium/full?cycle_name=${encodeURIComponent(cycleName)}&page=${page}&limit=${limit}`;
        if (mode === 'cycle') url += `&ranking_type=${encodeURIComponent(rankingType)}`;
        if (rotationId?.trim()) url += `&rotation_id=${encodeURIComponent(rotationId)}`;
      }

      if (cycleYear) url += `&year=${cycleYear}`;
      if (guildName?.trim()) url += `&guild_name=${encodeURIComponent(guildName.trim())}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Impossible de charger le podium');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du podium');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchPodium, isLoading, error };
};
