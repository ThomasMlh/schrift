import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl } from '@/utils/apiRequest';
import type { PodiumRankingType } from '@/interfaces';

export interface IPublishCycleRecapResult {
  guild: string;
  status: 'requested' | 'skipped' | 'error';
  reason?: string;
}

export const usePodiumMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  // Without guildName, publishes for every active guild, each in its general channel.
  // includeSnapshot: podium capture; includeSummary: written summary (top 3, records, progression).
  const publishCycleRecap = async (params: {
    cycleName: string;
    year: number;
    rankingType: PodiumRankingType;
    guildName?: string;
    includeSnapshot: boolean;
    includeSummary: boolean;
  }) => {
    return request<{ success: boolean; results: IPublishCycleRecapResult[] }>(
      `${apiUrl}/api/podium/publish-cycle-recap`,
      {
        method: 'POST',
        body: JSON.stringify({
          cycle_name: params.cycleName,
          year: params.year,
          ranking_type: params.rankingType,
          include_snapshot: params.includeSnapshot,
          include_summary: params.includeSummary,
          ...(params.guildName && { guild_name: params.guildName }),
        }),
      },
      { fallbackError: 'Erreur lors de la publication du récap de cycle' }
    );
  };

  return { publishCycleRecap };
};
