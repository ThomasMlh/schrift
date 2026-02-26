import {
  VStack,
  SimpleGrid,
  Box,
  HStack,
  Text,
  Divider,
  Card,
  CardBody,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiAward, FiCalendar, FiUsers, FiAlertTriangle } from "react-icons/fi";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { RankingSection } from "./RankingSection";
import type { IUserStats } from "@/hooks/useAPI";

interface UserStatsOverviewProps {
  stats: IUserStats;
  guildName?: string;
  hasGuild: boolean;
}

export const UserStatsOverview = ({
  stats,
  guildName,
  hasGuild
}: UserStatsOverviewProps) => {
  // Formater la date d'ancienneté
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Calculer le nombre de jours depuis la première participation
  const getDaysSinceFirstParticipation = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const firstDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceFirst = stats.firstParticipation 
    ? getDaysSinceFirstParticipation(stats.firstParticipation)
    : null;

  // Couleurs pour le mode clair/sombre
  const cardBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <VStack spacing={6} align="stretch">
      {/* Classement */}
      <RankingSection
        ranking={stats.ranking}
        guildName={guildName}
        hasGuild={hasGuild}
      />

      {/* Meilleur Score et Score à Améliorer */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Meilleur Score */}
        <Card
          bg={cardBg}
          borderRadius="2xl"
          overflow="hidden"
          position="relative"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ 
            transform: "translateY(-4px)", 
            boxShadow: "2xl",
            bg: hoverBg
          }}
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            width="150px"
            height="150px"
            bgGradient="linear(to-br, green.400, green.600)"
            opacity={0.1}
            borderRadius="full"
            transform="translate(30%, -30%)"
          />
          <CardBody>
            <HStack spacing={4} align="start">
              <Box
                p={3}
                borderRadius="xl"
                bgGradient="linear(to-br, green.400, green.600)"
                color="white"
              >
                <Icon as={FiTrendingUp} boxSize={6} />
              </Box>
              <Box flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="green.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={2}
                >
                  Meilleur Score
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color="green.500" lineHeight="1">
                  {stats.bestScore.score.toLocaleString("fr-FR")}
                </Text>
                <HStack spacing={2} mt={3}>
                  <Text fontWeight="medium" fontSize="md">
                    {stats.bestScore.rotation_killer}
                  </Text>
                  <AttackTypeBadge attackType={stats.bestScore.rotation_attack} />
                </HStack>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Score à Améliorer */}
        <Card
          bg={cardBg}
          borderRadius="2xl"
          overflow="hidden"
          position="relative"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ 
            transform: "translateY(-4px)", 
            boxShadow: "2xl",
            bg: hoverBg
          }}
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            width="150px"
            height="150px"
            bgGradient="linear(to-br, red.400, red.600)"
            opacity={0.1}
            borderRadius="full"
            transform="translate(30%, -30%)"
          />
          <CardBody>
            <HStack spacing={4} align="start">
              <Box
                p={3}
                borderRadius="xl"
                bgGradient="linear(to-br, red.400, red.600)"
                color="white"
              >
                <Icon as={FiTrendingDown} boxSize={6} />
              </Box>
              <Box flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="red.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={2}
                >
                  Score à Améliorer
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color="red.500" lineHeight="1">
                  {stats.worstScore.score.toLocaleString("fr-FR")}
                </Text>
                <HStack spacing={2} mt={3}>
                  <Text fontWeight="medium" fontSize="md">
                    {stats.worstScore.rotation_killer}
                  </Text>
                  <AttackTypeBadge attackType={stats.worstScore.rotation_attack} />
                </HStack>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Divider />

      {/* Statistiques secondaires */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {/* Meilleur Cycle */}
        {stats.bestCycle && (
          <Card
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "lg",
              bg: hoverBg
            }}
          >
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="purple.100"
                  color="purple.600"
                  _dark={{
                    bg: "purple.900",
                    color: "purple.300"
                  }}
                >
                  <Icon as={FiAward} boxSize={5} />
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="purple.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Meilleur Cycle
                </Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500" mb={2}>
                {stats.bestCycle.cycle_name || "Cycle"}
              </Text>
              <VStack align="start" spacing={0} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                <Text>
                  Moy: <Text as="span" fontWeight="semibold">{(stats.bestCycle.averageScore / 1000000).toFixed(2)}M</Text>
                </Text>
                <Text>
                  {stats.bestCycle.scoreCount} rotation{stats.bestCycle.scoreCount > 1 ? "s" : ""}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Ancienneté */}
        {stats.firstParticipation && (
          <Card
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "lg",
              bg: hoverBg
            }}
          >
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="blue.100"
                  color="blue.600"
                  _dark={{
                    bg: "blue.900",
                    color: "blue.300"
                  }}
                >
                  <Icon as={FiCalendar} boxSize={5} />
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="blue.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Ancienneté
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="blue.500" mb={2}>
                {formatDate(stats.firstParticipation)}
              </Text>
              {daysSinceFirst !== null && (
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                  Il y a {daysSinceFirst} jour{daysSinceFirst > 1 ? "s" : ""}
                </Text>
              )}
            </CardBody>
          </Card>
        )}

        {/* Builds Créés */}
        {stats.buildsCount !== undefined && (
          <Card
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "lg",
              bg: hoverBg
            }}
          >
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="orange.100"
                  color="orange.600"
                  _dark={{
                    bg: "orange.900",
                    color: "orange.300"
                  }}
                >
                  <Icon as={FiUsers} boxSize={5} />
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="orange.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Builds Créés
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="orange.500" mb={2}>
                {stats.buildsCount}
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                Contribution à la communauté
              </Text>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>

      {/* Taux de miss */}
      {stats.missRate !== undefined && (
        <>
          <Divider />
          <Card
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "lg",
              bg: hoverBg
            }}
          >
            <CardBody>
              <HStack spacing={4} align="center">
                <Box
                  p={3}
                  borderRadius="xl"
                  bgGradient={
                    stats.missRate > 20 
                      ? "linear(to-br, red.400, red.600)" 
                      : stats.missRate > 10 
                      ? "linear(to-br, yellow.400, yellow.600)" 
                      : "linear(to-br, green.400, green.600)"
                  }
                  color="white"
                >
                  <Icon as={FiAlertTriangle} boxSize={6} />
                </Box>
                <Box flex={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={stats.missRate > 20 ? "red.500" : stats.missRate > 10 ? "yellow.500" : "green.500"}
                    textTransform="uppercase"
                    letterSpacing="wide"
                    mb={1}
                  >
                    Taux de Miss
                  </Text>
                  <HStack spacing={4} align="baseline">
                    <Text 
                      fontSize="4xl" 
                      fontWeight="bold" 
                      color={stats.missRate > 20 ? "red.500" : stats.missRate > 10 ? "yellow.500" : "green.500"}
                      lineHeight="1"
                    >
                      {stats.missRate}%
                    </Text>
                    <Text fontSize="md" color="gray.600" _dark={{ color: "gray.400" }}>
                      {stats.missCount} score{stats.missCount !== 1 ? "s" : ""} à 0 sur {stats.totalScores} rotation{stats.totalScores > 1 ? "s" : ""}
                    </Text>
                  </HStack>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </>
      )}
    </VStack>
  );
};
