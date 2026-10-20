import { Avatar, Badge, Box, HStack, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { FiStar } from "react-icons/fi";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { useCycles, useFollowing } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { apiUrl, fetcher } from "@/hooks/api/shared";
import { HomeSectionHeader } from "./ui/HomeSectionHeader";
import CustomLink from "./ui/CustomLink";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { formatScore } from "@/utils/format";
import type { IPodiumResponse } from "@/interfaces";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

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
            const name = account.bbs_name || account.global_name || "Joueur";
            const avatarUrl = account.avatar && account.discord_id
              ? getUserAvatarUrl({ discord_id: account.discord_id, avatar: account.avatar }) || undefined
              : undefined;
            const medal = row && row.rank <= 3 ? MEDAL_COLORS[row.rank - 1] : undefined;
            return (
              <HStack
                key={account.bbs_id}
                spacing={3}
                p={3}
                bg="bg.card"
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="xl"
                opacity={row ? 1 : 0.7}
                transition="border-color 0.15s ease"
                _hover={{ borderColor: "purple.400" }}
              >
                <Box position="relative" flexShrink={0}>
                  <Avatar size="md" src={avatarUrl} name={name} />
                  {row && (
                    <Box
                      position="absolute"
                      bottom="-4px"
                      right="-6px"
                      minW="26px"
                      px={1.5}
                      borderRadius="full"
                      bg={medal ?? "bg.elevated"}
                      color={medal ? "gray.900" : "text.strong"}
                      borderWidth="2px"
                      borderColor="bg.card"
                      fontSize="2xs"
                      fontWeight="bold"
                      textAlign="center"
                      lineHeight="18px"
                    >
                      #{row.rank}
                    </Box>
                  )}
                </Box>
                <Box flex={1} minW={0}>
                  <CustomLink
                    to={buildPlayerUrl(account.bbs_name, account.bbs_id)}
                    text={name}
                    textSize="sm"
                    sx={{ fontWeight: "semibold", noOfLines: 1 }}
                  />
                  <HStack spacing={2} mt={0.5}>
                    {account.guild_name && (
                      <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} fontSize="2xs">
                        {account.guild_name}
                      </Badge>
                    )}
                    {row && (
                      <Text fontSize="xs" color="text.muted">
                        {t("pages.home.followedRotations", { count: row.totalScores })}
                      </Text>
                    )}
                  </HStack>
                </Box>
                <Box textAlign="right" flexShrink={0}>
                  {row?.averageScore ? (
                    <>
                      <Text fontWeight="bold" fontSize="lg" color="blue.300" lineHeight="short">
                        {formatScore(row.averageScore)}
                      </Text>
                      <Text fontSize="2xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">
                        {t("pages.home.followedAverage")}
                      </Text>
                    </>
                  ) : (
                    <Text fontSize="xs" color="text.muted" maxW="110px">{t("pages.home.followedNoScore")}</Text>
                  )}
                </Box>
              </HStack>
            );
          })}
      </SimpleGrid>
    </Box>
  );
};
