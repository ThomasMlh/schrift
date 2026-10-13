import type { IComparisonEntity, IUser } from "@/interfaces";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Grid,
  HStack,
  Text,
  useColorModeValue,
  VStack,
  Box,
  Progress
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";

interface ComparisonEntityProps {
  entityId: string;
  entityData: IComparisonEntity;
  isWinner: boolean;
  comparisonType: "players" | "guilds";
}

const ComparisonEntity: React.FC<ComparisonEntityProps> = ({
  entityId,
  entityData,
  isWinner,
  comparisonType
}) => {
  const entityInfo = entityData.entityInfo;
  const stats = entityData.stats;

  const winnerBg = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  );
  const loserBg = useColorModeValue(
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  );
  const cardBg = "bg.card";
  const statBg = "bg.muted";

  return (
    <Card
      key={entityId}
      position="relative"
      overflow="hidden"
      bg={cardBg}
      borderWidth={0}
      boxShadow={isWinner ? "xl" : "lg"}
      transform={isWinner ? "scale(1.02)" : "scale(1)"}
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "2xl"
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        bgGradient={isWinner ? winnerBg : loserBg}
      />
      <CardHeader pb={2} pt={6}>
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
            <Badge
              bgGradient="linear(to-r, green.400, teal.500)"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              boxShadow="lg"
              animation="pulse 2s infinite"
            >
              🏆 GAGNANT
            </Badge>
          )}
        </HStack>
      </CardHeader>

      <CardBody pt={4}>
        <VStack spacing={4} align="stretch">
          <Box
            p={4}
            borderRadius="xl"
            bgGradient={isWinner ? winnerBg : loserBg}
            color="white"
            textAlign="center"
            position="relative"
            overflow="hidden"
          >
            <Box position="relative" zIndex={1}>
              <Text fontSize="xs" fontWeight="medium" opacity={0.9} mb={1}>
                Score Moyen
              </Text>
              <Text fontSize="3xl" fontWeight="black" letterSpacing="tight">
                {stats.averageScore.toLocaleString("fr-FR")}
              </Text>
            </Box>
            <Box
              position="absolute"
              top="-50%"
              right="-20%"
              width="150%"
              height="200%"
              opacity={0.1}
              transform="rotate(-12deg)"
              bgGradient="linear(to-br, white, transparent)"
            />
          </Box>

          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <Box
              p={3}
              borderRadius="lg"
              bg={statBg}
              transition="all 0.2s"
              _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
            >
              <Text fontSize="xs" color="gray.500" mb={1}>
                📊 Total Scores
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {stats.totalScores}
              </Text>
            </Box>
            <Box
              p={3}
              borderRadius="lg"
              bg={statBg}
              transition="all 0.2s"
              _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
            >
              <Text fontSize="xs" color="gray.500" mb={1}>
                📈 Score Brut Moyen
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {(stats.averageRawScore / 1000000).toFixed(1)}M
              </Text>
            </Box>
          </Grid>

          <VStack spacing={2} align="stretch">
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.500">
                  🔥 Score Max
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {stats.maxScore.toLocaleString("fr-FR")}
                </Text>
              </HStack>
              <Progress
                value={100}
                size="sm"
                colorScheme="green"
                borderRadius="full"
              />
            </Box>
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.500">
                  ❄️ Score Min
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {stats.minScore.toLocaleString("fr-FR")}
                </Text>
              </HStack>
              <Progress
                value={(stats.minScore / stats.maxScore) * 100}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
              />
            </Box>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ComparisonEntity;
