import { Box, Button, Flex, HStack, Icon, Skeleton, Text } from "@chakra-ui/react";
import { FiAward, FiArrowRight, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGuildRankings, usePodiumMonths, usePodiumMonthlyTop } from "@/hooks/useAPI";
import { HomeSectionHeader } from "./ui/HomeSectionHeader";
import { PodiumPedestal } from "./podium/PodiumPedestal";
import type { PodiumPedestalPlayer } from "./podium/PodiumPedestal";
import { formatMonthKey, formatWithCommas } from "@/utils/format";

// Top 3 of the last finished month (best average), hidden until one exists
export const MonthlyTopSection = () => {
  const { t, i18n } = useTranslation();
  const { months, isLoading: monthsLoading } = usePodiumMonths();
  const lastMonth = months.find((m) => !m.in_progress);
  const { players, isLoading } = usePodiumMonthlyTop(lastMonth?.key);
  const { rankings } = useGuildRankings(undefined, lastMonth?.key);
  const guildOfTheMonth = rankings.find((g) => g.totalScores > 0);

  if (monthsLoading || isLoading) return <Skeleton h="260px" w="100%" borderRadius="xl" />;
  if (!lastMonth || players.length === 0) return null;

  const pedestalPlayers: PodiumPedestalPlayer[] = players
    .filter((p) => p.rank <= 3)
    .map((p) => ({
      rank: p.rank,
      user_id: p.user_id,
      bbs_id: p.bbs_id,
      bbs_name: p.bbs_name,
      global_name: p.global_name,
      discord_id: p.discord_id,
      avatar: p.avatar,
      guild_name: p.guild_name,
      displayScore: p.averageScore ?? 0,
      forceBlueScore: true,
      top_achievement: p.top_achievement,
    }));

  return (
    <Box w="100%">
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <HomeSectionHeader
          icon={FiAward}
          title={t("pages.home.monthlyTopTitle")}
          subtitle={t("pages.home.monthlyTopSubtitle", {
            month: formatMonthKey(lastMonth.key, i18n.language),
            start: lastMonth.start_date,
            end: lastMonth.end_date,
          })}
        />
        <Button
          as={Link}
          to={`/podium?mode=monthly&month=${lastMonth.key}`}
          size="sm"
          variant="ghost"
          colorScheme="purple"
          rightIcon={<FiArrowRight />}
        >
          {t("pages.home.monthlyTopSeeAll")}
        </Button>
      </Flex>
      <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" px={4} pt={6}>
        <PodiumPedestal players={pedestalPlayers} showGuildName />
        {guildOfTheMonth && (
          <HStack
            as={Link}
            to={`/guildes?guild_name=${encodeURIComponent(guildOfTheMonth.name)}`}
            justify="center"
            spacing={2}
            py={3}
            mt={2}
            borderTopWidth="1px"
            borderColor="border.subtle"
            flexWrap="wrap"
            _hover={{ color: "purple.300" }}
          >
            <Icon as={FiShield} color="yellow.400" />
            <Text fontSize="sm" color="text.muted">{t("pages.home.guildOfTheMonth")} :</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.strong">{guildOfTheMonth.name}</Text>
            <Text fontSize="sm" color="text.muted">
              · {t("pages.home.guildOfTheMonthAverage")} {formatWithCommas(guildOfTheMonth.averageScore)}
            </Text>
          </HStack>
        )}
      </Box>
    </Box>
  );
};
