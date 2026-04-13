import useSWR from 'swr';
import type { ICycle, IGuild, IUser, ICharactersResponse, ICharacter, IRotationTemplate, IScoresResponse, IPodiumResponse, IPodiumWeeklyResponse, IPodiumMissesResponse, IOrbGuideResponse, IPagination, IScoreDetailApiResponse } from '../interfaces';
import { useAuth } from '../providers/AuthProvider';
import { useState, useCallback, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Fonction fetcher générique
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données');
  }
  const data = await response.json();
  return data;
};

// Hook pour créer un fetcher authentifié
const useAuthenticatedFetcher = () => {
  const { token } = useAuth();
  
  return async (url: string) => {
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }
    const data = await response.json();
    return data;
  };
};

// Hook pour récupérer les cycles
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
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache de 60 secondes
    }
  );

  // Normaliser la réponse (peut être un tableau ou un objet avec data)
  let cycles: ICycle[] = [];
  let pagination = null;
  if (data) {
    if (Array.isArray(data)) {
      cycles = data;
    } else if (data.data) {
      cycles = data.data;
      pagination = data.pagination || null;
    }
  }

  return {
    cycles,
    pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer un cycle spécifique
export const useCycle = (cycleId?: string) => {
  const url = cycleId ? `${apiUrl}/api/cycles/${cycleId}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<{ cycle?: ICycle; success?: boolean }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    cycle: data?.cycle,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les guildes
export const useGuilds = (authenticated: boolean = false, includeDisabled: boolean = false) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/guildes`;
  
  const { data, error, isLoading, mutate } = useSWR<IGuild[] | { guilds?: IGuild[]; data?: IGuild[]; success?: boolean }>(
    `${url}?include_disabled=${includeDisabled}`,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache de 60 secondes
    }
  );

  // Normaliser la réponse
  let guilds: IGuild[] = [];
  if (data) {
    if (Array.isArray(data)) {
      guilds = data;
    } else if (data.guilds) {
      guilds = data.guilds;
    } else if (data.data) {
      guilds = data.data;
    }
  }

  return {
    guilds,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les membres d'une guilde
export const useGuildMembers = (guildId?: string, authenticated: boolean = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/membres` : null;
  
  const { data, error, isLoading, mutate } = useSWR<IUser[] | { data?: IUser[]; success?: boolean }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Normaliser la réponse
  let members: IUser[] = [];
  if (data) {
    if (Array.isArray(data)) {
      members = data;
    } else if (data.data) {
      members = data.data;
    }
  }

  return {
    members,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer le nombre de membres pour toutes les guildes
export const useAllGuildsMemberCounts = (guilds: IGuild[], authenticated: boolean = true) => {
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [membersByGuild, setMembersByGuild] = useState<Record<string, IUser[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (guilds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchAllMembers = async () => {
      setIsLoading(true);
      setError(null);
      const counts: Record<string, number> = {};
      const members: Record<string, IUser[]> = {};

      try {
        // Fetch tous les membres en parallèle
        const promises = guilds.map(guild =>
          fetch(`${apiUrl}/api/guildes/${guild._id}/membres`, {
            headers: authenticated && token ? { 'Authorization': `Bearer ${token}` } : {},
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) {
                const guildMembers = Array.isArray(data) ? data : (data.data || []);
                counts[guild._id] = guildMembers.length;
                members[guild._id] = guildMembers;
              } else {
                counts[guild._id] = 0;
                members[guild._id] = [];
              }
            })
            .catch(() => {
              counts[guild._id] = 0;
              members[guild._id] = [];
            })
        );

        await Promise.all(promises);
        setMemberCounts(counts);
        setMembersByGuild(members);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors de la récupération des membres'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMembers();
  }, [guilds, authenticated, token]);

  return {
    memberCounts,
    membersByGuild,
    isLoading,
    error,
  };
}

// Hook pour récupérer les utilisateurs sans guilde
export const useGuildlessUsers = (enabled: boolean = false) => {
  const authenticatedFetcher = useAuthenticatedFetcher();

  const url = enabled ? `${apiUrl}/api/users/without-guild?limit=1000` : null;
  const { data, error, isLoading } = useSWR(url, authenticatedFetcher);

  return {
    users: (data?.users || []) as IUser[],
    totalCount: data?.pagination?.totalCount || 0,
    isLoading,
    error,
  };
};

// Hook pour récupérer les utilisateurs
export const useUsers = (options?: {
  authenticated?: boolean;
  page?: number;
  limit?: number;
  guilde_id?: string;
  role?: string;
  search?: string;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { 
    authenticated = true, 
    page = 1, 
    limit = 50,
    guilde_id,
    role,
    search
  } = options || {};
  
  let url = `${apiUrl}/api/users`;
  const params = new URLSearchParams();
  
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (guilde_id) params.append('guilde_id', guilde_id);
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    users: IUser[];
    pagination: IPagination;
    activeFilters: {
      guilde_id: string | null;
      role: string | null;
      search: string | null;
    };
  }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    activeFilters: data?.activeFilters,
    isLoading,
    error,
    mutate,
  };
};

// Hook pour récupérer les personnages avec pagination
export const useCharacters = (options?: { 
  page?: number; 
  limit?: number;
  affinity?: string;
  category?: string;
  killer?: string;
  attackType?: string;
  searchQuery?: string;
}) =>{
  const { page = 1, limit = 20, affinity, category, killer, attackType, searchQuery } = options || {};
  
  let url = `${apiUrl}/api/characters?page=${page}&limit=${limit}`;
  if (affinity) url += `&affinity=${encodeURIComponent(affinity)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (killer) url += `&killer=${encodeURIComponent(killer)}`;
  if (attackType) url += `&attackType=${encodeURIComponent(attackType)}`;
  if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

  const { data, error, isLoading, mutate } = useSWR<ICharactersResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache de 30 secondes
    }
  );

  return {
    characters: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer un personnage spécifique
export const useCharacter = (characterId?: string) => {
  const url = characterId ? `${apiUrl}/api/characters/${characterId}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: ICharacter }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    character: data?.data,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les rotations
export const useRotations = () => {
  const url = `${apiUrl}/api/rotations`;
  
  const { data, error, isLoading, mutate } = useSWR<IRotationTemplate[] | { data?: IRotationTemplate[]; rotations?: IRotationTemplate[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache de 60 secondes
    }
  );

  // Normaliser la réponse
  let rotations: IRotationTemplate[] = [];
  if (data) {
    if (Array.isArray(data)) {
      rotations = data;
    } else if (data.data) {
      rotations = data.data;
    } else if (data.rotations) {
      rotations = data.rotations;
    }
  }

  return {
    rotations,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les scores avec pagination et filtres
export const useScores = (options?: {
  page?: number;
  limit?: number;
  search?: string;
  cycle_id?: string;
  rotation_id?: string;
  guild_id?: string;
  authenticated?: boolean;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { page = 1, limit = 20, search, cycle_id, rotation_id, guild_id, authenticated = false } = options || {};
  
  let url = `${apiUrl}/api/scores?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (cycle_id) url += `&cycle_id=${encodeURIComponent(cycle_id)}`;
  if (rotation_id) url += `&rotation_id=${encodeURIComponent(rotation_id)}`;
  if (guild_id) url += `&guild_id=${encodeURIComponent(guild_id)}`;

  const { data, error, isLoading, mutate } = useSWR<IScoresResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache de 10 secondes
    }
  );

  return {
    scores: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer le podium
export const usePodium = (options?: {
  cycle_id?: string;
  guild_id?: string | null;
  rotation_id?: string;
  authenticated?: boolean;
}) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { cycle_id, guild_id, rotation_id, authenticated = false } = options || {};
  
  // Ne pas faire de requête si cycle_id n'est pas fourni
  let url: string | null = null;
  if (cycle_id) {
    url = `${apiUrl}/api/podium`;
    const params = new URLSearchParams();
    params.append('cycle_id', cycle_id);
    if (guild_id) params.append('guild_id', guild_id);
    if (rotation_id) params.append('rotation_id', rotation_id);
    url += `?${params.toString()}`;
  }

  const { data, error, isLoading, mutate } = useSWR<IPodiumResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache de 30 secondes
    }
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
}

// Hook pour récupérer le guide des orbes
export const useOrbGuide = () => {
  const url = `${apiUrl}/api/guides/orbes`;
  
  const { data, error, isLoading, mutate } = useSWR<IOrbGuideResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache de 5 minutes (les guides changent rarement)
    }
  );

  return {
    orbData: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les builds avec pagination et filtres
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

  const { data, error, isLoading, mutate } = useSWR<import('../interfaces').IBuildsResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache de 10 secondes
    }
  );

  return {
    builds: data?.data || [],
    pagination: data?.pagination,
    filters: data?.filters,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer un build spécifique
export const useBuild = (buildId?: string, authenticated: boolean = false) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = buildId ? `${apiUrl}/api/builds/${buildId}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: import('../interfaces').IBuild }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    build: data?.data,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les skills avec recherche optionnelle
export const useSkills = (search?: string) => {
  let url = `${apiUrl}/api/skills`;
  if (search && search.trim() !== '') {
    url += `?search=${encodeURIComponent(search.trim())}`;
  }

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: import('../interfaces').ISkill[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache de 60 secondes
    }
  );

  return {
    skills: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les accessories avec recherche optionnelle
export const useAccessories = (search?: string) => {
  let url = `${apiUrl}/api/accessories`;
  if (search && search.trim() !== '') {
    url += `?search=${encodeURIComponent(search.trim())}`;
  }

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: import('../interfaces').IAccessory[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache de 60 secondes
    }
  );

  return {
    accessories: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les accessories subeffects avec recherche optionnelle
export const useAccessoriesSubeffects = (search?: string) => {
  let url = `${apiUrl}/api/accessories-subeffect`;
  if (search && search.trim() !== '') {
    url += `?search=${encodeURIComponent(search.trim())}`;
  }

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: import('../interfaces').IAccessorySubeffect[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache de 60 secondes
    }
  );

  return {
    subeffects: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer le podium (tous les modes) - version fetch
export const usePodiumFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodium = useCallback(async (
    mode: 'cycle' | 'rotation' | 'weekly' | 'misses',
    cycleName: string,
    options: {
      rankingType?: 'average' | 'max';
      rotationId?: string;
      weekNumber?: string;
      guildName?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse | null> => {
    if (!cycleName) {
      return null;
    }

    const {
      rankingType = 'average',
      rotationId,
      weekNumber,
      guildName,
      page = 1,
      limit = 50,
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      let url = '';

      // Construction de l'URL selon le mode
      if (mode === 'weekly') {
        if (!weekNumber) {
          return null;
        }
        url = `${apiUrl}/api/podium/weekly?cycle_name=${encodeURIComponent(
          cycleName
        )}&week_number=${weekNumber}&page=${page}&limit=${limit}`;
      } else if (mode === 'misses') {
        url = `${apiUrl}/api/podium/misses?cycle_name=${encodeURIComponent(
          cycleName
        )}&page=${page}&limit=${limit}`;
      } else {
        // Mode cycle ou rotation
        url = `${apiUrl}/api/podium/full?cycle_name=${encodeURIComponent(
          cycleName
        )}&page=${page}&limit=${limit}`;

        if (mode === 'cycle') {
          url += `&ranking_type=${encodeURIComponent(rankingType)}`;
        }

        if (rotationId && rotationId.trim() !== '') {
          url += `&rotation_id=${encodeURIComponent(rotationId)}`;
        }
      }

      if (guildName && guildName.trim() !== '') {
        url += `&guild_name=${encodeURIComponent(guildName.trim())}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Impossible de charger le podium');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du podium';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchPodium,
    isLoading,
    error,
  };
};

