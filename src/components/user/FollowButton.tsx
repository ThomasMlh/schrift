import { useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { FiStar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useFollowing } from "@/hooks/useAPI";
import { useFollowMutations } from "@/hooks/mutations/useFollowMutations";

// Follow / unfollow a bbs account; hidden for visitors and on the user's own accounts
export const FollowButton = ({ bbsId }: { bbsId?: string }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isLoggedIn, currentUser } = useAuth();
  const { followedIds } = useFollowing();
  const { setFollowing } = useFollowMutations();
  const [isSaving, setIsSaving] = useState(false);

  const ownAccount = (currentUser?.bbs_accounts ?? []).some((a) => a.bbs_id === bbsId) || currentUser?.bbs_id === bbsId;
  if (!isLoggedIn || !bbsId || ownAccount) return null;

  const isFollowed = followedIds.includes(bbsId);
  const toggle = async () => {
    setIsSaving(true);
    try {
      await setFollowing(bbsId, !isFollowed);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message, duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      size="xs"
      variant={isFollowed ? "solid" : "outline"}
      colorScheme="yellow"
      leftIcon={<FiStar fill={isFollowed ? "currentColor" : "none"} />}
      onClick={toggle}
      isLoading={isSaving}
      aria-pressed={isFollowed}
      flexShrink={0}
    >
      {t(isFollowed ? "components.follow.following" : "components.follow.follow")}
    </Button>
  );
};
