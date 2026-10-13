import useSWR from 'swr';
import type { NotificationType } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Stable reference so referential equality holds while `data` is loading (an inline `|| []` would
// create a new array on every render and loop the effects depending on it).
const EMPTY_TYPES: NotificationType[] = [];

export const useNotificationSettings = () => {
  const authenticatedFetcher = useAuthenticatedFetcher();

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    disabled_notification_types: NotificationType[];
  }>(`${apiUrl}/api/settings/notifications`, authenticatedFetcher, { revalidateOnFocus: false });

  return {
    disabledTypes: data?.disabled_notification_types ?? EMPTY_TYPES,
    isLoading,
    error,
    mutate,
  };
};

export const usePodiumSettings = () => {
  const authenticatedFetcher = useAuthenticatedFetcher();

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    min_scores_for_ranking: number;
  }>(`${apiUrl}/api/settings/podium`, authenticatedFetcher, { revalidateOnFocus: false });

  return {
    minScoresForRanking: data?.min_scores_for_ranking ?? 0,
    isLoading,
    error,
    mutate,
  };
};
