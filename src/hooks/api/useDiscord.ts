import useSWR from 'swr';
import type { IDiscordChannel, IDiscordEmoji } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Discord channels available to the current user (all of them for an admin, only their guild
// channels for a leader/officer, filtered by the API).
export const useDiscordChannels = () => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/discord/channels`;

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; channels: IDiscordChannel[] }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return { channels: data?.channels || [], isLoading, error, mutate };
};

// Custom emojis of the accessible Discord servers (same scope as the channels).
export const useDiscordEmojis = () => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const url = `${apiUrl}/api/discord/emojis`;

  const { data, error, isLoading } = useSWR<{ success: boolean; emojis: IDiscordEmoji[] }>(
    url,
    authenticatedFetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return { emojis: data?.emojis || [], isLoading, error };
};
