import { useMemo } from 'react';
import { mutate } from 'swr';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';
import type { NotificationType } from '@/interfaces';

export const useSettingsMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const updateGlobalNotificationSettings = async (disabledTypes: NotificationType[]) => {
    const result = await request(`${apiUrl}/api/settings/notifications`, {
      method: 'PUT',
      body: JSON.stringify({ disabled_notification_types: disabledTypes }),
    }, { fallbackError: 'Erreur lors de la mise à jour des settings de notification' });
    await mutate(`${apiUrl}/api/settings/notifications`);
    return result;
  };

  const updatePodiumMinScores = async (minScoresForRanking: number) => {
    const result = await request(`${apiUrl}/api/settings/podium`, {
      method: 'PUT',
      body: JSON.stringify({ min_scores_for_ranking: minScoresForRanking }),
    }, { fallbackError: 'Erreur lors de la mise à jour du seuil du podium' });
    await mutate(`${apiUrl}/api/settings/podium`);
    return result;
  };

  const updateAutoCycleRecap = async (enabled: boolean) => {
    const result = await request(`${apiUrl}/api/settings/podium`, {
      method: 'PUT',
      body: JSON.stringify({ auto_cycle_recap: enabled }),
    }, { fallbackError: "Erreur lors de la mise à jour de l'envoi automatique du récap" });
    await mutate(`${apiUrl}/api/settings/podium`);
    return result;
  };

  return { updateGlobalNotificationSettings, updatePodiumMinScores, updateAutoCycleRecap };
};
