import { useMemo } from 'react';
import { mutate } from 'swr';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest } from '@/utils/apiRequest';
import { followingUrl } from '@/hooks/api/useFollowing';

export const useFollowMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const setFollowing = async (bbsId: string, follow: boolean) => {
    await request(`${followingUrl}/${encodeURIComponent(bbsId)}`, { method: follow ? 'PUT' : 'DELETE' }, {
      fallbackError: follow ? 'Impossible de suivre ce joueur' : "Impossible d'arrêter de suivre ce joueur",
    });
    await mutate(followingUrl);
  };

  return { setFollowing };
};
