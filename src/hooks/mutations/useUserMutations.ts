import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';
import type { Role } from '@/interfaces';

export const useUserMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const updateUserRole = async (userId: string, newRole: Role) => {
    const result = await request(`${apiUrl}/api/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole }),
    }, { fallbackError: 'Erreur lors de la modification du rôle' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  const moveUserToGuild = async (userId: string, newGuildId: string) => {
    const result = await request(`${apiUrl}/api/users/${userId}/guild`, {
      method: 'PUT',
      body: JSON.stringify({ guildeId: newGuildId }),
    }, { fallbackError: 'Erreur lors du déplacement du membre' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  const banUser = async (userId: string, reason?: string) => {
    const result = await request(`${apiUrl}/api/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, { fallbackError: 'Erreur lors du bannissement' });
    await invalidateKeys(`${apiUrl}/api/users`);
    return result;
  };

  const unbanUser = async (userId: string) => {
    const result = await request(`${apiUrl}/api/users/${userId}/unban`, {
      method: 'POST',
    }, { fallbackError: 'Erreur lors du débannissement' });
    await invalidateKeys(`${apiUrl}/api/users`);
    return result;
  };

  return { updateUserRole, moveUserToGuild, banUser, unbanUser };
};
