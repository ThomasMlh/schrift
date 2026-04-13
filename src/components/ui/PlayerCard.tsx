import {
  Card,
  CardBody,
  VStack,
  Badge,
  Stack
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import type { IPodiumPlayer, IUser } from "@/interfaces";
import { ScoreBadge } from "./ScoreBadge";
import { RankBadge } from "./RankBadge";

const PlayerCard = (
  player: IPodiumPlayer,
  showGuildName = false,
  podiumType: "individual_scores" | "average_scores" | "max_scores" =
    "average_scores"
) => {
  // Si player.score est défini, c'est une rotation individuelle (respecter code couleur)
  // Sinon c'est une moyenne de cycle (forcer bleu)
  const isRotationMode = player.score !== undefined;
  const cycleScore =
    podiumType === "max_scores"
      ? player.totalScore ?? player.averageScore ?? 0
      : player.averageScore ?? player.totalScore ?? 0;
  
  return (
    <Card key={player.user_id} variant="outline">
      <CardBody p={{ base: 3, md: 4 }}>
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
        >
          <Stack direction={{ base: "column", md: "row" }} spacing={4} flex={1} align="center">
            <RankBadge rank={player.rank} />
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
            {showGuildName && player.guild_name && (
              <Badge colorScheme="blue" fontSize="xs">
                {player.guild_name}
              </Badge>
            )}
          </Stack>
          <VStack spacing={1} align={{ base: "center", md: "flex-end" }}>
            <ScoreBadge
              score={isRotationMode ? player.score || 0 : cycleScore}
              forceBlue={!isRotationMode}
            />
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerCard;
