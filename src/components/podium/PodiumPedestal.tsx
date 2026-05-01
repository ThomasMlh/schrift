import { Box, VStack, HStack, Text, Avatar, Badge, useColorModeValue } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import CustomLink from "@/components/ui/CustomLink";

export interface PodiumPedestalPlayer {
  rank: number;
  user_id: string;
  bbs_name?: string;
  global_name: string;
  discord_id?: string;
  avatar?: string;
  guild_name?: string;
  displayScore: number;
  forceBlueScore?: boolean;
}

interface PodiumPedestalProps {
  players: PodiumPedestalPlayer[];
  showGuildName?: boolean;
}

const PODIUM_CONFIG = {
  1: {
    pedestalHeight: "120px",
    avatarSize: "xl" as const,
    glowColor: "rgba(255, 215, 0, 0.45)",
    borderColor: "#FFD700",
    glowShadow: "0 0 24px 8px rgba(255, 215, 0, 0.35)",
    pedestalBg: "linear(to-t, rgba(255, 215, 0, 0.18), rgba(255, 215, 0, 0.05))",
    pedestalBorder: "#FFD700",
    textColor: "yellow.300",
    emoji: "🥇",
  },
  2: {
    pedestalHeight: "85px",
    avatarSize: "lg" as const,
    glowColor: "rgba(192, 192, 192, 0.4)",
    borderColor: "#C0C0C0",
    glowShadow: "0 0 18px 6px rgba(192, 192, 192, 0.3)",
    pedestalBg: "linear(to-t, rgba(192, 192, 192, 0.12), rgba(192, 192, 192, 0.04))",
    pedestalBorder: "#C0C0C0",
    textColor: "gray.300",
    emoji: "🥈",
  },
  3: {
    pedestalHeight: "60px",
    avatarSize: "lg" as const,
    glowColor: "rgba(205, 127, 50, 0.4)",
    borderColor: "#CD7F32",
    glowShadow: "0 0 18px 6px rgba(205, 127, 50, 0.3)",
    pedestalBg: "linear(to-t, rgba(205, 127, 50, 0.12), rgba(205, 127, 50, 0.04))",
    pedestalBorder: "#CD7F32",
    textColor: "orange.300",
    emoji: "🥉",
  },
} as const;

interface PedestalSlotProps {
  player: PodiumPedestalPlayer;
  showGuildName: boolean;
}

const PedestalSlot = ({ player, showGuildName }: PedestalSlotProps) => {
  const cfg = PODIUM_CONFIG[player.rank as 1 | 2 | 3];
  const avatarUrl =
    player.avatar && player.discord_id
      ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined
      : undefined;

  return (
    <VStack
      align="center"
      spacing={0}
      flex={player.rank === 1 ? "1.2 1 0%" : "1 1 0%"}
      maxW={player.rank === 1 ? "180px" : "145px"}
      minW="100px"
    >
      {/* Avatar zone */}
      <VStack spacing={2} align="center" pb={2}>
        {/* Emoji médaille flottant */}
        <Text fontSize={player.rank === 1 ? "2xl" : "xl"} lineHeight={1}>
          {cfg.emoji}
        </Text>

        {/* Avatar avec glow */}
        <Box position="relative">
          <Box
            position="absolute"
            inset="-3px"
            borderRadius="full"
            border="2px solid"
            borderColor={cfg.borderColor}
            boxShadow={cfg.glowShadow}
          />
          <Avatar
            size={cfg.avatarSize}
            src={avatarUrl}
            name={player.bbs_name || player.global_name}
            border="2px solid"
            borderColor={cfg.borderColor}
          />
        </Box>

        {/* Nom */}
        <VStack spacing={0} align="center" mt={1}>
          <CustomLink
            to={`/joueur/${player.user_id}`}
            text={player.bbs_name || player.global_name}
            textSize={player.rank === 1 ? "sm" : "xs"}
            requireAuth
            rainbow={player.rank === 1}
            sx={{ fontWeight: player.rank === 1 ? "bold" : "semibold", textAlign: "center", noOfLines: 1 }}
          />
          {showGuildName && player.guild_name && (
            <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} borderRadius="full" maxW="130px" isTruncated>
              {player.guild_name}
            </Badge>
          )}
        </VStack>

        {/* Score */}
        <ScoreBadge
          score={player.displayScore}
          forceBlue={player.forceBlueScore}
          fontSize={{ base: "xs", md: "sm" }}
        />
      </VStack>

      {/* Socle */}
      <Box
        w="100%"
        h={cfg.pedestalHeight}
        bgGradient={cfg.pedestalBg}
        borderTop="3px solid"
        borderColor={cfg.pedestalBorder}
        borderTopRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          color={cfg.textColor}
          fontSize={player.rank === 1 ? "4xl" : "3xl"}
          fontWeight="black"
          opacity={0.55}
          userSelect="none"
        >
          {player.rank}
        </Text>
      </Box>
    </VStack>
  );
};

export const PodiumPedestal = ({ players, showGuildName = false }: PodiumPedestalProps) => {
  const containerBg = useColorModeValue("gray.50", "gray.900");

  const top3 = [1, 2, 3]
    .map((rank) => players.find((p) => p.rank === rank))
    .filter(Boolean) as PodiumPedestalPlayer[];

  if (top3.length === 0) return null;

  // Affichage: 2e, 1er, 3e (classique)
  const displayOrder = [
    top3.find((p) => p.rank === 2),
    top3.find((p) => p.rank === 1),
    top3.find((p) => p.rank === 3),
  ].filter(Boolean) as PodiumPedestalPlayer[];

  return (
    <Box
      w="100%"
      bg={containerBg}
      borderRadius="xl"
      p={{ base: 4, md: 6 }}
      overflow="hidden"
    >
      <HStack
        align="flex-end"
        justify="center"
        spacing={{ base: 3, md: 8 }}
        w="100%"
      >
        {displayOrder.map((player) => (
          <PedestalSlot
            key={player.user_id}
            player={player}
            showGuildName={showGuildName}
          />
        ))}
      </HStack>
    </Box>
  );
};
