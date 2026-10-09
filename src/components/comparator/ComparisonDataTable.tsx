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
  Icon,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { FaCrown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getBestValue } from "./bestValue";

export interface TableMetricDef {
  label: string;
  icon: IconType;
  getDisplayValue: (stats: Record<string, unknown>) => string;
  getRawValue: (stats: Record<string, unknown>) => number;
  inverse?: boolean; // lower raw value = better
  unit?: "percent"; // l'écart s'affiche alors en points
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
}

const compact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B`;
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (abs >= 10_000) return `${Math.round(abs / 1_000).toLocaleString("fr-FR")} k`;
  return Math.round(abs).toLocaleString("fr-FR");
};

// Écart avec la meilleure valeur, toujours exprimé comme un retard ("−2,1 M", "+3 pts" si plus bas = mieux)
const formatGap = (gap: number, metric: TableMetricDef) => {
  const sign = metric.inverse ? "+" : "−";
  return metric.unit === "percent"
    ? `${sign}${Math.abs(gap).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} pts`
    : `${sign}${compact(gap)}`;
};

// Tableau métrique × entité : la meilleure valeur de chaque ligne est sur fond de la couleur
// du gagnant, les autres affichent leur écart avec elle.
export const ComparisonDataTable = ({ entities, metrics, heading }: ComparisonDataTableProps) => {
  const { t } = useTranslation();

  return (
    <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={5} h="100%">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="text.strong">{heading}</Text>

        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th minW="150px">{t("components.comparatorCharts.colMetric")}</Th>
                {entities.map((entity, i) => (
                  <Th key={i} textAlign="center" textTransform="none" letterSpacing="normal">
                    <HStack spacing={1.5} justify="center">
                      <Box w={2.5} h={2.5} borderRadius="full" bg={entity.color} flexShrink={0} />
                      <Text fontSize="xs" fontWeight="bold" color="text.strong" noOfLines={1}>{entity.name}</Text>
                    </HStack>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {metrics.map((metric, mi) => {
                const best = getBestValue(entities, metric);
                const winners = entities.filter((e) => e.stats && best !== null && metric.getRawValue(e.stats) === best);
                const isTie = winners.length > 1;
                return (
                  <Tr key={mi} _hover={{ bg: "bg.hover" }}>
                    <Td py={3}>
                      <HStack spacing={2}>
                        <Icon as={metric.icon} color="text.muted" boxSize={4} aria-hidden />
                        <Text fontSize="sm" fontWeight="medium">{metric.label}</Text>
                      </HStack>
                    </Td>
                    {entities.map((entity, ei) => {
                      if (!entity.stats) {
                        return <Td key={ei} textAlign="center"><Text fontSize="sm" color="text.muted">—</Text></Td>;
                      }
                      const raw = metric.getRawValue(entity.stats);
                      const isTop = best !== null && raw === best;
                      return (
                        <Td key={ei} textAlign="center" py={2}>
                          {isTop ? (
                            <VStack spacing={0}>
                              <HStack
                                spacing={1}
                                px={2.5}
                                py={1}
                                borderRadius="md"
                                bg={`${entity.color}33`}
                                borderWidth="1px"
                                borderColor={entity.color}
                              >
                                {!isTie && <Icon as={FaCrown} boxSize={3} color={entity.color} aria-label={t("components.comparatorCharts.badgeBest")} />}
                                <Text fontSize="sm" fontWeight="bold" color="text.strong">
                                  {metric.getDisplayValue(entity.stats)}
                                </Text>
                              </HStack>
                            </VStack>
                          ) : (
                            <VStack spacing={0}>
                              <Text fontSize="sm" color="text.body">{metric.getDisplayValue(entity.stats)}</Text>
                              {best !== null && (
                                <Text fontSize="2xs" color="text.muted">{formatGap(best - raw, metric)}</Text>
                              )}
                            </VStack>
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};
