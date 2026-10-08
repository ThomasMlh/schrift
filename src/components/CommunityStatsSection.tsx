import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { FiUsers, FiShield, FiBarChart2, FiCheckCircle } from "react-icons/fi";
import { useCommunityStats, useCycles } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { useTranslation } from "react-i18next";
import { StatCard } from "./ui/StatCard";

const formatScore = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString("fr-FR");
};

export const CommunityStatsSection = () => {
  const { t } = useTranslation();

  const { cycles, isLoading: isLoadingCycles } = useCycles({ limit: 5 });
  const { currentCycle } = useCurrentRotation(cycles, isLoadingCycles);
  const { stats, isLoading } = useCommunityStats(currentCycle?._id);

  const cards = [
    {
      icon: FiUsers,
      value: stats?.totalMembers ?? null,
      label: t("pages.home.communityMembers"),
      format: (v: number) => v.toLocaleString("fr-FR"),
    },
    {
      icon: FiShield,
      value: stats?.totalGuilds ?? null,
      label: t("pages.home.communityGuilds"),
      format: (v: number) => String(v),
    },
    {
      icon: FiBarChart2,
      value: stats?.avgScore ?? null,
      label: t("pages.home.communityAvgScore"),
      format: formatScore,
    },
    {
      icon: FiCheckCircle,
      value: stats?.globalClearRate ?? null,
      label: t("pages.home.communityClearRate"),
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <Box w="100%">
      <Box mb={4}>
        <Text as="h2" fontWeight="bold" fontSize="lg" color="text.strong">{t("pages.home.communityTitle")}</Text>
        <Text fontSize="sm" color="text.muted">
          {currentCycle
            ? `${currentCycle.name} ${currentCycle.year}`
            : t("pages.home.communitySubtitle")}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        {cards.map(({ icon, value, label, format }) => (
          <StatCard
            key={label}
            label={label}
            icon={icon}
            value={value !== null ? format(value) : null}
            isLoading={isLoading}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};
