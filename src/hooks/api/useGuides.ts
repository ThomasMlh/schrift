import useSWR from 'swr';
import type { IOrbGuideResponse, IAbilitySlotsGuideResponse } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

export const useOrbGuide = () => {
  const { data, error, isLoading, mutate } = useSWR<IOrbGuideResponse>(
    `${apiUrl}/api/guides/orbes`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return { orbData: data, isLoading, error, mutate };
};

export const useAbilitySlotsGuide = () => {
  const { data, error, isLoading, mutate } = useSWR<IAbilitySlotsGuideResponse>(
    `${apiUrl}/api/guides/ability-slots`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return { abilitySlotsData: data, isLoading, error, mutate };
};

export const useScreenshotters = () => {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Array<{ id: string; label: string }> }>(
    `${apiUrl}/api/ocr/screenshotters`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return { screenshotters: data?.data || [], isLoading, error };
};
