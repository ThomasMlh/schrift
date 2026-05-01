import { Box, HStack, VStack, Text, Avatar, Badge, Tooltip, useColorModeValue } from "@chakra-ui/react";
import type { IPodiumMissPlayer } from "@/interfaces";
import { getUserAvatarUrl } from "@/utils/discord";
import CustomLink from "./CustomLink";

interface PlayerCardMissProps {
  player: IPodiumMissPlayer;
  showGuildName?: boolean;
}

const PlayerCardMiss = ({ player, showGuildName = false }: PlayerCardMissProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("red.100", "rgba(254,178,178,0.15)");
  const hoverBorderColor = useColorModeValue("red.400", "red.400");
  const rankColor = useColorModeValue("red.400", "red.400");
  const negScoreColor = useColorModeValue("red.500", "red.400");

  const avatarUrl =
    player.avatar && player.discord_id
      ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined
      : undefined;

  const tooltipLabel = player.missed_rotations
    .slice()
    .sort((a, b) => a.rotation_position - b.rotation_position)
    .map((r) => `R${r.rotation_position}: ${r.score.toLocaleString("fr-FR")}`)
    .join("  •  ");

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
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
          <CustomLink
            to={`/joueur/${player.user_id}`}
            text={player.bbs_name || player.global_name || "Joueur"}
            textSize="sm"
            requireAuth
            sx={{ fontWeight: "medium", noOfLines: 1 }}
          />
          {showGuildName && player.guild_name && (
            <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} borderRadius="full">
              {player.guild_name}
            </Badge>
          )}
        </VStack>

        {/* Misses + Score négatif */}
        <Tooltip label={tooltipLabel || "Aucun détail"} placement="left" hasArrow>
          <VStack spacing={0} align="end" flexShrink={0}>
            <Badge colorScheme="red" fontSize="sm" px={2} py={0.5} borderRadius="md">
              {player.total_misses} miss
            </Badge>
            <Text fontSize="xs" color={negScoreColor} fontWeight="medium">
              {player.total_negative_score.toLocaleString("fr-FR")}
            </Text>
          </VStack>
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default PlayerCardMiss;
