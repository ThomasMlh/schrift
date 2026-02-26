import {
  Box,
  Card,
  CardBody,
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
  Icon,
  Flex
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import type { IGuildStats } from "@/hooks/useAPI";

interface GuildComparisonTableProps {
  guildsData: Array<{
    name: string;
    stats: IGuildStats | null;
    color: string;
  }>;
}

export const GuildComparisonTable = ({
  guildsData
}: GuildComparisonTableProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("purple.50", "gray.700");

  // Trouver le meilleur pour chaque métrique
  const getBest = (metric: keyof IGuildStats): number | null => {
    const values = guildsData
      .filter((g) => g.stats)
      .map((g) => {
        const stats = g.stats as IGuildStats;
        return (stats[metric] as number) || 0;
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

  const isTopValue = (value: number, metric: keyof IGuildStats) => {
    const best = getBest(metric);
    return best !== null && value === best;
  };

  const getComparisonIcon = (
    value: number,
    metric: keyof IGuildStats
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
      label: "Nombre de Membres",
      key: "totalMembers" as const,
      format: formatNumber,
      icon: "👥"
    },
    {
      label: "Score Moyen",
      key: "averageScore" as const,
      format: formatScore,
      icon: "📊"
    },
    {
      label: "Meilleur Score",
      key: "bestScore" as const,
      format: formatNumber,
      icon: "🏆"
    },
    {
      label: "Total Participations",
      key: "totalScores" as const,
      format: formatNumber,
      icon: "🎯"
    },
    {
      label: "Points Totaux",
      key: "totalPoints" as const,
      format: formatScore,
      icon: "💰"
    }
  ];

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            📋 Tableau Comparatif des Guildes
          </Text>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg={tableBg}>
                <Tr>
                  <Th borderColor={borderColor} minW="150px">
                    Métrique
                  </Th>
                  {guildsData.map((guild, index) => (
                    <Th key={index} borderColor={borderColor} textAlign="center">
                      <VStack spacing={1}>
                        <Box
                          w={3}
                          h={3}
                          borderRadius="full"
                          bg={guild.color}
                        />
                        <Text fontSize="xs" fontWeight="bold">
                          {guild.name}
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
                    {guildsData.map((guild, guildIndex) => {
                      const stats = guild.stats;
                      const value = typeof metric.format === "function"
                        ? metric.format(stats?.[metric.key])
                        : "N/A";
                      const rawValue = (stats?.[metric.key] as number) || 0;

                      const isTop = stats && isTopValue(rawValue, metric.key);

                      return (
                        <Td
                          key={guildIndex}
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
                                MEILLEUR
                              </Badge>
                            )}
                            <Text
                              fontSize="sm"
                              fontWeight={isTop ? "bold" : "normal"}
                              color={isTop ? "green.500" : undefined}
                            >
                              {value}
                            </Text>
                            {stats && getComparisonIcon(rawValue, metric.key)}
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
            bg={bgColor}
          >
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              💡 Les valeurs marquées <Badge colorScheme="green" fontSize="2xs">MEILLEUR</Badge> représentent le top pour chaque métrique.
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
