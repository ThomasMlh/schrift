import {
  Badge,
  Card,
  CardBody,
  Center,
  Flex,
  HStack,
  VStack
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import type { IPodiumPlayer, IUser } from "@/interfaces";
import { ScoreBadge } from "./ScoreBadge";

// Fonction pour obtenir l'affichage du rang (comme dans PodiumSection)
const getRankDisplay = (rank: number) => {
  let colorScheme = "gray";
  let emoji = "";

  if (rank === 1) {
    colorScheme = "yellow";
    emoji = "🥇";
  } else if (rank === 2) {
    colorScheme = "gray";
    emoji = "🥈";
  } else if (rank === 3) {
    colorScheme = "orange";
    emoji = "🥉";
  }

  return (
    <Badge
      colorScheme={colorScheme}
      variant="solid"
      fontSize="sm"
      px={3}
      py={1}
      borderRadius="full"
      minW={{ base: "55px", md: "auto" }}
      textAlign="center"
    >
      {emoji}#{rank}
    </Badge>
  );
};

const PlayerCard = (
  player: IPodiumPlayer,
  isMobile = false,
  useHorizontalLayout = false
) => {
  return (
    <Card key={player.user_id} variant="outline">
      <CardBody p={{ base: 3, md: 4 }}>
        {useHorizontalLayout && !isMobile ? (
          // Layout horizontal pour desktop
          <Flex justify="space-between" align="center">
            <HStack spacing={4} flex={1}>
              {getRankDisplay(player.rank)}
              <UserDisplay
                user={
                  {
                    _id: player.user_id,
                    username: player.global_name || player.bbs_name || "Joueur",
                    global_name:
                      player.global_name || player.bbs_name || "Joueur",
                    discord_id: player.discord_id || "",
                    bbs_name: player.bbs_name,
                    avatar: player.avatar,
                    guilde_id: "",
                    role: "membre"
                  } as IUser
                }
                avatarSize="sm"
                textSize="sm"
                rainbowText={player.rank === 1}
              />
            </HStack>
            <VStack spacing={1} align="end">
              <ScoreBadge
                score={player.score ? player.score : player.averageScore}
                fontSize={{ base: "xs", md: "medium" }}
              />
            </VStack>
          </Flex>
        ) : (
          // Layout vertical pour mobile ou mode compact
          <VStack spacing={3} align="stretch">
            <Center>{getRankDisplay(player.rank)}</Center>
            <VStack spacing={1} align="center">
              <UserDisplay
                user={
                  {
                    _id: player.user_id,
                    username: player.global_name || player.bbs_name || "Joueur",
                    global_name:
                      player.global_name || player.bbs_name || "Joueur",
                    discord_id: player.discord_id || "",
                    bbs_name: player.bbs_name,
                    avatar: player.avatar,
                    guilde_id: "",
                    role: "membre"
                  } as IUser
                }
                avatarSize={isMobile ? "xs" : "sm"}
                textSize={isMobile ? "xs" : "sm"}
                rainbowText={player.rank === 1}
              />
              <ScoreBadge
                score={player.score ? player.score : player.averageScore}
                fontSize={{ base: "xs", md: "medium" }}
              />
              {/* <Text fontSize="xs" color="gray.500">
                {player.score !== undefined
                  ? `Raw: ${player.raw_score?.toLocaleString() || 0}`
                  : `${player.totalScores || 0} rotation${
                      (player.totalScores || 0) > 1 ? "s" : ""
                    }`}
              </Text> */}
              {/* {player.is_differential && (
                                    <Badge colorScheme="purple" size="sm">Différentiel</Badge>
                                )} */}
            </VStack>
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};

export default PlayerCard;
