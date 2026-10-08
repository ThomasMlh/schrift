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
import { useTranslation } from "react-i18next";

export interface TableMetricDef {
  label: string;
  icon: string;
  getDisplayValue: (stats: Record<string, unknown>) => string;
  getRawValue: (stats: Record<string, unknown>) => number;
  inverse?: boolean; // lower raw value = better
}

export interface TableEntityDef {
  name: string;
  color: string;
  stats: Record<string, unknown>;
}

interface ComparisonDataTableProps {
  entities: TableEntityDef[];
  metrics: TableMetricDef[];
  heading: string;
  accentBg?: string;
}

export const ComparisonDataTable = ({
  entities,
  metrics,
  heading,
  accentBg,
}: ComparisonDataTableProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const tableBg = "bg.muted";
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const defaultAccentBg = isDark ? "rgba(49,130,206,0.08)" : "blue.50";
  const { t } = useTranslation();

  const getBest = (metric: TableMetricDef): number | null => {
    const values = entities
      .filter((e) => e.stats)
      .map((e) => metric.getRawValue(e.stats));
    if (!values.length) return null;
    return metric.inverse ? Math.min(...values) : Math.max(...values);
  };

  const getComparisonIcon = (rawValue: number, metric: TableMetricDef) => {
    const best = getBest(metric);
    if (best === null || rawValue === best) return <Icon as={FiTrendingUp} color="green.500" />;
    const pct = metric.inverse
      ? (best / (rawValue || 1)) * 100
      : (rawValue / (best || 1)) * 100;
    if (pct >= 90) return <Icon as={FiMinus} color="yellow.500" />;
    return <Icon as={FiTrendingDown} color="red.500" />;
  };

  return (
    <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={5} h="100%" display="flex" flexDirection="column">
      <VStack spacing={4} align="stretch" flex={1}>
        <Text fontSize="lg" fontWeight="bold">{heading}</Text>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={tableBg}>
              <Tr>
                <Th borderColor={borderColor} minW="150px">
                  {t("components.comparatorCharts.colMetric")}
                </Th>
                {entities.map((entity, i) => (
                  <Th key={i} borderColor={borderColor} textAlign="center">
                    <VStack spacing={1}>
                      <Box w={3} h={3} borderRadius="full" bg={entity.color} />
                      <Text fontSize="xs" fontWeight="bold">{entity.name}</Text>
                    </VStack>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {metrics.map((metric, mi) => {
                const best = getBest(metric);
                return (
                  <Tr key={mi} _hover={{ bg: tableBg }} transition="all 0.2s">
                    <Td borderColor={borderColor} fontWeight="medium">
                      <HStack spacing={2}>
                        <Text fontSize="sm">{metric.icon}</Text>
                        <Text fontSize="sm">{metric.label}</Text>
                      </HStack>
                    </Td>
                    {entities.map((entity, ei) => {
                      const stats = entity.stats;
                      const displayValue = stats ? metric.getDisplayValue(stats) : "N/A";
                      const rawValue = stats ? metric.getRawValue(stats) : 0;
                      const isTop = !!stats && best !== null && rawValue === best;

                      return (
                        <Td key={ei} borderColor={borderColor} textAlign="center">
                          <Flex direction="column" align="center" justify="center" gap={1}>
                            {isTop && (
                              <Badge colorScheme="green" fontSize="2xs" px={2} borderRadius="full">
                                {t("components.comparatorCharts.badgeBest")}
                              </Badge>
                            )}
                            <Text
                              fontSize="sm"
                              fontWeight={isTop ? "bold" : "normal"}
                              color={isTop ? "green.500" : undefined}
                            >
                              {displayValue}
                            </Text>
                            {stats && !metric.inverse && getComparisonIcon(rawValue, metric)}
                          </Flex>
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
        <Box p={3} borderRadius="lg" bg={accentBg ?? defaultAccentBg}>
          <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
            💡 {t("components.comparatorCharts.tableFooterPrefix")}{" "}
            <Badge colorScheme="green" fontSize="2xs">{t("components.comparatorCharts.badgeBest")}</Badge>{" "}
            {t("components.comparatorCharts.tableFooterSuffix")}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};
