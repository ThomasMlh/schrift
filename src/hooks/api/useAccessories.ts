import useSWR from 'swr';
import { useState, useCallback } from 'react';
import type { ISkill, IAccessory, IAccessorySubeffect } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

export const useSkills = (search?: string) => {
  let url = `${apiUrl}/api/skills`;
  if (search?.trim()) url += `?search=${encodeURIComponent(search.trim())}`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: ISkill[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { skills: data?.data || [], isLoading, error, mutate };
};

export const useAccessories = (search?: string) => {
  let url = `${apiUrl}/api/accessories`;
  if (search?.trim()) url += `?search=${encodeURIComponent(search.trim())}`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: IAccessory[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { accessories: data?.data || [], isLoading, error, mutate };
};

export const useAccessoryCodes = (token: string | null) => {
  const [enabled, setEnabled] = useState(false);

  const { data, error, isLoading } = useSWR<string[]>(
    enabled ? `${apiUrl}/api/accessories/codes` : null,
    async (url: string) => {
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Impossible de récupérer les codes');
      const json = await res.json();
      return (json.codes || []) as string[];
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const fetchCodes = useCallback(() => setEnabled(true), []);

  return { codes: data || [], isLoading, error: error instanceof Error ? error.message : null, fetchCodes };
};

export const useAccessoriesSubeffects = (search?: string) => {
  let url = `${apiUrl}/api/accessories-subeffect`;
  if (search?.trim()) url += `?search=${encodeURIComponent(search.trim())}`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: IAccessorySubeffect[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { subeffects: data?.data || [], isLoading, error, mutate };
};
