import useSWR from 'swr';
import type { IDiscordChannel } from '../../interfaces';
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
