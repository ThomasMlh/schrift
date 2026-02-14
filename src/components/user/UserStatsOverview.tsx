import {
  VStack,
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  Text,
  Divider
} from "@chakra-ui/react";
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

  return (
    <VStack spacing={6} align="stretch">
      {/* Classement */}
      <RankingSection
        ranking={stats.ranking}
        guildName={guildName}
        hasGuild={hasGuild}
      />

      <Divider />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box>
          <Stat>
            <StatLabel color="green.500" fontSize="lg" mb={2}>
              🏆 Meilleur Score
            </StatLabel>
            <StatNumber fontSize="3xl" color="green.500">
              {stats.bestScore.score.toLocaleString()}
            </StatNumber>
            <StatHelpText mt={2}>
              <HStack spacing={2}>
                <Text fontWeight="medium">
                  {stats.bestScore.rotation_killer}
                </Text>
                <AttackTypeBadge attackType={stats.bestScore.rotation_attack} />
              </HStack>
            </StatHelpText>
          </Stat>
        </Box>
        <Box>
          <Stat>
            <StatLabel color="red.500" fontSize="lg" mb={2}>
              📉 Score à Améliorer
            </StatLabel>
            <StatNumber fontSize="3xl" color="red.500">
              {stats.worstScore.score.toLocaleString()}
            </StatNumber>
            <StatHelpText mt={2}>
              <HStack spacing={2}>
                <Text fontWeight="medium">
                  {stats.worstScore.rotation_killer}
                </Text>
                <AttackTypeBadge
                  attackType={stats.worstScore.rotation_attack}
                />
              </HStack>
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      <Divider />

      {/* Nouvelles statistiques */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {stats.bestCycle && (
          <Box>
            <Stat>
              <StatLabel color="purple.500" fontSize="lg" mb={2}>
                🎖️ Meilleur Cycle
              </StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {stats.bestCycle.cycle_name || "Cycle"}
              </StatNumber>
              <StatHelpText mt={2}>
                Moy: {(stats.bestCycle.averageScore / 1000000).toFixed(2)}M
                <br />
                {stats.bestCycle.scoreCount} rotation{stats.bestCycle.scoreCount > 1 ? "s" : ""}
              </StatHelpText>
            </Stat>
          </Box>
        )}
        
        {stats.firstParticipation && (
          <Box>
            <Stat>
              <StatLabel color="teal.500" fontSize="lg" mb={2}>
                📅 Ancienneté
              </StatLabel>
              <StatNumber fontSize="xl" color="teal.500">
                {formatDate(stats.firstParticipation)}
              </StatNumber>
              <StatHelpText mt={2}>
                {daysSinceFirst !== null && (
                  <>Il y a {daysSinceFirst} jour{daysSinceFirst > 1 ? "s" : ""}</>
                )}
              </StatHelpText>
            </Stat>
          </Box>
        )}
        
        {stats.buildsCount !== undefined && (
          <Box>
            <Stat>
              <StatLabel color="orange.500" fontSize="lg" mb={2}>
                🔧 Builds Créés
              </StatLabel>
              <StatNumber fontSize="3xl" color="orange.500">
                {stats.buildsCount}
              </StatNumber>
              <StatHelpText mt={2}>
                Contribution{stats.buildsCount > 1 ? "s" : ""} à la communauté
              </StatHelpText>
            </Stat>
          </Box>
        )}
      </SimpleGrid>
    </VStack>
  );
};
