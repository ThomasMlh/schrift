import useSWR from 'swr';
import type { ICycle, IGuild, IUser, ICharactersResponse, ICharacter, IRotationTemplate, IScoresResponse, IPodiumResponse } from '../interfaces';

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

// Fonction fetcher authentifiée
const authenticatedFetcher = async (url: string) => {
  const token = localStorage.getItem('token');
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

// Hook pour récupérer les cycles
export const useCycles = (options?: { limit?: number; page?: number; authenticated?: boolean }) => {
  const { limit, page, authenticated = false } = options || {};
  let url = `${apiUrl}/api/cycles`;
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (page) params.append('page', page.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: ICycle[]; success?: boolean; pagination?: any }>(
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
  
  const { data, error, isLoading, mutate } = useSWR<ICycle>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    cycle: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les guildes
export const useGuilds = (authenticated: boolean = false) => {
  const url = `${apiUrl}/api/guildes`;
  
  const { data, error, isLoading, mutate } = useSWR<IGuild[] | { guilds?: IGuild[]; data?: IGuild[]; success?: boolean }>(
    url,
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
  const url = guildId ? `${apiUrl}/api/guildes/${guildId}/membres` : null;
  
  const { data, error, isLoading, mutate } = useSWR<IUser[]>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    members: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer les utilisateurs
export const useUsers = (authenticated: boolean = true) => {
  const url = `${apiUrl}/api/users`;
  
  const { data, error, isLoading, mutate } = useSWR<IUser[] | { users?: IUser[]; data?: IUser[]; success?: boolean }>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Normaliser la réponse (peut être un tableau ou un objet avec users/data)
  let users: IUser[] = [];
  if (data) {
    if (Array.isArray(data)) {
      users = data;
    } else if (data.users) {
      users = data.users;
    } else if (data.data) {
      users = data.data;
    }
  }

  return {
    users,
    isLoading,
    error,
    mutate,
  };
}

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
  const { cycle_id, guild_id, rotation_id, authenticated = false } = options || {};
  
  let url = `${apiUrl}/api/scores/podium`;
  const params = new URLSearchParams();
  if (cycle_id) params.append('cycle_id', cycle_id);
  if (guild_id) params.append('guild_id', guild_id);
  if (rotation_id) params.append('rotation_id', rotation_id);
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<IPodiumResponse>(
    url,
    authenticated ? authenticatedFetcher : fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache de 30 secondes
    }
  );

  return {
    podium: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook pour récupérer le guide des orbes
export const useOrbGuide = () => {
  const url = `${apiUrl}/api/guides/orbes`;
  
  const { data, error, isLoading, mutate } = useSWR<any>(
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
