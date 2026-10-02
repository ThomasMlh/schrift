import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';

export const useDiscordMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const sendDiscordMessage = async (params: { channel_id: string; content: string; mention_user_ids?: string[] }) => {
    return request<{ success: boolean; message_id: string; channel: string }>(`${apiUrl}/api/discord/messages`, {
      method: 'POST',
      body: JSON.stringify(params),
    }, { fallbackError: "Erreur lors de l'envoi du message Discord" });
  };

  return { sendDiscordMessage };
};
