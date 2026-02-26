import { Card, CardBody, Stack, Badge, Tooltip, Box } from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import type { IPodiumWeeklyPlayer, IUser } from "@/interfaces";
import { ScoreBadge } from "./ScoreBadge";
import { RankBadge } from "./RankBadge";

const PlayerCardWeekly = (
  player: IPodiumWeeklyPlayer,
  showGuildName = false
) => {
  return (
    <Card key={player.user_id} variant="outline">
      <CardBody p={{ base: 3, md: 4 }}>
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
        >
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={4}
            flex={1}
            align="center"
          >
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
          <Tooltip
            label={`R1: ${player.rotation1_score.toLocaleString("fr-FR")} • R2: ${player.rotation2_score.toLocaleString("fr-FR")}`}
            placement="bottom"
          >
            <Box>
            <ScoreBadge score={player.week_total_score} forceBlue={true} />

            </Box>
          </Tooltip>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerCardWeekly;
