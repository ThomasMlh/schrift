import { Box, HStack, VStack, Text, Avatar, Badge, Tooltip, useColorModeValue } from "@chakra-ui/react";
import type { IPodiumWeeklyPlayer } from "@/interfaces";
import { ScoreBadge } from "./ScoreBadge";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import CustomLink from "./CustomLink";
import { TopAchievementBadge } from "@/components/achievements/TopAchievementBadge";

interface PlayerCardWeeklyProps {
  player: IPodiumWeeklyPlayer;
  showGuildName?: boolean;
}

const PlayerCardWeekly = ({ player, showGuildName = false }: PlayerCardWeeklyProps) => {
  const cardBg = "bg.card";
  const borderColor = "border.subtle";
  const hoverBorderColor = useColorModeValue("blue.400", "blue.500");
  const rankColor = "text.muted";
  const subScoreColor = "text.muted";

  const avatarUrl =
    player.avatar && player.discord_id
      ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined
      : undefined;

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      px={3}
      py={2}
      transition="all 0.15s ease"
      _hover={{ borderColor: hoverBorderColor, transform: "translateX(2px)" }}
    >
      <HStack spacing={3} justify="space-between">
        {/* Rang */}
        <Text
          fontWeight="bold"
          fontSize="sm"
          color={rankColor}
          minW="32px"
          textAlign="center"
          flexShrink={0}
        >
          #{player.rank}
        </Text>

        {/* Avatar */}
        <Avatar
          size="sm"
          src={avatarUrl}
          name={player.bbs_name || player.global_name}
          flexShrink={0}
        />

        {/* Nom + Guilde */}
        <VStack spacing={0} align="start" flex={1} overflow="hidden" minW={0}>
          <HStack spacing={1.5} maxW="100%" minW={0}>
            <CustomLink
              to={buildPlayerUrl(player.bbs_name, player.bbs_id)}
              text={player.bbs_name || player.global_name || "Joueur"}
              textSize="sm"
              requireAuth
              rainbow={player.rank === 1}
              sx={{ fontWeight: player.rank === 1 ? "semibold" : "medium", noOfLines: 1 }}
            />
            <TopAchievementBadge achievement={player.top_achievement} size={18} />
          </HStack>
          {showGuildName && player.guild_name && (
            <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} borderRadius="full">
              {player.guild_name}
            </Badge>
          )}
        </VStack>

        {/* Score total + sous-scores au survol */}
        <Tooltip
          label={`R1: ${player.rotation1_score.toLocaleString("fr-FR")} • R2: ${player.rotation2_score.toLocaleString("fr-FR")}`}
          placement="left"
          hasArrow
        >
          <VStack spacing={0} align="end" flexShrink={0}>
            <ScoreBadge
              score={player.week_total_score}
              forceBlue={true}
              fontSize={{ base: "xs", md: "sm" }}
            />
            <Text fontSize="xs" color={subScoreColor}>
              {player.rotation1_score.toLocaleString("fr-FR")} +{" "}
              {player.rotation2_score.toLocaleString("fr-FR")}
            </Text>
          </VStack>
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default PlayerCardWeekly;
