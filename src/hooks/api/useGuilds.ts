import useSWR from 'swr';
import type { IGuild, IUser, IPagination } from '../../interfaces';
import { apiUrl, fetcher, normalizeList, useAuthenticatedFetcher } from './shared';

export const useGuilds = (authenticated: boolean = false, includeDisabled: boolean = false) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/guildes?include_disabled=${includeDisabled}`;

  const { data, error, isLoading, mutate } = useSWR<IGuild[] | { guilds?: IGuild[]; data?: IGuild[]; success?: boolean }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { items: guilds } = normalizeList<IGuild>(data, ['guilds']);
  return { guilds, isLoading, error, mutate };
};

export const useGuildMembers = (guildId?: string, authenticated: boolean = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/membres` : null;

  const { data, error, isLoading, mutate } = useSWR<IUser[] | { data?: IUser[]; success?: boolean }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false }
  );

  const { items: members } = normalizeList<IUser>(data);
  return { members, isLoading, error, mutate };
};

export const useAllGuildsMemberCounts = (authenticated: boolean = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/guildes/members-summary`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Record<string, number> }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { memberCounts: data?.data || {}, isLoading, error, refresh: mutate };
};

export const useAllGuildsMembers = (guilds: IGuild[], authenticated: boolean = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const f = authenticated ? authenticatedFetcher : fetcher;

  const guildIds = guilds.map(g => g._id).sort().join(',');

  // String key (not an array) prefixed with /api/guildes: invalidateKeys() only matches string keys
  // by prefix (see apiRequest.ts), so a composite key would be skipped by every mutation that
  // invalidates '/api/guildes' (draft, member add/remove, role change…), leaving this cache stale.
  const { data, error, isLoading, mutate } = useSWR<Record<string, IUser[]>>(
    guildIds ? `${apiUrl}/api/guildes/all-members?ids=${guildIds}` : null,
    async () => {
      const results = await Promise.all(
        guilds.map(g => f(`${apiUrl}/api/guildes/${g._id}/membres`))
      );
      const membersByGuild: Record<string, IUser[]> = {};
      guilds.forEach((g, i) => {
        membersByGuild[g._id] = results[i]?.data || [];
      });
      return membersByGuild;
    },
    { revalidateOnFocus: false }
  );

  return { membersByGuild: data || {}, isLoading, error, refresh: mutate };
};

// The API caps a page at 200 accounts: search server-side rather than loading everything
export const useGuildlessUsers = (enabled: boolean = false, search: string = "", limit: number = 200) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const term = search.trim();
  const url = enabled
    ? `${apiUrl}/api/users/without-guild?limit=${limit}${term ? `&search=${encodeURIComponent(term)}` : ""}`
    : null;
  const { data, error, isLoading } = useSWR(url, authenticatedFetcher, { keepPreviousData: true });

  return {
    users: (data?.users || []) as IUser[],
    totalCount: (data?.pagination as IPagination | undefined)?.totalCount || 0,
    isLoading,
    error,
  };
};

export const useGuild = (guildId: string | undefined) => {
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ name: string }>(url, fetcher, { revalidateOnFocus: false });
  return { guildName: data?.name, isLoading, error, mutate };
};

export interface IGuildStats {
  totalMembers: number;
  averageScore: number;
  totalScores: number;
  bestScore: number;
  totalPoints: number;
  clearRate: number;
}

export const useGuildStats = (guildId: string | undefined, cycleId?: string) => {
  const url = guildId
    ? `${apiUrl}/api/guildes/${guildId}/stats${cycleId ? `?cycle_id=${cycleId}` : ''}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: IGuildStats }>(url, fetcher, { revalidateOnFocus: false });
  return { stats: data?.data, isLoading, error, mutate };
};

export const fetchGuildStats = async (guildId: string, cycleId?: string): Promise<IGuildStats | null> => {
  try {
    const url = `${apiUrl}/api/guildes/${guildId}/stats${cycleId ? `?cycle_id=${cycleId}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error(`Error fetching guild stats for ${guildId}:`, error);
    return null;
  }
};

export interface IGuildRanking extends IGuildStats {
  _id: string;
  name: string;
  rank: number;
}

// Over a cycle, a game month (YYYY-MM), or all scores when neither is given
export const useGuildRankings = (cycleId?: string, month?: string) => {
  const params = new URLSearchParams();
  if (cycleId) params.set('cycle_id', cycleId);
  if (month) params.set('month', month);
  const query = params.toString();
  const url = `${apiUrl}/api/guildes/rankings${query ? `?${query}` : ''}`;
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IGuildRanking[] }>(url, fetcher, { revalidateOnFocus: false });
  return { rankings: data?.data || [], isLoading, error };
};

export interface IGuildTopMember {
  userId: string;
  bbsId?: string;
  username: string;
  bbs_name?: string;
  avatar?: string;
  discord_id?: string;
  bestScore: number;
  avgScore: number;
  totalScores: number;
}

export const useGuildTopMembers = (guildId?: string, cycleId?: string, limit = 3) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cycleId) params.set('cycle_id', cycleId);
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/top-members?${params}` : null;
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IGuildTopMember[] }>(url, fetcher, { revalidateOnFocus: false });
  return { topMembers: data?.data || [], isLoading, error };
};

export interface IScoreBucket {
  label: string;
  count: number;
}

export const useGuildScoreDistribution = (guildId?: string, cycleId?: string) => {
  const params = cycleId ? `?cycle_id=${cycleId}` : '';
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/score-distribution${params}` : null;
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IScoreBucket[] }>(url, fetcher, { revalidateOnFocus: false });
  return { distribution: data?.data || [], isLoading, error };
};

export interface IGuildEvolutionPoint {
  cycleId: string;
  cycleName: string;
  cycleYear: number;
  averageScore: number;
  totalScores: number;
  clearRate: number;
}

export const useGuildEvolution = (guildId?: string, limit = 6) => {
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/evolution?limit=${limit}` : null;
  const { data, error, isLoading } = useSWR<{ success: boolean; data: IGuildEvolutionPoint[] }>(url, fetcher, { revalidateOnFocus: false });
  return { evolution: data?.data || [], isLoading, error };
};

export interface ICommunityStats {
  totalMembers: number;
  totalGuilds: number;
  totalScores: number;
  globalClearRate: number;
  avgScore: number;
}

export const useCommunityStats = (cycleId?: string) => {
  const url = `${apiUrl}/api/stats/community${cycleId ? `?cycle_id=${cycleId}` : ''}`;
  const { data, error, isLoading } = useSWR<{ success: boolean; data: ICommunityStats }>(url, fetcher, { revalidateOnFocus: false });
  return { stats: data?.data, isLoading, error };
};
