import { Badge, Box, Grid, HStack, Icon, Text, Tooltip } from "@chakra-ui/react";
import { FiGlobe, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import type { IUserStats } from "@/hooks/useAPI";

interface RankingSectionProps {
  ranking: IUserStats["ranking"];
  guildName?: string;
  hasGuild: boolean;
}

// Where the player stands among the others: first on the left, last on the right
// Colour of each side: [scheme, hex of the wash]
const SIDE_COLORS = { global: ["purple", "128, 90, 213"], guild: ["pink", "213, 63, 140"] } as const;
type Side = keyof typeof SIDE_COLORS;

const PositionBar = ({ rank, total, scheme }: { rank: number; total: number; scheme: string }) => {
  const position = total > 1 ? ((rank - 1) / (total - 1)) * 100 : 0;
  return (
    <Box position="relative" h="8px" borderRadius="full" bg="bg.subtle" mt={3} aria-hidden>
      <Box position="absolute" insetY={0} left={`${position}%`} right={0} borderRadius="full" bgGradient={`linear(to-r, ${scheme}.400, ${scheme}.600)`} opacity={0.45} />
      <Box
        position="absolute"
        top="50%"
        left={`${position}%`}
        transform="translate(-50%, -50%)"
        boxSize="16px"
        borderRadius="full"
        bg={`${scheme}.300`}
        boxShadow={`0 0 0 4px rgba(255,255,255,0.06), 0 0 12px var(--chakra-colors-${scheme}-400)`}
        borderWidth="3px"
        borderColor="bg.card"
      />
    </Box>
  );
};

const RankSide = ({ side, icon, label, rank, total, totalLabel, children }: {
  side: Side; icon: IconType; label: string; rank: number; total: number | null; totalLabel: string; children?: React.ReactNode;
}) => {
  const [scheme, rgb] = SIDE_COLORS[side];
  return (
    <Box px={{ base: 4, md: 6 }} py={5} minW={0} h="100%" bgGradient={`linear(to-br, rgba(${rgb}, 0.18), transparent 60%)`}>
      <HStack spacing={2} mb={2}>
        <Box p={1.5} borderRadius="md" bg={`${scheme}.900`} color={`${scheme}.200`} _light={{ bg: `${scheme}.100`, color: `${scheme}.700` }} display="grid" placeItems="center">
          <Icon as={icon} boxSize={4} aria-hidden />
        </Box>
        <Text fontSize="sm" fontWeight="semibold" color="text.muted" noOfLines={1}>{label}</Text>
      </HStack>
      <HStack align="baseline" spacing={2} flexWrap="wrap">
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="extrabold" letterSpacing="tight" lineHeight="1" color={`${scheme}.300`} _light={{ color: `${scheme}.600` }} sx={{ fontVariantNumeric: "tabular-nums" }}>
          #{rank}
        </Text>
        <Text color="text.muted" fontSize="sm">{totalLabel}</Text>
      </HStack>
      {total ? <PositionBar rank={rank} total={total} scheme={scheme} /> : null}
      {children && <HStack spacing={2} mt={3} flexWrap="wrap">{children}</HStack>}
    </Box>
  );
};

// Global and guild rank of the player, side by side in one card
export const RankingSection = ({ ranking, guildName, hasGuild }: RankingSectionProps) => {
  const { t } = useTranslation();
  if (!ranking || (!ranking.global && !ranking.guild)) return null;
  const showGuild = Boolean(ranking.guild && hasGuild);

  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", md: ranking.global && showGuild ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)" }}
      bgColor="bg.card"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
    >
      {ranking.global && (
        <RankSide
          side="global"
          icon={FiGlobe}
          label={t("components.user.ranking.globalRanking")}
          rank={ranking.global}
          total={ranking.totalPlayers}
          totalLabel={t("components.user.ranking.outOf", { count: ranking.totalPlayers ?? 0 })}
        >
          {ranking.percentile ? (
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2.5} textTransform="none">
              {t("components.user.ranking.topPercent", { pct: 100 - ranking.percentile })}
            </Badge>
          ) : null}
          {ranking.global === 1 ? (
            <Text fontSize="sm" color="orange.300" fontWeight="semibold">{t("components.user.ranking.leader")}</Text>
          ) : ranking.gapWithTop1 !== null && ranking.gapWithTop1 !== undefined && (
            <Tooltip label={t("components.user.ranking.gapHelp")} hasArrow>
              <Text fontSize="sm" color="text.muted" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {t("components.user.ranking.gapWithTop1", { gap: (ranking.gapWithTop1 / 1000000).toFixed(2) })}
              </Text>
            </Tooltip>
          )}
        </RankSide>
      )}
      {showGuild && ranking.guild && (
        <Box borderLeftWidth={{ base: 0, md: ranking.global ? "1px" : 0 }} borderTopWidth={{ base: ranking.global ? "1px" : 0, md: 0 }} borderColor="border.subtle">
          <RankSide
            side="guild"
            icon={FiUsers}
            label={t("components.user.ranking.guildRanking", { name: guildName ?? "Guilde" })}
            rank={ranking.guild}
            total={ranking.totalGuildPlayers}
            totalLabel={t("components.user.ranking.outOfMembers", { count: ranking.totalGuildPlayers ?? 0 })}
          >
            {ranking.guild === 1 && <Text fontSize="sm" color="orange.300" fontWeight="semibold">{t("components.user.ranking.leader")}</Text>}
          </RankSide>
        </Box>
      )}
    </Grid>
  );
};
