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
    </VStack>
  );
};
