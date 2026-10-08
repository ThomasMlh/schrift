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
  Tooltip
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiAward, FiCalendar, FiUsers, FiAlertTriangle, FiBarChart2, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  // Formater la date d'ancienneté
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t("components.user.statsOverview.dateUnknown");
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
  const cardBg = "bg.card";
  const hoverBg = "bg.muted";

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
                  {t("components.user.statsOverview.labelBestScore")}
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
                  {t("components.user.statsOverview.labelWorstScore")}
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
                  {t("components.user.statsOverview.labelBestCycle")}
                </Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500" mb={2}>
                {stats.bestCycle.cycle_name || "Cycle"}
              </Text>
              <VStack align="start" spacing={0} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                <Text>
                  {t("components.user.statsOverview.avgShort")} <Text as="span" fontWeight="semibold">{(stats.bestCycle.averageScore / 1000000).toFixed(2)}M</Text>
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
                  {t("components.user.statsOverview.labelSeniority")}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="blue.500" mb={2}>
                {formatDate(stats.firstParticipation)}
              </Text>
              {daysSinceFirst !== null && (
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                  {t("components.user.statsOverview.daysAgo", { count: daysSinceFirst })}
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
                  {t("components.user.statsOverview.labelBuilds")}
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="orange.500" mb={2}>
                {stats.buildsCount}
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                {t("components.user.statsOverview.communityContrib")}
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
                    {t("components.user.statsOverview.labelMissRate")}
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
                      {t("components.user.statsOverview.missDetail", {
                        missCount: stats.missCount,
                        scoreS: stats.missCount !== 1 ? "s" : "",
                        totalScores: stats.totalScores,
                        rotationS: stats.totalScores > 1 ? "s" : ""
                      })}
                    </Text>
                  </HStack>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </>
      )}

      {/* Consistance & Cycles */}
      {(stats.consistencyScore !== undefined || (stats.temporalEvolution && stats.temporalEvolution.length > 0)) && (
        <>
          <Divider />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>

            {/* Score médian */}
            {stats.medianScore !== undefined && (
              <Card bg={cardBg} borderRadius="xl" boxShadow="md" transition="all 0.3s" _hover={{ transform: "translateY(-2px)", boxShadow: "lg", bg: hoverBg }}>
                <CardBody>
                  <HStack spacing={3} mb={3}>
                    <Box p={2} borderRadius="lg" bg="cyan.100" color="cyan.600" _dark={{ bg: "cyan.900", color: "cyan.300" }}>
                      <Icon as={FiBarChart2} boxSize={5} />
                    </Box>
                    <Tooltip label={t("components.user.statsOverview.tooltipMedianScore")} placement="top" hasArrow>
                      <Text fontSize="xs" fontWeight="bold" color="cyan.500" textTransform="uppercase" letterSpacing="wide" cursor="help">
                        {t("components.user.statsOverview.labelMedianScore")}
                      </Text>
                    </Tooltip>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="cyan.500" mb={1}>
                    {(stats.medianScore / 1000000).toFixed(2)}M
                  </Text>
                  {stats.averageScore > 0 && (
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                      {stats.medianScore > stats.averageScore
                        ? `+${((stats.medianScore - stats.averageScore) / 1000000).toFixed(2)}M ${t("components.user.statsOverview.vsMean")}`
                        : `${((stats.medianScore - stats.averageScore) / 1000000).toFixed(2)}M ${t("components.user.statsOverview.vsMean")}`}
                    </Text>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Consistance */}
            {stats.consistencyScore !== undefined && (
              <Card bg={cardBg} borderRadius="xl" boxShadow="md" transition="all 0.3s" _hover={{ transform: "translateY(-2px)", boxShadow: "lg", bg: hoverBg }}>
                <CardBody>
                  <HStack spacing={3} mb={3}>
                    <Box
                      p={2}
                      borderRadius="lg"
                      bg={stats.consistencyScore <= 15 ? "green.100" : stats.consistencyScore <= 30 ? "yellow.100" : "red.100"}
                      color={stats.consistencyScore <= 15 ? "green.600" : stats.consistencyScore <= 30 ? "yellow.600" : "red.600"}
                      _dark={{
                        bg: stats.consistencyScore <= 15 ? "green.900" : stats.consistencyScore <= 30 ? "yellow.900" : "red.900",
                        color: stats.consistencyScore <= 15 ? "green.300" : stats.consistencyScore <= 30 ? "yellow.300" : "red.300"
                      }}
                    >
                      <Icon as={FiTrendingUp} boxSize={5} />
                    </Box>
                    <Tooltip label={t("components.user.statsOverview.tooltipConsistency")} placement="top" hasArrow>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={stats.consistencyScore <= 15 ? "green.500" : stats.consistencyScore <= 30 ? "yellow.500" : "red.500"}
                        textTransform="uppercase"
                        letterSpacing="wide"
                        cursor="help"
                      >
                        {t("components.user.statsOverview.labelConsistency")}
                      </Text>
                    </Tooltip>
                  </HStack>
                  <HStack align="baseline" spacing={2} mb={1}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color={stats.consistencyScore <= 15 ? "green.500" : stats.consistencyScore <= 30 ? "yellow.500" : "red.500"}
                    >
                      {stats.consistencyScore <= 15 ? t("components.user.statsOverview.consistencyVeryRegular") : stats.consistencyScore <= 30 ? t("components.user.statsOverview.consistencyRegular") : t("components.user.statsOverview.consistencyIrregular")}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                    CV {stats.consistencyScore}% — σ {stats.stdDeviation !== undefined ? (stats.stdDeviation / 1000000).toFixed(2) : "?"}M
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Cycles joués */}
            {(stats.cyclesWithFullParticipation !== undefined || (stats.temporalEvolution && stats.temporalEvolution.length > 0)) && (
              <Card bg={cardBg} borderRadius="xl" boxShadow="md" transition="all 0.3s" _hover={{ transform: "translateY(-2px)", boxShadow: "lg", bg: hoverBg }}>
                <CardBody>
                  <HStack spacing={3} mb={3}>
                    <Box p={2} borderRadius="lg" bg="teal.100" color="teal.600" _dark={{ bg: "teal.900", color: "teal.300" }}>
                      <Icon as={FiCheckCircle} boxSize={5} />
                    </Box>
                    <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase" letterSpacing="wide">
                      {t("components.user.statsOverview.labelCyclesPlayed")}
                    </Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" color="teal.500" mb={1}>
                    {stats.temporalEvolution?.length ?? 0}
                  </Text>
                  {stats.cyclesWithFullParticipation !== undefined && (
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                      {stats.cyclesWithFullParticipation} cycle{stats.cyclesWithFullParticipation !== 1 ? "s" : ""} complet{stats.cyclesWithFullParticipation !== 1 ? "s" : ""} (20 rot.)
                    </Text>
                  )}
                </CardBody>
              </Card>
            )}
          </SimpleGrid>
        </>
      )}
    </VStack>
  );
};
