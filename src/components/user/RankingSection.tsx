import {
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue
} from "@chakra-ui/react";
import type { IUserStats } from "@/hooks/useAPI";

interface RankingSectionProps {
  ranking: IUserStats["ranking"];
  guildName?: string;
  hasGuild: boolean;
}

export const RankingSection = ({
  ranking,
  guildName,
  hasGuild
}: RankingSectionProps) => {
  const statCardBg = useColorModeValue("blue.50", "gray.700");

  if (!ranking || (!ranking.global && !ranking.guild)) {
    return null;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {ranking.global && (
        <Card
          bg={statCardBg}
          borderRadius="xl"
          boxShadow="md"
          borderTop="4px solid"
          borderColor="cyan.500"
          transition="all 0.3s"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "xl"
          }}
        >
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" fontWeight="medium">
                🌍 Classement Global
              </StatLabel>
              <StatNumber fontSize="3xl" color="cyan.500">
                #{ranking.global}
              </StatNumber>
              <StatHelpText>
                Sur {ranking.totalPlayers} joueur
                {(ranking.totalPlayers || 0) > 1 ? "s" : ""}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      )}

      {ranking.guild && hasGuild && (
        <Card
          bg={statCardBg}
          borderRadius="xl"
          boxShadow="md"
          borderTop="4px solid"
          borderColor="pink.500"
          transition="all 0.3s"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "xl"
          }}
        >
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" fontWeight="medium">
                👥 Classement{guildName ? ` ${guildName}` : " Guilde"}
              </StatLabel>
              <StatNumber fontSize="3xl" color="pink.500">
                #{ranking.guild}
              </StatNumber>
              <StatHelpText>
                Sur {ranking.totalGuildPlayers} membre
                {(ranking.totalGuildPlayers || 0) > 1 ? "s" : ""}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      )}
    </SimpleGrid>
  );
};
