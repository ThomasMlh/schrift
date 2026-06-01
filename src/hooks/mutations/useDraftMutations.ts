import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

export const useDraftMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const executeDraft = async (moves: { userId: string; toGuildId: string | null; role?: string }[]) => {
    const data = await request(`${apiUrl}/api/guildes/draft`, {
      method: 'POST',
      body: JSON.stringify({ moves }),
    }, { fallbackError: "Erreur lors de l'exécution du draft" });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return data;
  };

  return { executeDraft };
};
