import type { IComparisonEntity, IUser } from "@/interfaces";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Grid,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  VStack
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";

interface ComparisonEntityProps {
  entityId: string;
  entityData: IComparisonEntity;
  isWinner: boolean;
  comparisonType: "players" | "guilds";
}

// Composant pour le rendu d'une entité de comparaison
const ComparisonEntity: React.FC<ComparisonEntityProps> = ({
  entityId,
  entityData,
  isWinner,
  comparisonType
}) => {
  const entityInfo = entityData.entityInfo;
  const stats = entityData.stats;

  const winnerBg = useColorModeValue("green.50", "green.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Card
      key={entityId}
      bg={isWinner ? winnerBg : undefined}
      borderWidth={isWinner ? 2 : 1}
      borderColor={isWinner ? "green.500" : borderColor}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <VStack spacing={1} align="start" flex={1}>
            {comparisonType === "players" ? (
              <UserDisplay
                user={
                  {
                    _id: entityId,
                    username:
                      entityInfo?.global_name ||
                      entityInfo?.bbs_name ||
                      "Joueur",
                    global_name:
                      entityInfo?.global_name ||
                      entityInfo?.bbs_name ||
                      "Joueur",
                    discord_id: entityInfo?.discord_id || "",
                    bbs_name: entityInfo?.bbs_name,
                    avatar: entityInfo?.avatar,
                    guilde_id: "",
                    role: "membre"
                  } as IUser
                }
                avatarSize="md"
                textSize="md"
              />
            ) : (
              <VStack spacing={1} align="start">
                <Text fontSize="lg" fontWeight="bold">
                  {entityInfo?.name || "Guilde inconnue"}
                </Text>
                {entityInfo?.description && (
                  <Text fontSize="sm" color="gray.500">
                    {entityInfo.description}
                  </Text>
                )}
              </VStack>
            )}
          </VStack>

          {isWinner && (
            <Badge colorScheme="green" variant="solid" px={3} py={1}>
              🏆 Gagnant
            </Badge>
          )}
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <Stat>
              <StatLabel>Score Moyen</StatLabel>
              <StatNumber color="blue.500">
                {stats.averageScore.toLocaleString("fr-FR")}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Scores</StatLabel>
              <StatNumber>{stats.totalScores}</StatNumber>
            </Stat>
          </Grid>

          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <Stat size="sm">
              <StatLabel>Score Max</StatLabel>
              <StatNumber fontSize="md">
                {stats.maxScore.toLocaleString("fr-FR")}
              </StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel>Score Min</StatLabel>
              <StatNumber fontSize="md">
                {stats.minScore.toLocaleString("fr-FR")}
              </StatNumber>
            </Stat>
          </Grid>

          <Text fontSize="xs" color="gray.500">
            Score brut moyen: {stats.averageRawScore.toLocaleString("fr-FR")}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ComparisonEntity;
