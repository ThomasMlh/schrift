import { Box, SimpleGrid } from "@chakra-ui/react";
import { FiUsers, FiShield, FiBarChart2, FiCheckCircle } from "react-icons/fi";
import { useCommunityStats, useCycles } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { useTranslation } from "react-i18next";
import { StatCard } from "./ui/StatCard";
import { HomeSectionHeader } from "./ui/HomeSectionHeader";

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
      icon: FiUsers, gradient: "linear(to-br, purple.500, pink.400)",
      value: stats?.totalMembers ?? null,
      label: t("pages.home.communityMembers"),
      format: (v: number) => v.toLocaleString("fr-FR"),
    },
    {
      icon: FiShield, gradient: "linear(to-br, blue.400, purple.500)",
      value: stats?.totalGuilds ?? null,
      label: t("pages.home.communityGuilds"),
      format: (v: number) => String(v),
    },
    {
      icon: FiBarChart2, gradient: "linear(to-br, orange.400, red.400)",
      value: stats?.avgScore ?? null,
      label: t("pages.home.communityAvgScore"),
      format: formatScore,
    },
    {
      icon: FiCheckCircle, gradient: "linear(to-br, green.400, teal.400)",
      value: stats?.globalClearRate ?? null,
      label: t("pages.home.communityClearRate"),
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <Box w="100%">
      <HomeSectionHeader
        icon={FiBarChart2}
        title={t("pages.home.communityTitle")}
        subtitle={currentCycle ? `${currentCycle.name} ${currentCycle.year}` : t("pages.home.communitySubtitle")}
      />

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        {cards.map(({ icon, gradient, value, label, format }) => (
          <StatCard
            key={label}
            label={label}
            icon={icon}
            gradient={gradient}
            value={value !== null ? format(value) : null}
            isLoading={isLoading}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};
