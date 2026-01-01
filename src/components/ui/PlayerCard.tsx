import {
  Badge,
  Card,
  CardBody,
  Flex,
  HStack,
  Text,
  VStack
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import type { IPodiumPlayer, IUser } from "@/interfaces";

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
      px={2}
      py={1}
      borderRadius="full"
      display="flex"
      alignItems="center"
      gap={1}
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
              />
            </HStack>
            <VStack spacing={1} align="end">
              <Badge
                colorScheme="blue"
                variant="solid"
                fontSize="md"
                px={3}
                py={1}
              >
                {player.score !== undefined
                  ? player.score.toLocaleString()
                  : player.averageScore?.toLocaleString() || "0"}{" "}
                pts
              </Badge>
            </VStack>
          </Flex>
        ) : (
          // Layout vertical pour mobile ou mode compact
          <VStack spacing={3} align="stretch">
            <HStack spacing={3} justify="center">
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
                avatarSize={isMobile ? "xs" : "sm"}
                textSize={isMobile ? "xs" : "sm"}
              />
            </HStack>
            <VStack spacing={1} align="center">
              <Badge
                colorScheme="blue"
                variant="solid"
                fontSize={{ base: "sm", md: "md" }}
                px={3}
                py={1}
              >
                {player.score !== undefined
                  ? player.score.toLocaleString()
                  : player.averageScore?.toLocaleString() || "0"}{" "}
                pts
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {player.score !== undefined
                  ? `Raw: ${player.raw_score?.toLocaleString() || 0}`
                  : `${player.totalScores || 0} rotation${
                      (player.totalScores || 0) > 1 ? "s" : ""
                    }`}
              </Text>
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