import { Badge, Box, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { FiArrowDown, FiArrowUp, FiCrosshair, FiFlag } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { MedalBadge } from "@/components/ui/MedalBadge";
import { UserDisplay } from "@/components/ui/UserDisplay";
import type { IUserStats } from "@/hooks/useAPI";
import type { IUser } from "@/interfaces";

interface UserRivalsProps {
  rivals: NonNullable<IUserStats["rivals"]>;
  currentUser: IUser;
  currentUserRank: number | null;
  currentUserAverage: number;
  loggedInUserId?: string;
}

type Rival = NonNullable<IUserStats["rivals"]>[number];
const millions = (value: number) => `${(Math.abs(value) / 1000000).toFixed(2)}M`;

const RankChip = ({ rank, highlight }: { rank: number; highlight: boolean }) => (
  <Flex
    position="relative"
    zIndex={1}
    boxSize="44px"
    flexShrink={0}
    borderRadius="full"
    align="center"
    justify="center"
    bg={highlight ? "purple.400" : "bg.subtle"}
    color={highlight ? "white" : "text.strong"}
    borderWidth="3px"
    borderColor="bg.card"
    fontWeight="extrabold"
    fontSize="sm"
    sx={{ fontVariantNumeric: "tabular-nums" }}
  >
    {rank <= 3 && !highlight ? <MedalBadge rank={rank as 1 | 2 | 3} size={22} /> : `#${rank}`}
  </Flex>
);

// Players just above and below in the global ranking, as a ladder around the profile's player
export const UserRivals = ({ rivals, currentUser, currentUserRank, currentUserAverage, loggedInUserId }: UserRivalsProps) => {
  const { t } = useTranslation();
  if (!rivals || rivals.length === 0) return null;

  const rank = currentUserRank || 0;
  const profile: Rival & { isProfile: true } = {
    rank,
    user_id: currentUser._id,
    discord_id: currentUser.discord_id,
    global_name: currentUser.global_name,
    bbs_name: currentUser.bbs_name,
    avatar: currentUser.avatar,
    guilde_id: currentUser.guilde_id,
    guild_name: currentUser.guild_name,
    averageScore: currentUserAverage,
    scoreDifference: 0,
    isProfile: true,
  };
  const ladder: (Rival & { isProfile?: boolean })[] = [...rivals, profile].sort((a, b) => a.rank - b.rank);
  // Next one to overtake: the closest player above
  const target = rivals.filter((r) => r.rank < rank).sort((a, b) => b.rank - a.rank)[0];
  const isMe = loggedInUserId === currentUser._id;

  return (
    <Box
      bgColor="bg.card"
      bgGradient="linear(to-br, rgba(221, 107, 32, 0.14), transparent 45%)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
    >
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} mb={4} direction={{ base: "column", md: "row" }}>
        <HStack spacing={3}>
          <Box p={2} borderRadius="lg" bg="orange.900" color="orange.200" _light={{ bg: "orange.100", color: "orange.700" }}>
            <Icon as={FiCrosshair} boxSize={5} aria-hidden />
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="md" color="text.strong">{t("components.user.rivals.heading")}</Text>
            <Text fontSize="xs" color="text.muted">{t("components.user.rivals.subtitle")}</Text>
          </Box>
        </HStack>
        {target ? (
          <HStack spacing={2} bg="orange.900" _light={{ bg: "orange.50" }} borderRadius="full" px={3} py={1.5} maxW="100%">
            <Icon as={FiFlag} color="orange.300" boxSize={4} aria-hidden />
            <Text fontSize="sm" noOfLines={1}>
              {t("components.user.rivals.nextTarget", { name: target.bbs_name || target.global_name || "?" })}{" "}
              <Text as="span" fontWeight="bold" color="orange.300" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {t("components.user.rivals.toGo", { gap: millions(target.averageScore - currentUserAverage) })}
              </Text>
            </Text>
          </HStack>
        ) : rank === 1 ? (
          <Badge colorScheme="orange" borderRadius="full" px={3} py={1} textTransform="none">{t("components.user.rivals.leader")}</Badge>
        ) : null}
      </Flex>

      <VStack spacing={2} align="stretch" position="relative">
        {/* Rail linking the ranks */}
        <Box position="absolute" left="21px" top="22px" bottom="22px" w="2px" bg="border.subtle" aria-hidden />
        {ladder.map((row) => {
          const highlight = Boolean(row.isProfile);
          const gap = row.averageScore - currentUserAverage;
          const above = row.rank < rank;
          return (
            <HStack
              key={row.user_id}
              spacing={3}
              p={2}
              pr={{ base: 2, md: 4 }}
              borderRadius="xl"
              bg={highlight ? "rgba(128, 90, 213, 0.16)" : "transparent"}
              borderWidth="1px"
              borderColor={highlight ? "purple.400" : "transparent"}
              _hover={highlight ? undefined : { bg: "bg.subtle" }}
              transition="background 0.15s"
            >
              <RankChip rank={row.rank} highlight={highlight} />
              <Box flex={1} minW={0}>
                <HStack spacing={2} minW={0}>
                  <UserDisplay
                    user={{
                      _id: row.user_id,
                      discord_id: row.discord_id,
                      global_name: row.global_name || row.bbs_name || "Joueur",
                      bbs_name: row.bbs_name,
                      avatar: row.avatar,
                      guilde_id: row.guilde_id,
                    } as IUser}
                    avatarSize="sm"
                    textSize="sm"
                    spacing={2}
                    asLink={!highlight}
                  />
                  {highlight && isMe && <Badge colorScheme="purple" borderRadius="full" textTransform="none">{t("components.user.rivals.youBadge")}</Badge>}
                </HStack>
                {row.guild_name && <Text fontSize="xs" color="text.muted" ml="40px" noOfLines={1}>{row.guild_name}</Text>}
              </Box>
              <VStack spacing={0} align="end" flexShrink={0}>
                <Text fontWeight="bold" color={highlight ? "purple.200" : "text.strong"} _light={{ color: highlight ? "purple.700" : "text.strong" }} sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {(row.averageScore / 1000000).toFixed(2)}M
                </Text>
                {highlight ? (
                  <Text fontSize="xs" color="text.muted">{t("components.user.rivals.labelAvgScore")}</Text>
                ) : (
                  <HStack spacing={1} fontSize="xs" fontWeight="semibold" color={above ? "orange.300" : "green.300"} sx={{ fontVariantNumeric: "tabular-nums" }}>
                    <Icon as={above ? FiArrowUp : FiArrowDown} aria-hidden />
                    <Text>{t(above ? "components.user.rivals.aheadBy" : "components.user.rivals.behindBy", { gap: millions(gap) })}</Text>
                  </HStack>
                )}
              </VStack>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};
