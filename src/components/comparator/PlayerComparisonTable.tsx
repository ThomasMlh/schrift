import {
  Box,
  Text,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  useColorMode,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import type { IUserStats } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface PlayerComparisonTableProps {
  playersData: Array<{
    name: string;
    stats: IUserStats | null;
    color: string;
  }>;
}

export const PlayerComparisonTable = ({
  playersData
}: PlayerComparisonTableProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("gray.50", "gray.750");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { t } = useTranslation();

  // Trouver le meilleur pour chaque métrique
  const getBest = (metric: keyof IUserStats | "bestScore"): number | null => {
    const values = playersData
      .filter((p) => p.stats)
      .map((p) => {
        if (metric === "bestScore") {
          return p.stats!.bestScore?.score || 0;
        }
        return (p.stats![metric] as number) || 0;
      });

    if (values.length === 0) return null;
    const max = Math.max(...values);
    return max === -Infinity ? null : max;
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return num.toLocaleString("fr-FR");
  };

  const formatScore = (score: number | undefined) => {
    if (score === undefined || score === null) return "N/A";
    if (score >= 1000000000) {
      return `${(score / 1000000000).toFixed(2)}B`;
    }
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(2)}M`;
    }
    return formatNumber(score);
  };

  const isTopValue = (value: number, metric: keyof IUserStats | "bestScore") => {
    const best = getBest(metric);
    return best !== null && value === best;
  };

  const getComparisonIcon = (
    value: number,
    metric: keyof IUserStats | "bestScore"
  ) => {
    const best = getBest(metric);
    if (best === null || best === 0 || value === best) {
      return <Icon as={FiTrendingUp} color="green.500" />;
    }
    const percentage = (value / best) * 100;
    if (percentage >= 90) {
      return <Icon as={FiMinus} color="yellow.500" />;
    }
    return <Icon as={FiTrendingDown} color="red.500" />;
  };

  const metrics = [
    {
      label: t("components.comparatorCharts.metricAvgScore"),
      key: "averageScore" as const,
      format: formatScore,
      icon: "📊"
    },
    {
      label: t("components.comparatorCharts.metricBestScore"),
      key: "bestScore" as const,
      format: (stats: IUserStats | null) =>
        formatNumber(stats?.bestScore?.score),
      icon: "🏆"
    },
    {
      label: t("components.comparatorCharts.metricWorstScore"),
      key: "worstScore" as const,
      format: (stats: IUserStats | null) =>
        formatNumber(stats?.worstScore?.score),
      icon: "📉"
    },
    {
      label: t("components.comparatorCharts.metricParticipations"),
      key: "totalScores" as const,
      format: formatNumber,
      icon: "🎯"
    },
    {
      label: t("components.comparatorCharts.metricTotalPoints"),
      key: "totalPoints" as const,
      format: formatScore,
      icon: "💰"
    },
    {
      label: t("components.comparatorCharts.metricMissRate"),
      key: "missRate" as const,
      format: (value: number | undefined) =>
        value !== undefined ? `${value}%` : "N/A",
      icon: "⚠️",
      inverse: true
    }
  ];

  return (
    <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={5}>
      <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            {t("components.comparatorCharts.tableHeadingPlayers")}
          </Text>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg={tableBg}>
                <Tr>
                  <Th borderColor={borderColor} minW="150px">
                    {t("components.comparatorCharts.colMetric")}
                  </Th>
                  {playersData.map((player, index) => (
                    <Th key={index} borderColor={borderColor} textAlign="center">
                      <VStack spacing={1}>
                        <Box
                          w={3}
                          h={3}
                          borderRadius="full"
                          bg={player.color}
                        />
                        <Text fontSize="xs" fontWeight="bold">
                          {player.name}
                        </Text>
                      </VStack>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {metrics.map((metric, metricIndex) => (
                  <Tr
                    key={metricIndex}
                    _hover={{ bg: tableBg }}
                    transition="all 0.2s"
                  >
                    <Td borderColor={borderColor} fontWeight="medium">
                      <HStack spacing={2}>
                        <Text fontSize="sm">{metric.icon}</Text>
                        <Text fontSize="sm">{metric.label}</Text>
                      </HStack>
                    </Td>
                    {playersData.map((player, playerIndex) => {
                      const stats = player.stats;
                      let value: string;
                      let rawValue: number = 0;

                      if (metric.key === "bestScore") {
                        value = metric.format(stats);
                        rawValue = stats?.bestScore?.score || 0;
                      } else if (metric.key === "worstScore") {
                        value = metric.format(stats);
                        rawValue = stats?.worstScore?.score || 0;
                      } else {
                        value =
                          typeof metric.format === "function"
                            ? (metric.format as (v: unknown) => string)(
                                stats?.[metric.key]
                              )
                            : "N/A";
                        rawValue = (stats?.[metric.key] as number) || 0;
                      }

                      const isTop =
                        stats &&
                        (metric.inverse
                          ? isTopValue(100 - rawValue, metric.key)
                          : isTopValue(rawValue, metric.key));

                      return (
                        <Td
                          key={playerIndex}
                          borderColor={borderColor}
                          textAlign="center"
                        >
                          <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            gap={1}
                          >
                            {isTop && (
                              <Badge
                                colorScheme="green"
                                fontSize="2xs"
                                px={2}
                                borderRadius="full"
                              >
                                {t("components.comparatorCharts.badgeBest")}
                              </Badge>
                            )}
                            <Text
                              fontSize="sm"
                              fontWeight={isTop ? "bold" : "normal"}
                              color={isTop ? "green.500" : undefined}
                            >
                              {value}
                            </Text>
                            {stats &&
                              !metric.inverse &&
                              getComparisonIcon(rawValue, metric.key)}
                          </Flex>
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <Box
            p={3}
            borderRadius="lg"
            bg={isDark ? "rgba(49,130,206,0.08)" : "blue.50"}
          >
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              💡 {t("components.comparatorCharts.tableFooterPrefix")} <Badge colorScheme="green" fontSize="2xs">{t("components.comparatorCharts.badgeBest")}</Badge> {t("components.comparatorCharts.tableFooterSuffix")}
            </Text>
          </Box>
      </VStack>
    </Box>
  );
};
