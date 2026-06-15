import {
  Box,
  SimpleGrid,
  Text,
  Skeleton,
  HStack,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { FiUsers, FiShield, FiBarChart2, FiCheckCircle } from "react-icons/fi";
import { useCommunityStats, useCycles } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { useTranslation } from "react-i18next";

const formatScore = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString("fr-FR");
};

export const CommunityStatsSection = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { t } = useTranslation();

  const { cycles, isLoading: isLoadingCycles } = useCycles({ limit: 5 });
  const { currentCycle } = useCurrentRotation(cycles, isLoadingCycles);
  const { stats, isLoading } = useCommunityStats(currentCycle?._id);

  const cardBg = isDark ? "rgba(26,32,44,0.7)" : "white";
  const border = isDark ? "whiteAlpha.100" : "gray.100";
  const labelColor = isDark ? "whiteAlpha.600" : "gray.500";

  const cards = [
    {
      icon: FiUsers,
      gradient: "linear(to-br, purple.500, pink.400)",
      value: stats?.totalMembers ?? null,
      label: t("pages.home.communityMembers"),
      format: (v: number) => v.toLocaleString("fr-FR"),
    },
    {
      icon: FiShield,
      gradient: "linear(to-br, blue.400, purple.500)",
      value: stats?.totalGuilds ?? null,
      label: t("pages.home.communityGuilds"),
      format: (v: number) => String(v),
    },
    {
      icon: FiBarChart2,
      gradient: "linear(to-br, orange.400, red.400)",
      value: stats?.avgScore ?? null,
      label: t("pages.home.communityAvgScore"),
      format: formatScore,
    },
    {
      icon: FiCheckCircle,
      gradient: "linear(to-br, green.400, teal.400)",
      value: stats?.globalClearRate ?? null,
      label: t("pages.home.communityClearRate"),
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <Box w="100%">
      <HStack spacing={3} mb={4} align="center">
        <Box
          p={2} borderRadius="lg"
          bgGradient="linear(135deg, #7C3AED, #4F46E5)"
          display="flex" alignItems="center" justifyContent="center"
        >
          <Icon as={FiBarChart2} boxSize={4} color="white" />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="lg">{t("pages.home.communityTitle")}</Text>
          <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
            {currentCycle
              ? `${currentCycle.name} ${currentCycle.year}`
              : t("pages.home.communitySubtitle")}
          </Text>
        </Box>
      </HStack>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        {cards.map(({ icon, gradient, value, label, format }) => (
          <Box
            key={label}
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={border}
            p={4}
            boxShadow={isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.06)"}
          >
            <HStack spacing={3} mb={2}>
              <Box
                p={2} borderRadius="lg"
                bgGradient={gradient}
                display="flex" alignItems="center" justifyContent="center"
              >
                <Icon as={icon} boxSize={3.5} color="white" />
              </Box>
            </HStack>
            <Skeleton isLoaded={!isLoading} fadeDuration={0.4}>
              <Text fontSize="2xl" fontWeight="extrabold" lineHeight={1.1}>
                {value !== null ? format(value) : "—"}
              </Text>
            </Skeleton>
            <Text fontSize="xs" color={labelColor} textTransform="uppercase" letterSpacing="wider" fontWeight="semibold" mt={1}>
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
