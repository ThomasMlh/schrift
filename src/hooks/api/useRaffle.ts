import useSWR from 'swr';
import type { IGuildRaffle, IRaffleOverview } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Raffle settings, taking part guilds and game months. Admin only.
export const useRaffleOverview = () => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { data, error, isLoading, mutate } = useSWR<IRaffleOverview & { success: boolean }>(
    `${apiUrl}/api/raffle`, authenticatedFetcher, { revalidateOnFocus: false }
  );
  return { overview: data ?? null, isLoading, error: error as Error | undefined, mutate };
};

// Tickets of a guild for a month. Admin only.
export const useGuildRaffle = (month?: string, guildId?: string) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = month && guildId ? `${apiUrl}/api/raffle/${month}/guilds/${guildId}` : null;
  const { data, error, isLoading, mutate } = useSWR<IGuildRaffle & { success: boolean }>(url, authenticatedFetcher, { revalidateOnFocus: false });
  return { raffle: data ?? null, isLoading, error: error as Error | undefined, mutate };
};
