import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';

export interface IPublishCycleRecapResult {
  guild: string;
  status: 'requested' | 'skipped';
  reason?: string;
}

export const usePodiumMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  // guildName absent = publie pour toutes les guildes actives, chacune dans son salon général.
  const publishCycleRecap = async (params: {
    cycleName: string;
    year: number;
    rankingType: 'average' | 'max';
    guildName?: string;
  }) => {
    return request<{ success: boolean; results: IPublishCycleRecapResult[] }>(
      `${apiUrl}/api/podium/publish-cycle-recap`,
      {
        method: 'POST',
        body: JSON.stringify({
          cycle_name: params.cycleName,
          year: params.year,
          ranking_type: params.rankingType,
          ...(params.guildName && { guild_name: params.guildName }),
        }),
      },
      { fallbackError: 'Erreur lors de la publication du récap de cycle' }
    );
  };

  return { publishCycleRecap };
};
