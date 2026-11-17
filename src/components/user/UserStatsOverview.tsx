import { Box, GridItem, HStack, Icon, SimpleGrid, Text, Tooltip, VStack } from "@chakra-ui/react";
import { FiActivity, FiAlertTriangle, FiAward, FiBarChart2, FiCalendar, FiCheckCircle, FiTool } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { RankingSection } from "./RankingSection";
import type { IUserStats } from "@/hooks/useAPI";

interface UserStatsOverviewProps {
  stats: IUserStats;
  guildName?: string;
  hasGuild: boolean;
}

const millions = (value: number) => `${(value / 1000000).toFixed(2)}M`;

// Colour of a figure that is good, so-so or bad
const STATUS_COLORS = { good: "green.400", fair: "yellow.400", bad: "red.400" } as const;
type Status = keyof typeof STATUS_COLORS;

const Tile = ({ icon, label, value, detail, help, status, span = 1, children }: {
  icon: IconType; label: string; value: string; detail?: string; help?: string; status?: Status; span?: number; children?: React.ReactNode;
}) => (
  <GridItem colSpan={{ base: Math.min(span, 2), md: span }} bg="bg.subtle" borderRadius="xl" p={4} minW={0}>
    <HStack spacing={2} color="text.muted" mb={2}>
      <Icon as={icon} boxSize={4} aria-hidden />
      <Tooltip label={help} isDisabled={!help} hasArrow placement="top">
        <Text fontSize="sm" fontWeight="semibold" noOfLines={1} cursor={help ? "help" : undefined} borderBottom={help ? "1px dotted" : undefined} borderColor="border.strong">
          {label}
        </Text>
      </Tooltip>
    </HStack>
    <Text
      fontSize="xl"
      fontWeight="extrabold"
      letterSpacing="tight"
      lineHeight="short"
      color={status ? STATUS_COLORS[status] : "text.strong"}
      sx={{ fontVariantNumeric: "tabular-nums" }}
      noOfLines={1}
    >
      {value}
    </Text>
    {detail && <Text fontSize="sm" color="text.muted" mt={0.5} noOfLines={2}>{detail}</Text>}
    {children}
  </GridItem>
);

// Overview tab: ranks, then the player's key facts as even tiles
export const UserStatsOverview = ({ stats, guildName, hasGuild }: UserStatsOverviewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const daysSinceFirst = stats.firstParticipation
    ? Math.ceil(Math.abs(Date.now() - new Date(stats.firstParticipation).getTime()) / 86400000)
    : null;
  const consistency: Status | undefined = stats.consistencyScore === undefined ? undefined
    : stats.consistencyScore <= 15 ? "good" : stats.consistencyScore <= 30 ? "fair" : "bad";
  const miss: Status | undefined = stats.missRate === undefined ? undefined
    : stats.missRate > 20 ? "bad" : stats.missRate > 10 ? "fair" : "good";
  const cyclesPlayed = stats.temporalEvolution?.length ?? 0;
  const medianGap = stats.medianScore !== undefined && stats.averageScore > 0 ? stats.medianScore - stats.averageScore : null;

  return (
    <VStack spacing={6} align="stretch">
      <RankingSection ranking={stats.ranking} guildName={guildName} hasGuild={hasGuild} />

      <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" p={{ base: 4, md: 5 }}>
        <Text fontSize="md" fontWeight="bold" color="text.strong" mb={4}>{t("components.user.statsOverview.title")}</Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {stats.bestCycle && (
            <Tile
              icon={FiAward}
              span={2}
              label={t("components.user.statsOverview.labelBestCycle")}
              value={stats.bestCycle.cycle_name || "Cycle"}
              detail={t("components.user.statsOverview.bestCycleDetail", {
                average: millions(stats.bestCycle.averageScore),
                count: stats.bestCycle.scoreCount,
              })}
            />
          )}
          {stats.medianScore !== undefined && (
            <Tile
              icon={FiBarChart2}
              label={t("components.user.statsOverview.labelMedianScore")}
              help={t("components.user.statsOverview.tooltipMedianScore")}
              value={millions(stats.medianScore)}
              detail={medianGap !== null ? `${medianGap >= 0 ? "+" : ""}${millions(medianGap)} ${t("components.user.statsOverview.vsMean")}` : undefined}
            />
          )}
          {stats.consistencyScore !== undefined && (
            <Tile
              icon={FiActivity}
              label={t("components.user.statsOverview.labelConsistency")}
              help={t("components.user.statsOverview.tooltipConsistency")}
              status={consistency}
              value={t(`components.user.statsOverview.${consistency === "good" ? "consistencyVeryRegular" : consistency === "fair" ? "consistencyRegular" : "consistencyIrregular"}`)}
              detail={`CV ${stats.consistencyScore}% · σ ${stats.stdDeviation !== undefined ? millions(stats.stdDeviation) : "?"}`}
            />
          )}
          {stats.missRate !== undefined && (
            <Tile
              icon={FiAlertTriangle}
              label={t("components.user.statsOverview.labelMissRate")}
              status={miss}
              value={`${stats.missRate}%`}
              detail={t("components.user.statsOverview.missDetail", {
                missCount: stats.missCount,
                scoreS: stats.missCount !== 1 ? "s" : "",
                totalScores: stats.totalScores,
                rotationS: stats.totalScores > 1 ? "s" : "",
              })}
            />
          )}
          <Tile
            icon={FiCheckCircle}
            label={t("components.user.statsOverview.labelCyclesPlayed")}
            value={String(cyclesPlayed)}
            detail={stats.cyclesWithFullParticipation !== undefined
              ? t("components.user.statsOverview.cyclesFull", { count: stats.cyclesWithFullParticipation })
              : undefined}
          />
          {stats.firstParticipation && (
            <Tile
              icon={FiCalendar}
              label={t("components.user.statsOverview.labelSeniority")}
              value={new Date(stats.firstParticipation).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
              detail={daysSinceFirst !== null ? t("components.user.statsOverview.daysAgo", { count: daysSinceFirst }) : undefined}
            />
          )}
          {stats.buildsCount !== undefined && (
            <Tile
              icon={FiTool}
              label={t("components.user.statsOverview.labelBuilds")}
              value={String(stats.buildsCount)}
              detail={t("components.user.statsOverview.communityContrib")}
            />
          )}
        </SimpleGrid>
      </Box>
    </VStack>
  );
};
