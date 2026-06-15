import { useCallback } from 'react';
import type { IPagination } from '../../interfaces';
import { useAuth } from '../../providers/AuthProvider';

export const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur lors de la récupération des données');
  return response.json();
};

export function normalizeList<T>(
  data: unknown,
  extraKeys: string[] = []
): { items: T[]; pagination: IPagination | null } {
  if (!data) return { items: [], pagination: null };
  if (Array.isArray(data)) return { items: data as T[], pagination: null };
  const obj = data as Record<string, unknown>;
  for (const key of ['data', ...extraKeys]) {
    if (Array.isArray(obj[key])) {
      return { items: obj[key] as T[], pagination: (obj.pagination as IPagination) || null };
    }
  }
  return { items: [], pagination: null };
}

export const useAuthenticatedFetcher = () => {
  const { token } = useAuth();
  return useCallback(async (url: string) => {
    const response = await fetch(url, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    return response.json();
  }, [token]);
};