// Hook pour récupérer les scores d'une rotation spécifique
export const useRotationScores = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRotationScores = useCallback(async (
    cycleId: string,
    position: string,
    options: {
      page?: number;
      limit?: number;
      guildName?: string;
    } = {}
  ): Promise<IScoreDetailApiResponse | null> => {
    if (!cycleId || !position) {
      return null;
    }

    const { page = 1, limit = 20, guildName } = options;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (guildName) {
        params.append('guild', guildName);
      }

      const response = await fetch(
        `${apiUrl}/api/cycles/${cycleId}/rotations/${position}/scores?${params.toString()}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Rotation introuvable');
        }
        throw new Error('Erreur lors du chargement des scores');
      }

      const data: IScoreDetailApiResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchRotationScores,
    isLoading,
    error,
  };
};

// Hook pour récupérer un utilisateur spécifique
export const useUser = (userId: string | undefined) => {
  const url = userId ? `${apiUrl}/api/users/${userId}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ user: IUser }>(url, fetcher, {
    revalidateOnFocus: false
  });

  return {
    user: data?.user,
    isLoading,
    error,
    mutate
  };
};

// Interface pour les statistiques utilisateur
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
}

// Hook pour récupérer les statistiques d'un utilisateur
export const useUserStats = (userId: string | undefined, cycleId?: string) => {
  const url = userId 
    ? `${apiUrl}/api/users/${userId}/stats${cycleId ? `?cycle_id=${cycleId}` : ''}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: { stats: IUserStats } }>(url, fetcher, {
    revalidateOnFocus: false
  });

  return {
    stats: data?.data?.stats,
    isLoading,
    error,
    mutate
  };
};

// Hook pour récupérer une guilde spécifique
export const useGuild = (guildId: string | undefined) => {
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ name: string }>(url, fetcher, {
    revalidateOnFocus: false
  });

  return {
    guildName: data?.name,
    isLoading,
    error,
    mutate
  };
};

// Interface pour les statistiques de guilde
export interface IGuildStats {
  totalMembers: number;
  averageScore: number;
  totalScores: number;
  bestScore: number;
  totalPoints: number;
}

// Hook pour récupérer les statistiques d'une guilde
export const useGuildStats = (guildId: string | undefined, cycleId?: string) => {
  const url = guildId 
    ? `${apiUrl}/api/guildes/${guildId}/stats${cycleId ? `?cycle_id=${cycleId}` : ''}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: IGuildStats }>(url, fetcher, {
    revalidateOnFocus: false
  });

  return {
    stats: data?.data,
    isLoading,
    error,
    mutate
  };
};

// Fonction helper pour récupérer les stats d'un utilisateur (sans SWR, pour usage dans des loops)
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

// Fonction helper pour récupérer les stats d'une guilde (sans SWR, pour usage dans des loops)
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

// Hook pour récupérer la liste des screenshotters OCR (endpoint public)
export const useScreenshotters = () => {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Array<{ id: string; label: string }> }>(
    `${apiUrl}/api/ocr/screenshotters`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache 5 minutes
    }
  );

  return {
    screenshotters: data?.data || [],
    isLoading,
    error,
  };
};
