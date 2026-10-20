import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { invalidateKeys, makeRequest } from '@/utils/apiRequest';
import { recruitmentUrl } from '@/hooks/api/useRecruitment';
import type { ApplicationStatus, IRecruitmentSettings } from '@/hooks/api/useRecruitment';

export interface IApplicationForm {
  bbs_name: string;
  bbs_id: string;
  discord: string;
  average_score: string;
  preferred_guild_id: string;
  message: string;
  // Honeypot, left empty by humans
  website: string;
}

export interface IAcceptApplication {
  guild_id: string;
  create_player: boolean;
  bbs_id?: string;
  welcome_message?: string;
}

export interface IAcceptResult {
  player: { user_id: string; bbs_id: string } | null;
  welcome: 'sent' | 'no_channel' | 'failed' | null;
}

export const useRecruitmentMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const submitApplication = (form: IApplicationForm) =>
    request<{ status: ApplicationStatus; tracking_token: string }>(`${recruitmentUrl}/applications`, { method: 'POST', body: JSON.stringify(form) }, {
      fallbackError: "Impossible d'envoyer la candidature",
    });

  const setApplicationStatus = async (id: string, status: ApplicationStatus) => {
    await request(`${recruitmentUrl}/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, {
      fallbackError: 'Impossible de mettre à jour la candidature',
    });
    await invalidateKeys(`${recruitmentUrl}/applications`);
  };

  const acceptApplication = async (id: string, payload: IAcceptApplication) => {
    const result = await request<IAcceptResult>(`${recruitmentUrl}/applications/${id}/accept`, { method: 'POST', body: JSON.stringify(payload) }, {
      fallbackError: "Impossible d'accepter la candidature",
    });
    await invalidateKeys(`${recruitmentUrl}/applications`, recruitmentUrl);
    return result;
  };

  const deleteApplication = async (id: string) => {
    await request(`${recruitmentUrl}/applications/${id}`, { method: 'DELETE' }, {
      fallbackError: 'Impossible de supprimer la candidature',
    });
    await invalidateKeys(`${recruitmentUrl}/applications`);
  };

  const updateSettings = async (settings: IRecruitmentSettings) => {
    await request(`${recruitmentUrl}/settings`, { method: 'PUT', body: JSON.stringify(settings) }, {
      fallbackError: 'Impossible de mettre à jour le recrutement',
    });
    await invalidateKeys(recruitmentUrl);
  };

  return { submitApplication, setApplicationStatus, acceptApplication, deleteApplication, updateSettings };
};
