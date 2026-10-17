import { Avatar, Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IUser } from "@/interfaces";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { useAuth } from "@/providers/AuthProvider";
import { TopAchievementBadge } from "@/components/achievements/TopAchievementBadge";

interface PlayerGridCardProps {
  // A bbs account (public list: one card per account, with its guild and role)
  player: IUser;
  guildName?: string;
}

const ROLE_COLORS: Record<string, string> = {
  chef: "purple",
  "sous-chef": "blue",
  membre: "green",
};

const ROLE_LABEL_KEYS: Record<string, string> = {
  chef: "components.guildTabsList.roleChef",
  "sous-chef": "components.guildTabsList.roleSousChef",
  membre: "components.guildTabsList.roleMembre",
};

// Public player list card: avatar, name, top achievement, guild and role. Fully clickable to the
// profile when logged in (profiles require an account).
export const PlayerGridCard = ({ player, guildName }: PlayerGridCardProps) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const url = isLoggedIn ? buildPlayerUrl(player.bbs_name, player.bbs_id) : undefined;
  const displayName = player.bbs_name || player.global_name;
  const avatarUrl = player.avatar && player.discord_id
    ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined
    : undefined;

  return (
    <Box
      {...(url && { as: Link, to: url, role: "group" })}
      display="block"
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      p={4}
      opacity={player.is_banned ? 0.5 : 1}
      transition="border-color 0.15s, transform 0.15s"
      _hover={url ? { borderColor: "purple.400", transform: "translateY(-2px)" } : undefined}
    >
      <HStack spacing={3} align="center">
        <Avatar size="md" src={avatarUrl} name={displayName} flexShrink={0} />
        <VStack align="start" spacing={1.5} minW={0} flex={1}>
          <HStack spacing={1.5} maxW="100%" minW={0}>
            <Text fontWeight="bold" color="text.strong" noOfLines={1} _groupHover={{ color: "purple.300" }}>
              {displayName}
            </Text>
            <TopAchievementBadge achievement={player.top_achievement} size={18} />
          </HStack>
          <HStack spacing={1.5} flexWrap="wrap">
            <Badge variant="subtle" colorScheme="gray" borderRadius="full" px={2} fontSize="2xs">
              {guildName ? `Schrift ${guildName}` : t("pages.user.noGuild")}
            </Badge>
            {player.role && ROLE_LABEL_KEYS[player.role] && (
              <Badge variant="subtle" colorScheme={ROLE_COLORS[player.role]} borderRadius="full" px={2} fontSize="2xs">
                {t(ROLE_LABEL_KEYS[player.role])}
              </Badge>
            )}
            {player.is_banned && (
              <Badge colorScheme="red" borderRadius="full" px={2} fontSize="2xs">
                {t("components.usersTable.badgeBanned")}
              </Badge>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
