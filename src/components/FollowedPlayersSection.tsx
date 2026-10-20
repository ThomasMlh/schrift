import { Box, HStack, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { FiStar } from "react-icons/fi";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { useCycles, useFollowing } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { apiUrl, fetcher } from "@/hooks/api/shared";
import { HomeSectionHeader } from "./ui/HomeSectionHeader";
import { UserDisplay } from "./ui/UserDisplay";
import { ScoreBadge } from "./ui/ScoreBadge";
import type { IPodiumResponse, IUser } from "@/interfaces";

// Followed players' rank and average on the current cycle (logged-in users following someone only)
export const FollowedPlayersSection = () => {
  const { t } = useTranslation();
  const { following, followedIds } = useFollowing();
  const { cycles, isLoading: cyclesLoading } = useCycles();
  const { currentCycle } = useCurrentRotation(cycles, cyclesLoading);

  const url = currentCycle && followedIds.length > 0
    ? `${apiUrl}/api/podium/full?cycle_name=${encodeURIComponent(currentCycle.name)}&year=${currentCycle.year}&ranking_type=average&limit=50&bbs_ids=${followedIds.map(encodeURIComponent).join(",")}`
    : null;
  const { data, isLoading } = useSWR<IPodiumResponse>(url, fetcher, { revalidateOnFocus: false });

  if (following.length === 0 || !currentCycle) return null;
  if (isLoading) return <Skeleton h="160px" w="100%" borderRadius="xl" />;

  const rows = data?.data ?? [];
  const ranked = new Map(rows.map((row) => [row.bbs_id, row]));

  return (
    <Box w="100%">
      <HomeSectionHeader
        icon={FiStar}
        title={t("pages.home.followedTitle")}
        subtitle={t("pages.home.followedSubtitle", { cycle: `${currentCycle.name} ${currentCycle.year}` })}
      />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
        {[...following]
          .sort((a, b) => (ranked.get(a.bbs_id)?.rank ?? Infinity) - (ranked.get(b.bbs_id)?.rank ?? Infinity))
          .map((account) => {
            const row = ranked.get(account.bbs_id);
            const user = {
              _id: account.user_id,
              discord_id: account.discord_id,
              global_name: account.global_name,
              avatar: account.avatar,
              bbs_id: account.bbs_id,
              bbs_name: account.bbs_name,
            } as IUser;
            return (
              <HStack
                key={account.bbs_id}
                justify="space-between"
                p={3}
                bg="bg.card"
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="xl"
                spacing={3}
              >
                <HStack spacing={3} minW={0}>
                  <Text fontWeight="bold" color="text.muted" w="36px" flexShrink={0}>
                    {row ? `#${row.rank}` : "—"}
                  </Text>
                  <Box minW={0}>
                    <UserDisplay user={user} asLink />
                    {account.guild_name && <Text fontSize="xs" color="text.muted">{account.guild_name}</Text>}
                  </Box>
                </HStack>
                {row?.averageScore
                  ? <ScoreBadge commas forceBlue score={row.averageScore} />
                  : <Text fontSize="xs" color="text.muted" textAlign="right">{t("pages.home.followedNoScore")}</Text>}
              </HStack>
            );
          })}
      </SimpleGrid>
    </Box>
  );
};
