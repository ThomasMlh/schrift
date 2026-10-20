import useSWR from 'swr';
import type { IUser, IPagination } from '../../interfaces';
import { apiUrl, fetcher, useAuthenticatedFetcher } from './shared';

export const useUsers = (options?: {
  authenticated?: boolean;
  enabled?: boolean;
  page?: number;
  limit?: number;
  guilde_id?: string;
  role?: string;
  search?: string;
  is_banned?: string;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { authenticated = true, enabled = true, page = 1, limit = 50, guilde_id, role, search, is_banned } = options || {};

  let url: string | null = `${apiUrl}/api/users`;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (guilde_id) params.append('guilde_id', guilde_id);
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  if (is_banned) params.append('is_banned', is_banned);
  if (params.toString()) url += `?${params.toString()}`;
  if (!enabled) url = null;

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

// List per bbs account (not per user): a player with several accounts appears once per account, each
// with its own guild/role. Used by the public player list, consistent with rankings and guild rosters.
export const useUserAccounts = (options?: {
  authenticated?: boolean;
  enabled?: boolean;
  page?: number;
  limit?: number;
  guilde_id?: string;
  role?: string;
  search?: string;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { authenticated = false, enabled = true, page = 1, limit = 50, guilde_id, role, search } = options || {};

  let url: string | null = `${apiUrl}/api/users/accounts`;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (guilde_id) params.append('guilde_id', guilde_id);
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  if (params.toString()) url += `?${params.toString()}`;
  if (!enabled) url = null;

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    users: IUser[];
    pagination: IPagination;
    activeFilters: { guilde_id: string | null; role: string | null; search: string | null };
  }>(url, authenticated ? authenticatedFetcher : fetcher, { revalidateOnFocus: false });

  return {
    accounts: data?.users || [],
    pagination: data?.pagination,
    activeFilters: data?.activeFilters,
    isLoading,
    error,
    mutate,
  };
};

// Authenticated when logged in: admins then also get the ban details
export const useUser = (userId: string | undefined) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = userId ? `${apiUrl}/api/users/${userId}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ user: IUser }>(url, authenticatedFetcher, { revalidateOnFocus: false });
  return { user: data?.user, isLoading, error, mutate };
};

// bbs_name is NOT guaranteed unique (two accounts, alts of one player or not, may share a name).
// It is the default readable path, but bbsId, when provided (e.g. ?compte=... in the URL), takes
// precedence and targets the exact account.
export const useUserByBBSName = (bbs_name: string | undefined, bbsId?: string) => {
  const { users, isLoading } = useUsers({ search: bbs_name, limit: 10, authenticated: false });

  let user: IUser | undefined;
  let matchedBbsId: string | undefined;

  if (bbs_name) {
    for (const u of users) {
      if (bbsId) {
        if (u.bbs_id === bbsId) {
          user = u;
          matchedBbsId = bbsId;
          break;
        }
        const altById = u.bbs_accounts?.find(a => a.bbs_id === bbsId);
        if (altById) {
          user = u;
          matchedBbsId = bbsId;
          break;
        }
        continue;
      }
      if (u.bbs_name === bbs_name) {
        user = u;
        matchedBbsId = u.bbs_id;
        break;
      }
      const altMatch = u.bbs_accounts?.find(a => a.bbs_name === bbs_name);
      if (altMatch) {
        user = u;
        matchedBbsId = altMatch.bbs_id;
        break;
      }
    }
  }

  return { user, matchedBbsId, isLoading };
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

// Optional bbsId scopes the stats to one account (server default = main account). Each bbs account
// has its own history and ranking, never merged across alts.
const buildUserStatsUrl = (userId: string, cycleId?: string, bbsId?: string) => {
  const params = new URLSearchParams();
  if (cycleId) params.set('cycle_id', cycleId);
  if (bbsId) params.set('bbs_id', bbsId);
  const query = params.toString();
  return `${apiUrl}/api/users/${userId}/stats${query ? `?${query}` : ''}`;
};

export const useUserStats = (userId: string | undefined, cycleId?: string, bbsId?: string) => {
  const url = userId ? buildUserStatsUrl(userId, cycleId, bbsId) : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: { stats: IUserStats } }>(url, fetcher, { revalidateOnFocus: false });
  return { stats: data?.data?.stats, isLoading, error, mutate };
};

export const fetchUserStats = async (userId: string, cycleId?: string, bbsId?: string): Promise<IUserStats | null> => {
  try {
    const response = await fetch(buildUserStatsUrl(userId, cycleId, bbsId));
    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.stats || null;
  } catch (error) {
    console.error(`Error fetching user stats for ${userId}:`, error);
    return null;
  }
};
