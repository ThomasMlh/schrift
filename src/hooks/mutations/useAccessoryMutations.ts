import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

interface AccessoryData {
  name: string;
  code: string | null;
}

export const useAccessoryMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const saveAccessory = async (data: AccessoryData, id?: string) => {
    const result = await request(`${apiUrl}/api/accessories${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }, { fallbackError: "Erreur lors de la sauvegarde de l'accessoire" });
    await invalidateKeys(`${apiUrl}/api/accessories`);
    return result;
  };

  return { saveAccessory };
};
