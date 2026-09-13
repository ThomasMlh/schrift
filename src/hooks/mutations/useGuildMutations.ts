import { useMemo } from 'react';
import { mutate } from 'swr';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';
import type { IGuild } from '@/interfaces';

export const useGuildMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const createGuild = async (guildData: Partial<IGuild>) => {
    const result = await request(`${apiUrl}/api/guildes`, {
      method: 'POST',
      body: JSON.stringify(guildData),
    }, { fallbackError: 'Erreur lors de la création de la guilde' });
    await mutate(`${apiUrl}/api/guildes`);
    return result;
  };

  const updateGuild = async (guildId: string, guildData: Partial<IGuild>) => {
    const result = await request(`${apiUrl}/api/guildes/${guildId}`, {
      method: 'PUT',
      body: JSON.stringify(guildData),
    }, { fallbackError: 'Erreur lors de la mise à jour de la guilde' });
    await mutate(`${apiUrl}/api/guildes`);
    return result;
  };

  const deleteGuild = async (guildId: string) => {
    const result = await request(`${apiUrl}/api/guildes/${guildId}`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors de la suppression de la guilde' });
    await mutate(`${apiUrl}/api/guildes`);
    return result;
  };

  // channelId n'est pas forcément celui déjà enregistré : sert à tester une valeur avant
  // de l'avoir sauvegardée.
  const testGuildNotification = async (guildId: string, channelId: string) => {
    return request(`${apiUrl}/api/guildes/${guildId}/test-notification`, {
      method: 'POST',
      body: JSON.stringify({ channel_id: channelId }),
    }, { fallbackError: "Erreur lors de l'envoi de la notification de test" });
  };

  const toggleGuildDisable = async (guildId: string) => {
    const result = await request(`${apiUrl}/api/guildes/${guildId}/toggle-disable`, {
      method: 'PATCH',
    }, { fallbackError: 'Erreur lors du changement de statut de la guilde' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  const assignUserToGuild = async (guildId: string, userId: string) => {
    const result = await request(`${apiUrl}/api/guildes/${guildId}/assign-member`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }, { fallbackError: "Erreur lors de l'assignation de l'utilisateur" });
    await mutate(`${apiUrl}/api/guildes/${guildId}/membres`);
    await mutate(`${apiUrl}/api/users`);
    return result;
  };

  const removeGuildMember = async (guildId: string, userId: string) => {
    const result = await request(`${apiUrl}/api/guildes/${guildId}/membres/${userId}`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors de la suppression du membre' });
    await invalidateKeys(`${apiUrl}/api/users`, `${apiUrl}/api/guildes`);
    return result;
  };

  return { createGuild, updateGuild, deleteGuild, testGuildNotification, toggleGuildDisable, assignUserToGuild, removeGuildMember };
};
