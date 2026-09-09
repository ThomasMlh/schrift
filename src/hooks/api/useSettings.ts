import useSWR from 'swr';
import type { NotificationType } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Référence stable pour ne pas casser l'égalité par référence tant que `data` n'est pas chargé
// (un `|| []` inline créerait un nouveau tableau à chaque render et boucle les useEffect qui en dépendent).
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
