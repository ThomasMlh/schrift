import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

interface AbilitySlotRowData {
  category: string;
  name: string;
  star1: string;
  star2: string;
  star3: string;
  order?: number;
}

export const useAbilitySlotsGuideMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const saveAbilitySlotRow = async (data: AbilitySlotRowData, id?: string) => {
    const result = await request(`${apiUrl}/api/guides/ability-slots${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(data),
    }, { fallbackError: "Erreur lors de la sauvegarde" });
    await invalidateKeys(`${apiUrl}/api/guides/ability-slots`);
    return result;
  };

  const deleteAbilitySlotRow = async (id: string) => {
    const result = await request(`${apiUrl}/api/guides/ability-slots/${id}`, {
      method: 'DELETE',
    }, { fallbackError: "Erreur lors de la suppression" });
    await invalidateKeys(`${apiUrl}/api/guides/ability-slots`);
    return result;
  };

  return { saveAbilitySlotRow, deleteAbilitySlotRow };
};
