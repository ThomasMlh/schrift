import useSWR from 'swr';
import { apiUrl, fetcher, useAuthenticatedFetcher } from './shared';

export interface IRecruitmentGuild {
  _id: string;
  name: string;
  members: number;
  free_places: number;
  average_score: number | null;
}

export interface IRecruitment {
  is_open: boolean;
  intro: string;
  guild_capacity: number;
  is_full?: boolean; // Every guild full: applications join the waiting list
  reference_cycle: { name: string; year: number } | null;
  guilds: IRecruitmentGuild[];
}

export type ApplicationStatus = 'new' | 'waitlist' | 'accepted' | 'rejected';

export interface IApplication {
  _id: string;
  bbs_name: string;
  bbs_id: string | null;
  discord: string;
  average_score: number | null;
  preferred_guild_id: string | null;
  preferred_guild_name: string | null;
  accepted_guild_name?: string | null;
  user_id?: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
}

// What the candidate sees through their tracking link
export interface IApplicationTracking {
  bbs_name: string;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
  preferred_guild_name: string | null;
  guild_name: string | null;
  waitlist_position: number | null;
}

export interface IRecruitmentSettings {
  is_open: boolean;
  guild_capacity: number;
  intro: string;
}

export const recruitmentUrl = `${apiUrl}/api/recruitment`;

export const useRecruitment = () => {
  const { data, isLoading } = useSWR<IRecruitment & { success: boolean }>(recruitmentUrl, fetcher, { revalidateOnFocus: false });
  return { recruitment: data, isLoading };
};

export const useApplicationTracking = (token: string | undefined) => {
  const { data, error, isLoading } = useSWR<{ success: boolean; application: IApplicationTracking }>(
    token ? `${recruitmentUrl}/track/${encodeURIComponent(token)}` : null,
    fetcher,
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );
  return { application: data?.application, notFound: !!error, isLoading };
};

export const useApplications = (status?: ApplicationStatus, enabled = true) => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { data, isLoading, mutate } = useSWR<{ success: boolean; applications: IApplication[] }>(
    enabled ? `${recruitmentUrl}/applications${status ? `?status=${status}` : ''}` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );
  return { applications: data?.applications ?? [], isLoading, mutate };
};

export const useRecruitmentSettings = () => {
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { data, isLoading } = useSWR<IRecruitmentSettings & { success: boolean }>(
    `${recruitmentUrl}/settings`,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );
  return { settings: data, isLoading };
};
