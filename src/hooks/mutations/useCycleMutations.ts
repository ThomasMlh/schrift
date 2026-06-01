import { useMemo } from 'react';
import { mutate } from 'swr';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';
import type { ICycle } from '@/interfaces';

export const useCycleMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const createCycle = async (cycleData: Partial<ICycle>) => {
    const result = await request(`${apiUrl}/api/cycles`, {
      method: 'POST',
      body: JSON.stringify(cycleData),
    }, { fallbackError: 'Erreur lors de la création du cycle' });
    await mutate(`${apiUrl}/api/cycles`);
    return result;
  };

  const updateCycle = async (cycleId: string, cycleData: Partial<ICycle>) => {
    const result = await request(`${apiUrl}/api/cycles/${cycleId}`, {
      method: 'PUT',
      body: JSON.stringify(cycleData),
    }, { fallbackError: 'Erreur lors de la mise à jour du cycle' });
    await mutate(`${apiUrl}/api/cycles`);
    await mutate(`${apiUrl}/api/cycles/${cycleId}`);
    return result;
  };

  const deleteCycle = async (cycleId: string) => {
    await request(`${apiUrl}/api/cycles/${cycleId}`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors de la suppression du cycle' });
    await mutate(`${apiUrl}/api/cycles`);
    return true;
  };

  return { createCycle, updateCycle, deleteCycle };
};
