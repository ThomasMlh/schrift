import useSWR from 'swr';
import type { ICycleRecap, IDeclineAlert } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Baisses de régime des membres (chefs : leurs guildes ; admins : toutes, ou guildId).
export const useDeclineAlerts = (guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/scores/decline-alerts${guildId ? `?guild_id=${guildId}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; alerts: IDeclineAlert[] }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );

  return { alerts: data?.alerts ?? [], isLoading, error, mutate };
};

// Aperçu du bilan de fin de cycle d'une guilde (admin), sans rien envoyer.
export const useCycleRecapPreview = (cycleId?: string, guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = cycleId && guildId ? `${apiUrl}/api/podium/cycle-recap?cycle_id=${cycleId}&guild_id=${guildId}` : null;

  const { data, error, isLoading } = useSWR<{ success: boolean; recap: ICycleRecap }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );

  return { recap: data?.recap ?? null, isLoading, error };
};
