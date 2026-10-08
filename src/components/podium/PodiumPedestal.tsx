import { Box, VStack, HStack, Text, Avatar, Badge } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ProgressionBadge } from "@/components/ui/ProgressionBadge";
import { TopAchievementBadge } from "@/components/achievements/TopAchievementBadge";
import type { ITopAchievement } from "@/interfaces";
import CustomLink from "@/components/ui/CustomLink";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { MedalBadge } from "./MedalBadge";

export interface PodiumPedestalPlayer {
  rank: number;
  user_id: string;
  bbs_id?: string;
  bbs_name?: string;
  global_name: string;
  discord_id?: string;
  avatar?: string;
  guild_name?: string;
  displayScore: number;
  forceBlueScore?: boolean;
  // Classement progression : le badge affiche l'écart en % plutôt que le score
  progression?: { percent: number; previousAverage?: number; average?: number };
  // Succès le plus rare du joueur, affiché à côté de son pseudo
  top_achievement?: ITopAchievement | null;
}

interface PodiumPedestalProps {
  players: PodiumPedestalPlayer[];
  showGuildName?: boolean;
}

const PODIUM_CONFIG = {
  1: {
    pedestalHeight: { base: "80px", md: "120px" },
    avatarSize: { base: "lg", md: "xl" } as const,
    glowColor: "rgba(255, 215, 0, 0.45)",
    borderColor: "#FFD700",
    glowShadow: "0 0 24px 8px rgba(255, 215, 0, 0.35)",
    pedestalBg: "linear(to-t, rgba(255, 215, 0, 0.32), rgba(255, 215, 0, 0.12) 55%, rgba(255, 215, 0, 0.03))",
    pedestalBorder: "#FFD700",
    textColor: "yellow.300",
  },
  2: {
    pedestalHeight: { base: "55px", md: "85px" },
    avatarSize: { base: "md", md: "lg" } as const,
    glowColor: "rgba(192, 192, 192, 0.4)",
    borderColor: "#C0C0C0",
    glowShadow: "0 0 18px 6px rgba(192, 192, 192, 0.3)",
    pedestalBg: "linear(to-t, rgba(192, 192, 192, 0.22), rgba(192, 192, 192, 0.08) 55%, rgba(192, 192, 192, 0.02))",
    pedestalBorder: "#C0C0C0",
    textColor: "gray.300",
  },
  3: {
    pedestalHeight: { base: "40px", md: "60px" },
    avatarSize: { base: "md", md: "lg" } as const,
    glowColor: "rgba(205, 127, 50, 0.4)",
    borderColor: "#CD7F32",
    glowShadow: "0 0 18px 6px rgba(205, 127, 50, 0.3)",
    pedestalBg: "linear(to-t, rgba(205, 127, 50, 0.22), rgba(205, 127, 50, 0.08) 55%, rgba(205, 127, 50, 0.02))",
    pedestalBorder: "#CD7F32",
    textColor: "orange.300",
  },
} as const;

// Position/couleur des confettis autour de l'avatar du 1er — valeurs fixes (pas de Math.random)
// pour éviter tout écart entre le HTML pré-rendu (scripts/prerender.js) et l'hydratation client.
const CONFETTI_PIECES = [
  { left: "-20%", top: "0%", rotate: "18deg", delay: "0s", color: "#FFD700" },
  { left: "102%", top: "8%", rotate: "-22deg", delay: "0.35s", color: "#FF6B6B" },
  { left: "-14%", top: "58%", rotate: "42deg", delay: "0.7s", color: "#4ECDC4" },
  { left: "100%", top: "50%", rotate: "-12deg", delay: "1.05s", color: "#C77DFF" },
  { left: "-24%", top: "88%", rotate: "-38deg", delay: "0.2s", color: "#FFA94D" },
  { left: "106%", top: "82%", rotate: "26deg", delay: "0.55s", color: "#69DB7C" },
] as const;

const ConfettiBurst = () => (
  <Box position="absolute" inset={0} pointerEvents="none" aria-hidden="true">
    {CONFETTI_PIECES.map((p, i) => (
      <Box
        key={i}
        position="absolute"
        left={p.left}
        top={p.top}
        transform={`rotate(${p.rotate})`}
      >
        <Box
          w="6px"
          h="10px"
          borderRadius="sm"
          bg={p.color}
          sx={{
            animation: `podiumConfetti 2.4s ease-in-out ${p.delay} infinite`,
            "@keyframes podiumConfetti": {
              "0%, 100%": { transform: "translateY(0px)", opacity: 0.85 },
              "50%": { transform: "translateY(-7px)", opacity: 0.35 },
            },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
      </Box>
    ))}
  </Box>
);

interface PedestalSlotProps {
  player: PodiumPedestalPlayer;
  showGuildName: boolean;
  entranceIndex: number;
}

const PedestalSlot = ({ player, showGuildName, entranceIndex }: PedestalSlotProps) => {
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
      minW={{ base: "78px", md: "100px" }}
      sx={{
        animation: `podiumEnter 0.5s ease-out ${entranceIndex * 0.12}s both`,
        "@keyframes podiumEnter": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      {/* Avatar zone */}
      <VStack
        spacing={2}
        align="center"
        pb={2}
        transition="transform 0.2s ease-out"
        _hover={{ transform: "translateY(-4px)" }}
      >
        <MedalBadge rank={player.rank as 1 | 2 | 3} size={player.rank === 1 ? 30 : 24} />

        {/* Avatar avec glow (+ confettis pour le 1er) */}
        <Box position="relative">
          {player.rank === 1 && <ConfettiBurst />}
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
          <HStack spacing={1} justify="center" maxW="100%" minW={0}>
            <CustomLink
              to={buildPlayerUrl(player.bbs_name, player.bbs_id)}
              text={player.bbs_name || player.global_name}
              textSize={player.rank === 1 ? "sm" : "xs"}
              requireAuth
              rainbow={player.rank === 1}
              sx={{ fontWeight: player.rank === 1 ? "bold" : "semibold", textAlign: "center", noOfLines: 1 }}
            />
            <TopAchievementBadge achievement={player.top_achievement} size={player.rank === 1 ? 20 : 16} />
          </HStack>
          {showGuildName && player.guild_name && (
            <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} borderRadius="full" maxW="130px" isTruncated>
              {player.guild_name}
            </Badge>
          )}
        </VStack>

        {/* Score */}
        {player.progression ? (
          <ProgressionBadge
            percent={player.progression.percent}
            previousAverage={player.progression.previousAverage}
            average={player.progression.average}
          />
        ) : (
          <ScoreBadge
            score={player.displayScore}
            forceBlue={player.forceBlueScore}
            fontSize={{ base: "xs", md: "sm" }}
          />
        )}
      </VStack>

      {/* Socle "3D" : dégradé plus riche + biseau lumineux en haut + ombre interne en bas */}
      <Box
        w="100%"
        h={cfg.pedestalHeight}
        bgGradient={cfg.pedestalBg}
        borderTop="3px solid"
        borderColor={cfg.pedestalBorder}
        borderTopRadius="md"
        boxShadow={`inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -10px 16px rgba(0,0,0,0.28)`}
        position="relative"
        overflow="hidden"
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
  const containerBg = "bg.page";

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
        {displayOrder.map((player, index) => (
          <PedestalSlot
            key={player.user_id}
            player={player}
            showGuildName={showGuildName}
            entranceIndex={index}
          />
        ))}
      </HStack>
    </Box>
  );
};
