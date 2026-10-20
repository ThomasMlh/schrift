import useSWR from 'swr';
import { useAuth } from '../../providers/AuthProvider';
import { apiUrl, useAuthenticatedFetcher } from './shared';

export interface IFollowedAccount {
  bbs_id: string;
  bbs_name: string | null;
  user_id: string;
  discord_id?: string;
  global_name?: string;
  avatar?: string;
  guild_name: string | null;
}

export const followingUrl = `${apiUrl}/api/users/me/following`;

// Accounts followed by the logged-in user (empty for visitors)
export const useFollowing = () => {
  const { isLoggedIn } = useAuth();
  const authenticatedFetcher = useAuthenticatedFetcher();
  const { data, isLoading, mutate } = useSWR<{ success: boolean; following: IFollowedAccount[] }>(
    isLoggedIn ? followingUrl : null,
    authenticatedFetcher,
    { revalidateOnFocus: false }
  );
  const following = data?.following ?? [];
  return { following, followedIds: following.map((f) => f.bbs_id), isLoading, mutate };
};
