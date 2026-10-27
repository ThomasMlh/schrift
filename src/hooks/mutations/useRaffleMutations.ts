import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, apiUrl, invalidateKeys } from '@/utils/apiRequest';
import type { IRaffleDraw, IRaffleOverview, RaffleRank } from '@/interfaces';

export const useRaffleMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);
  const base = `${apiUrl}/api/raffle`;
  const refresh = () => invalidateKeys(base);

  const saveSettings = async (settings: Partial<Pick<IRaffleOverview, 'guild_ids' | 'prize' | 'max_tickets'>>) => {
    await request(`${base}/settings`, { method: 'PUT', body: JSON.stringify(settings) }, { fallbackError: 'Erreur lors de l\'enregistrement' });
    await refresh();
  };

  const setRank = async (month: string, guildId: string, rank: RaffleRank, tickets: number) => {
    await request(`${base}/${month}/guilds/${guildId}/rank`, { method: 'PUT', body: JSON.stringify({ rank, tickets }) });
    await refresh();
  };

  const setGuildLife = async (month: string, guildId: string, player: { bbs_id: string; bbs_name: string | null }, kind: 'farm' | 'qg', period: number, checked: boolean) => {
    await request(`${base}/${month}/guilds/${guildId}/players/${encodeURIComponent(player.bbs_id)}/guild-life`, {
      method: 'PUT',
      body: JSON.stringify({ kind, period, checked, bbs_name: player.bbs_name }),
    });
    await refresh();
  };

  const addBonus = async (month: string, guildId: string, player: { bbs_id: string; bbs_name: string | null }, label: string, count: number) => {
    await request(`${base}/${month}/guilds/${guildId}/players/${encodeURIComponent(player.bbs_id)}/bonus`, {
      method: 'POST',
      body: JSON.stringify({ label, count, bbs_name: player.bbs_name }),
    });
    await refresh();
  };

  const removeBonus = async (month: string, guildId: string, ticketId: string) => {
    await request(`${base}/${month}/guilds/${guildId}/bonus/${ticketId}`, { method: 'DELETE' });
    await refresh();
  };

  const setSchriftSince = async (guildId: string, bbsId: string, since: string | null) => {
    await request(`${base}/guilds/${guildId}/players/${encodeURIComponent(bbsId)}/since`, { method: 'PUT', body: JSON.stringify({ since }) });
    await refresh();
  };

  const draw = async (month: string, guildId: string, announce: boolean) => {
    const result = await request<{ draw: IRaffleDraw; announcement: 'sent' | 'no_channel' | 'failed' | 'skipped' }>(
      `${base}/${month}/guilds/${guildId}/draw`, { method: 'POST', body: JSON.stringify({ announce }) }
    );
    await refresh();
    return result;
  };

  const cancelDraw = async (month: string, guildId: string) => {
    await request(`${base}/${month}/guilds/${guildId}/draw`, { method: 'DELETE' });
    await refresh();
  };

  return { saveSettings, setRank, setGuildLife, addBonus, removeBonus, setSchriftSince, draw, cancelDraw };
};
