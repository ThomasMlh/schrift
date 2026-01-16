import {
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Stack,
  Badge
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import type { IPodiumWeeklyPlayer, IUser } from "@/interfaces";
import { ScoreBadge } from "./ScoreBadge";
import { RankBadge } from "./RankBadge";

const PlayerCardWeekly = (player: IPodiumWeeklyPlayer, showGuildName = false) => {
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
            <ScoreBadge score={player.week_total_score} forceBlue={true} />
            <HStack spacing={2} fontSize="xs" color="gray.600" >
              <Text>R1: {player.rotation1_score.toLocaleString("fr-FR")}</Text>
              <Text>•</Text>
              <Text>R2: {player.rotation2_score.toLocaleString("fr-FR")}</Text>
            </HStack>
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerCardWeekly;
