import useSWR from 'swr';
import type { IUser, IPagination } from '../../interfaces';
import { apiUrl, fetcher, useAuthenticatedFetcher } from './shared';

export const useUsers = (options?: {
  authenticated?: boolean;
  page?: number;
  limit?: number;
  guilde_id?: string;
  role?: string;
  search?: string;
  is_banned?: string;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { authenticated = true, page = 1, limit = 50, guilde_id, role, search, is_banned } = options || {};

  let url = `${apiUrl}/api/users`;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (guilde_id) params.append('guilde_id', guilde_id);
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  if (is_banned) params.append('is_banned', is_banned);
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    users: IUser[];
    pagination: IPagination;
    activeFilters: { guilde_id: string | null; role: string | null; search: string | null };
  }>(url, authenticated ? authenticatedFetcher : fetcher, { revalidateOnFocus: false });

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    activeFilters: data?.activeFilters,
    isLoading,
    error,
    mutate,
  };
};

export const useUser = (userId: string | undefined) => {
  const url = userId ? `${apiUrl}/api/users/${userId}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ user: IUser }>(url, fetcher, { revalidateOnFocus: false });
  return { user: data?.user, isLoading, error, mutate };
};

export interface IUserStats {
  totalScores: number;
  averageScore: number;
  totalPoints: number;
  allRotations: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    rotation_position?: number;
    cycle_id: string;
    averageScore: number;
    scoreCount: number;
  }[];
  bestRotation: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
    averageScore: number;
    totalScore: number;
    scoreCount: number;
  } | null;
  worstRotation: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
    averageScore: number;
    totalScore: number;
    scoreCount: number;
  } | null;
  bestScore: {
    score: number;
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
  };
  worstScore: {
    score: number;
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
  };
  ranking?: {
    global: number | null;
    totalPlayers: number | null;
    guild: number | null;
    totalGuildPlayers: number | null;
    percentile: number | null;
    gapWithTop1: number | null;
  };
  bestCycle?: {
    cycle_id: string;
    cycle_name?: string;
    averageScore: number;
    totalScore: number;
    scoreCount: number;
  } | null;
  firstParticipation?: string | null;
  buildsCount?: number;
  temporalEvolution?: {
    cycle_id: string;
    cycle_name: string;
    averageScore: number;
    scoreCount: number;
    year?: number;
    start_date?: string;
  }[];
  missRate?: number;
  missCount?: number;
  recentTrend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    recentAverage: number;
    previousAverage: number;
    scores: {
      score: number;
      rotation_killer: string;
      rotation_attack: string;
      rotation_position: number;
      rotation_start_date: string;
    }[];
  } | null;
  rivals?: {
    rank: number;
    user_id: string;
    discord_id?: string;
    global_name?: string;
    bbs_name?: string;
    avatar?: string;
    guilde_id?: string;
    guild_name?: string | null;
    averageScore: number;
    scoreDifference: number;
  }[];
  medianScore?: number;
  stdDeviation?: number;
  consistencyScore?: number;
  cyclesWithFullParticipation?: number;
  guildContribution?: {
    averagePct: number;
    byCycle: {
      cycle_id: string;
      userTotal: number;
      guildTotal: number;
      contributionPct: number;
    }[];
  } | null;
  performanceByQuartile?: { quartile: string; averageScore: number; count: number }[];
  performanceByAttack?: { attack: string; averageScore: number; count: number }[];
  performanceByAlteration?: { alteration: string; averageScore: number; count: number }[];
}

export const useUserStats = (userId: string | undefined, cycleId?: string) => {
  const url = userId
    ? `${apiUrl}/api/users/${userId}/stats${cycleId ? `?cycle_id=${cycleId}` : ''}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: { stats: IUserStats } }>(url, fetcher, { revalidateOnFocus: false });
  return { stats: data?.data?.stats, isLoading, error, mutate };
};

export const fetchUserStats = async (userId: string, cycleId?: string): Promise<IUserStats | null> => {
  try {
    const url = `${apiUrl}/api/users/${userId}/stats${cycleId ? `?cycle_id=${cycleId}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.stats || null;
  } catch (error) {
    console.error(`Error fetching user stats for ${userId}:`, error);
    return null;
  }
};
