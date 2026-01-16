import {
  Badge,
  Card,
  CardBody,
  Stack,
  Tooltip
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import type { IPodiumMissPlayer, IUser } from "@/interfaces";
import { RankBadge } from "./RankBadge";

const PlayerCardMiss = (player: IPodiumMissPlayer, showGuildName = false) => {
  return (
    <Card key={player.user_id} variant="outline" borderColor="red.200">
      <CardBody p={{ base: 3, md: 4 }}>
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
        >
          <Stack direction={{ base: "column", md: "row" }} spacing={4} flex={1} align="center">
            <RankBadge rank={player.rank} variant="miss" />
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
            {showGuildName && player.guild_name && (
              <Badge colorScheme="blue" fontSize="xs">
                {player.guild_name}
              </Badge>
            )}
          </Stack>
          <Tooltip
            label={player.missed_rotations
              .map(
                (r) =>
                  `R${r.rotation_position}`
              )
              .join(" • ")}
            placement="bottom"
          >
            <Badge colorScheme="red" fontSize="md" px={3} py={1}>
              {player.total_misses} miss
            </Badge>
          </Tooltip>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerCardMiss;
