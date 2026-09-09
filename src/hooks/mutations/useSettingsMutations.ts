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

  return { updateGlobalNotificationSettings };
};
