import { Box, HStack, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";
import type { TableEntityDef, TableMetricDef } from "./ComparisonDataTable";
import { getBestValue } from "./bestValue";

interface ComparisonSummaryProps {
  entities: TableEntityDef[];
  metrics: TableMetricDef[];
}

// Une carte par entité comparée : nombre de métriques où elle est (à égalité ou seule) la
// meilleure. Celle qui en gagne le plus, sans égalité, porte une couronne.
export const ComparisonSummary = ({ entities, metrics }: ComparisonSummaryProps) => {
  const wins = entities.map((entity) =>
    entity.stats
      ? metrics.filter((metric) => {
          const best = getBestValue(entities, metric);
          return best !== null && metric.getRawValue(entity.stats) === best;
        }).length
      : 0
  );
  const maxWins = Math.max(...wins);
  const leaders = wins.filter((w) => w === maxWins).length;

  return (
    <SimpleGrid columns={{ base: 2, md: Math.min(entities.length, 5) }} spacing={3}>
      {entities.map((entity, i) => {
        const isLeader = leaders === 1 && wins[i] === maxWins && maxWins > 0;
        return (
          <Box
            key={i}
            bg="bg.card"
            borderRadius="xl"
            borderWidth={isLeader ? "2px" : "1px"}
            borderColor={isLeader ? entity.color : "border.subtle"}
            borderTopWidth="4px"
            borderTopColor={entity.color}
            p={4}
          >
            <HStack spacing={1.5} mb={1} minW={0}>
              {isLeader && <Icon as={FaCrown} color={entity.color} boxSize={3.5} aria-label="En tête" />}
              <Text fontWeight="bold" color="text.strong" noOfLines={1}>{entity.name}</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="extrabold" color="text.strong" lineHeight={1.1}>
              {wins[i]}
              <Text as="span" fontSize="md" fontWeight="semibold" color="text.muted"> / {metrics.length}</Text>
            </Text>
            <Text fontSize="xs" color="text.muted">
              {entity.stats ? `métrique${wins[i] > 1 ? "s" : ""} gagnée${wins[i] > 1 ? "s" : ""}` : "Pas de données"}
            </Text>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};
