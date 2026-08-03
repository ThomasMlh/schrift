import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';
import type { Role } from '@/interfaces';

export interface IAccountFormData {
  bbs_id: string;
  bbs_name?: string | null;
  guilde_id?: string | null;
  role?: Role | null;
}

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

  const updateUser = async (userId: string, data: Record<string, unknown>) => {
    const result = await request(`${apiUrl}/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, { fallbackError: "Erreur lors de la modification de l'utilisateur" });
    await invalidateKeys(`${apiUrl}/api/users`);
    return result;
  };

  const addUserAccount = async (userId: string, data: IAccountFormData) => {
    const result = await request(`${apiUrl}/api/users/${userId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, { fallbackError: "Erreur lors de l'ajout du compte bbs" });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  // bbsId = identifiant ACTUEL du compte (URL). data.bbs_id, s'il est fourni et différent, renomme
  // le compte (l'historique des scores suit automatiquement, cf. backend).
  const updateUserAccount = async (userId: string, bbsId: string, data: Partial<IAccountFormData>) => {
    const result = await request(`${apiUrl}/api/users/${userId}/accounts/${bbsId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { fallbackError: 'Erreur lors de la modification du compte bbs' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  const removeUserAccount = async (userId: string, bbsId: string) => {
    const result = await request(`${apiUrl}/api/users/${userId}/accounts/${bbsId}`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors du retrait du compte bbs' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  const setPrimaryUserAccount = async (userId: string, bbsId: string) => {
    const result = await request(`${apiUrl}/api/users/${userId}/accounts/${bbsId}/primary`, {
      method: 'PUT',
    }, { fallbackError: 'Erreur lors du changement de compte principal' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  // Transfère un compte bbs d'un user vers un autre, comme alt (jamais principal chez la cible).
  // L'historique des scores n'est pas réécrit : il reste lié au bbs_id (déjà dénormalisé sur chaque score).
  const transferUserAccount = async (userId: string, bbsId: string, targetUserId: string) => {
    const result = await request(`${apiUrl}/api/users/${userId}/accounts/${bbsId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId }),
    }, { fallbackError: 'Erreur lors du transfert du compte' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  return {
    updateUserRole, moveUserToGuild, banUser, unbanUser, updateUser,
    addUserAccount, updateUserAccount, removeUserAccount, setPrimaryUserAccount, transferUserAccount
  };
};
