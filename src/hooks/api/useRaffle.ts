import useSWR from 'swr';
import type { IGuildRaffle, IRaffleOverview } from '../../interfaces';
import { apiUrl, fetcher } from './shared';

// Raffle settings, taking part guilds and game months. Public.
export const useRaffleOverview = () => {
  const { data, error, isLoading, mutate } = useSWR<IRaffleOverview & { success: boolean }>(
    `${apiUrl}/api/raffle`, fetcher, { revalidateOnFocus: false }
  );
  return { overview: data ?? null, isLoading, error, mutate };
};

// Tickets of a guild for a month. Public.
export const useGuildRaffle = (month?: string, guildId?: string) => {
  const url = month && guildId ? `${apiUrl}/api/raffle/${month}/guilds/${guildId}` : null;
  const { data, error, isLoading, mutate } = useSWR<IGuildRaffle & { success: boolean }>(url, fetcher, { revalidateOnFocus: false });
  return { raffle: data ?? null, isLoading, error, mutate };
};
