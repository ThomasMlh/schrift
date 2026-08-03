import {
  Box,
  Text,
  HStack,
  VStack,
  Avatar,
  Skeleton,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { useGuildTopMembers } from "@/hooks/useAPI";
import { getUserAvatarUrl } from "@/utils/discord";
import { useTranslation } from "react-i18next";

const MEDALS = ["🥇", "🥈", "🥉"];

const formatScore = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString("fr-FR");
};

interface GuildTopMembersProps {
  guildId: string;
  cycleId?: string;
}

export const GuildTopMembers = ({ guildId, cycleId }: GuildTopMembersProps) => {
  const { topMembers, isLoading } = useGuildTopMembers(guildId, cycleId, 3);
  const { t } = useTranslation();

  const bg = useColorModeValue("white", "rgba(26,32,44,0.7)");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const countColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const subText = useColorModeValue("gray.500", "whiteAlpha.600");
  const firstPlaceBg = useColorModeValue("yellow.50", "rgba(214,158,46,0.1)");

  return (
    <Box bg={bg} borderRadius="xl" borderWidth="1px" borderColor={border} p={4} boxShadow="sm">
      <Text
        fontSize="xs" fontWeight="semibold" textTransform="uppercase"
        letterSpacing="wider" color={countColor} mb={3}
      >
        {t("pages.guilds.topMembersTitle")}
      </Text>

      {isLoading ? (
        <VStack spacing={2}>
          {[0, 1, 2].map(i => <Skeleton key={i} h="48px" borderRadius="lg" />)}
        </VStack>
      ) : topMembers.length === 0 ? (
        <Flex justify="center" align="center" h="80px">
          <Text fontSize="sm" color={subText}>{t("pages.guilds.topMembersNoData")}</Text>
        </Flex>
      ) : (
        <VStack spacing={2} align="stretch">
          {topMembers.map((member, index) => {
            const avatarUrl = getUserAvatarUrl(
              { discord_id: member.discord_id, avatar: member.avatar }, 64
            ) || undefined;

            return (
              <HStack
                key={member.bbsId || member.userId}
                spacing={3}
                p={2}
                borderRadius="lg"
                bg={index === 0 ? firstPlaceBg : "transparent"}
              >
                <Text fontSize="lg" w="24px" textAlign="center">{MEDALS[index]}</Text>
                <Avatar size="sm" src={avatarUrl} name={member.bbs_name || member.username} />
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1} flex={1} minW={0}>{member.bbs_name}</Text>
                <Text fontSize="sm" fontWeight="bold">{formatScore(member.bestScore)}</Text>
              </HStack>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
