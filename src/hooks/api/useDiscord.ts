import useSWR from 'swr';
import type { IDiscordChannel, IDiscordEmoji } from '../../interfaces';
import { apiUrl, useAuthenticatedFetcher } from './shared';

// Liste des salons Discord accessibles à l'utilisateur courant (tous pour un admin,
// uniquement ceux de sa/ses guildes pour un chef/sous-chef — filtré côté API).
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

// Emojis custom des serveurs Discord accessibles (même périmètre que les salons).
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
