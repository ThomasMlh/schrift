import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Skeleton,
  SkeletonCircle,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Link as RouterLink } from "react-router-dom";
import useSWR from "swr";
import type { IPodiumWeeklyResponse } from "@/interfaces";
import { apiUrl } from "@/hooks/api/shared";
import { getUserAvatarUrl } from "@/utils/discord";

interface GuildWeeklyRankingProps {
  guildName: string;
  cycleName: string;
  cycleId: string;
  maxWeeks: number;
  weekNumber: number;
  onWeekChange: (week: number) => void;
}

const RANK_COLORS = ["yellow.400", "gray.300", "orange.400"];

export const GuildWeeklyRanking = ({
  guildName,
  cycleName,
  cycleId,
  maxWeeks,
  weekNumber,
  onWeekChange,
}: GuildWeeklyRankingProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const rowHover = useColorModeValue("gray.50", "whiteAlpha.50");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  const url =
    cycleName && weekNumber
      ? `${apiUrl}/api/podium/weekly?cycle_name=${encodeURIComponent(cycleName)}&week_number=${weekNumber}&guild_name=${encodeURIComponent(guildName)}&limit=20`
      : null;

  const { data, isLoading } = useSWR<IPodiumWeeklyResponse>(url, async (u: string) => {
    const res = await fetch(u);
    if (!res.ok) throw new Error("Erreur chargement classement");
    return res.json();
  }, { revalidateOnFocus: false, dedupingInterval: 30000 });

  const players = data?.data ?? [];
  const rotInfo = data?.meta?.rotationsInfo ?? [];

  if (maxWeeks < 1) return null;

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
    >
      {/* Header */}
      <HStack
        px={5}
        py={3}
        justify="space-between"
        borderBottomWidth="1px"
        borderColor={borderColor}
        flexWrap="wrap"
        gap={2}
      >
        <HStack spacing={2}>
          <Text fontWeight="bold" fontSize="sm">
            Classement hebdomadaire
          </Text>
          <Badge colorScheme="purple" borderRadius="full" fontSize="2xs">
            {guildName}
          </Badge>
        </HStack>
        <HStack spacing={2}>
          {rotInfo.map((r) => (
            <Badge key={r.position} colorScheme="blue" variant="subtle" fontSize="2xs">
              R{r.position} {r.killer}
            </Badge>
          ))}
          <CustomSelect
            size="sm"
            w="130px"
            allowDeselect={false}
            value={String(weekNumber)}
            onChange={(v) => onWeekChange(Number(v))}
            options={Array.from({ length: maxWeeks }, (_, i) => ({
              value: String(i + 1),
              label: `Semaine ${i + 1}`,
            }))}
          />
        </HStack>
      </HStack>

      {/* List */}
      <VStack spacing={0} align="stretch" px={0} divider={<Divider borderColor={borderColor} />}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <HStack key={i} px={4} py={3} spacing={3}>
                <SkeletonCircle size="8" />
                <Skeleton h="14px" flex={1} />
                <Skeleton h="14px" w="60px" />
              </HStack>
            ))
          : players.length === 0
          ? (
            <Text px={5} py={6} color={mutedColor} fontSize="sm" textAlign="center">
              Aucun score pour cette semaine
            </Text>
          )
          : players.map((player) => {
              const avatarUrl =
                player.avatar && player.discord_id
                  ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined
                  : undefined;
              const rankColor =
                player.rank <= 3 ? RANK_COLORS[player.rank - 1] : "gray.500";
              const displayName =
                player.bbs_name || player.global_name || player.username;
              return (
                <HStack
                  key={player.user_id}
                  px={4}
                  py={4}
                  spacing={3}
                  _hover={{ bg: rowHover }}
                  transition="background 0.1s"
                >
                    <Text
                      fontWeight="bold"
                      fontSize="sm"
                      color={rankColor}
                      minW="36px"
                      textAlign="center"
                      flexShrink={0}
                      whiteSpace="nowrap"
                    >
                      #{player.rank}
                    </Text>
                    <Avatar size="sm" src={avatarUrl} name={displayName} />
                    <Box flex={1} minW={0}>
                      <RouterLink to={`/utilisateurs/${player.user_id}`}>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          noOfLines={1}
                          _hover={{ color: "blue.500" }}
                        >
                          {displayName}
                        </Text>
                      </RouterLink>
                    </Box>
                    <VStack spacing={0} align="flex-end" flexShrink={0}>
                      <Text fontSize="sm" fontWeight="bold" color="blue.500">
                        {Math.round(player.week_total_score).toLocaleString("fr-FR")}
                      </Text>
                      <Text fontSize="2xs" color={mutedColor}>
                        {Math.round(player.rotation1_score).toLocaleString("fr-FR")} +{" "}
                        {Math.round(player.rotation2_score).toLocaleString("fr-FR")}
                      </Text>
                    </VStack>
                </HStack>
              );
            })}
      </VStack>

      {players.length > 0 && (
        <Box px={5} py={2} borderTopWidth="1px" borderColor={borderColor}>
          <RouterLink to={`/podium?mode=weekly&cycle_id=${cycleId}&week_number=${weekNumber}&guild=${encodeURIComponent(guildName)}`}>
            <Text fontSize="xs" color="blue.400" _hover={{ color: "blue.600" }}>
              Voir classement complet →
            </Text>
          </RouterLink>
        </Box>
      )}
    </Box>
  );
};
