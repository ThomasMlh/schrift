import {
  VStack,
  SimpleGrid,
  Box,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Progress,
  Divider,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { FiZap, FiShield } from "react-icons/fi";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import type { IUserStats } from "@/hooks/useAPI";

interface UserTypeAnalysisProps {
  stats: IUserStats;
}

const formatScore = (score: number) => `${(score / 1000000).toFixed(2)}M`;

interface TypeRowProps {
  label: string;
  averageScore: number;
  count: number;
  maxScore: number;
  badge?: React.ReactNode;
}

const TypeRow = ({ label, averageScore, count, maxScore, badge }: TypeRowProps) => {
  const pct = maxScore > 0 ? Math.round((averageScore / maxScore) * 100) : 0;
  const rowBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box p={3} borderRadius="lg" bg={rowBg}>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Text fontWeight="semibold" fontSize="sm">{label}</Text>
          {badge}
        </HStack>
        <HStack spacing={3}>
          <Text fontSize="xs" color="gray.500">{count} rot.</Text>
          <Text fontWeight="bold" fontSize="sm">{formatScore(averageScore)}</Text>
          <Badge colorScheme={pct >= 90 ? "green" : pct >= 70 ? "blue" : pct >= 50 ? "yellow" : "red"} fontSize="xs">
            {pct}%
          </Badge>
        </HStack>
      </HStack>
      <Progress
        value={pct}
        size="sm"
        borderRadius="full"
        colorScheme={pct >= 90 ? "green" : pct >= 70 ? "blue" : pct >= 50 ? "yellow" : "red"}
      />
    </Box>
  );
};

export const UserTypeAnalysis = ({ stats }: UserTypeAnalysisProps) => {
  const cardBg = useColorModeValue("white", "gray.800");

  const maxAttackScore = stats.performanceByAttack && stats.performanceByAttack.length > 0
    ? stats.performanceByAttack[0].averageScore : 0;
  const maxAlterationScore = stats.performanceByAlteration && stats.performanceByAlteration.length > 0
    ? stats.performanceByAlteration[0].averageScore : 0;

  const hasAttackData = stats.performanceByAttack && stats.performanceByAttack.length > 1;
  const hasAlterationData = stats.performanceByAlteration && stats.performanceByAlteration.length > 0;

  if (!hasAttackData && !hasAlterationData) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          Pas assez de données pour l'analyse par type
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

        {/* Performance par type d'attaque */}
        {hasAttackData && (
          <Card bg={cardBg} borderRadius="xl" boxShadow="md">
            <CardBody>
              <HStack spacing={3} mb={4}>
                <Box p={2} borderRadius="lg" bg="red.100" color="red.600" _dark={{ bg: "red.900", color: "red.300" }}>
                  <Icon as={FiZap} boxSize={5} />
                </Box>
                <Text fontWeight="bold" fontSize="md">Attaques R vs B</Text>
              </HStack>
              <VStack spacing={2} align="stretch">
                {stats.performanceByAttack!.map((entry) => (
                  <TypeRow
                    key={entry.attack}
                    label={entry.attack === "R" ? "Attaques Rouges" : entry.attack === "B" ? "Attaques Bleues" : entry.attack}
                    averageScore={entry.averageScore}
                    count={entry.count}
                    maxScore={maxAttackScore}
                    badge={<AttackTypeBadge attackType={entry.attack} />}
                  />
                ))}
              </VStack>

              {stats.performanceByAttack!.length === 2 && (
                <>
                  <Divider my={4} />
                  <Box p={3} borderRadius="lg" bg={useColorModeValue("blue.50", "blue.900")}>
                    {(() => {
                      const sorted = [...stats.performanceByAttack!].sort((a, b) => b.averageScore - a.averageScore);
                      const diff = sorted[0].averageScore - sorted[1].averageScore;
                      const pct = sorted[1].averageScore > 0 ? Math.round((diff / sorted[1].averageScore) * 100) : 0;
                      return (
                        <Text fontSize="sm" textAlign="center">
                          Meilleur sur{" "}
                          <Text as="span" fontWeight="bold">
                            {sorted[0].attack === "R" ? "Rouges" : "Bleues"}
                          </Text>{" "}
                          de{" "}
                          <Text as="span" fontWeight="bold" color="blue.500">
                            +{formatScore(diff)} (+{pct}%)
                          </Text>
                        </Text>
                      );
                    })()}
                  </Box>
                </>
              )}
            </CardBody>
          </Card>
        )}

        {/* Performance par altération */}
        {hasAlterationData && (
          <Card bg={cardBg} borderRadius="xl" boxShadow="md">
            <CardBody>
              <HStack spacing={3} mb={4}>
                <Box p={2} borderRadius="lg" bg="teal.100" color="teal.600" _dark={{ bg: "teal.900", color: "teal.300" }}>
                  <Icon as={FiShield} boxSize={5} />
                </Box>
                <Text fontWeight="bold" fontSize="md">Performance par Altération</Text>
              </HStack>
              <VStack spacing={2} align="stretch">
                {stats.performanceByAlteration!.map((entry) => (
                  <TypeRow
                    key={entry.alteration}
                    label={entry.alteration}
                    averageScore={entry.averageScore}
                    count={entry.count}
                    maxScore={maxAlterationScore}
                  />
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
    </VStack>
  );
};
