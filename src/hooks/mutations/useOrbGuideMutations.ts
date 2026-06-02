import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

interface OrbSourceData {
  title: string;
  description: string;
  amount: number;
}

export const useOrbGuideMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const saveOrbSource = async (data: OrbSourceData, id?: string) => {
    const result = await request(`${apiUrl}/api/guides/orbes${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(data),
    }, { fallbackError: "Erreur lors de la sauvegarde" });
    await invalidateKeys(`${apiUrl}/api/guides/orbes`);
    return result;
  };

  const deleteOrbSource = async (id: string) => {
    const result = await request(`${apiUrl}/api/guides/orbes/${id}`, {
      method: 'DELETE',
    }, { fallbackError: "Erreur lors de la suppression" });
    await invalidateKeys(`${apiUrl}/api/guides/orbes`);
    return result;
  };

  return { saveOrbSource, deleteOrbSource };
};
