import { useEffect, useState, type ReactNode } from "react";
import { Avatar, Badge, Box, Flex, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IUser, ITopAchievement } from "@/interfaces";
import { formatRoleName } from "@/utils/user";
import { getDiscordBannerUrl, getUserAvatarUrl } from "@/utils/discord";
import { AvatarFrame } from "@/components/event/AvatarFrame";
import { TopAchievementBadge } from "@/components/achievements/TopAchievementBadge";

interface UserProfileHeaderProps {
  // User enriched with the viewed account (alt name, guild and role when relevant)
  user: IUser;
  // Rarest achievement of the viewed account
  topAchievement?: ITopAchievement | null;
  // Cycle selector, shown on the right
  cycleControl?: ReactNode;
  // Account switcher (alts), shown below the role
  accountSwitcher?: ReactNode;
  // Follow button, shown on the right next to the cycle selector
  followControl?: ReactNode;
  // Key figures, as a band across the bottom of the header
  stats?: ReactNode;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "chef":
      return "purple";
    case "sous-chef":
      return "blue";
    case "membre":
      return "green";
    default:
      return "gray";
  }
};

// Player page header: Discord banner (or gradient), avatar, name, top achievement, guild and role,
// with the cycle and account selectors.
export const UserProfileHeader = ({ user, topAchievement, cycleControl, accountSwitcher, followControl, stats }: UserProfileHeaderProps) => {
  const { t } = useTranslation();
  const bannerUrl = user.discord_id && user.banner ? getDiscordBannerUrl(user.discord_id, user.banner) : null;
  const avatarUrl = user.avatar && user.discord_id
    ? getUserAvatarUrl({ discord_id: user.discord_id, avatar: user.avatar }) || undefined
    : undefined;
  const displayName = user.bbs_name || user.global_name;
  const [bannerFailed, setBannerFailed] = useState(false);
  const hasBanner = Boolean(bannerUrl) && !bannerFailed;

  // New banner (other player or account): retry loading
  useEffect(() => setBannerFailed(false), [bannerUrl]);

  return (
    <Box
      bg="bg.card"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="2xl"
      boxShadow="md"
      overflow="hidden"
      mb={6}
    >
      {/* Taller strip when the Discord banner loads (600×240); otherwise a gradient band, including when the Discord image is gone (stale hash) */}
      <Box
        position="relative"
        h={hasBanner ? { base: "140px", sm: "180px", md: "240px" } : { base: "110px", md: "160px" }}
        bgGradient="linear(120deg, #44337a, purple.600 55%, blue.600)"
        transition="height 0.2s"
      >
        {bannerUrl && !bannerFailed && (
          <Image
            src={bannerUrl}
            alt=""
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            onError={() => setBannerFailed(true)}
          />
        )}
      </Box>

      <Flex
        px={{ base: 4, md: 6 }}
        pb={5}
        gap={4}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "flex-end" }}
      >
        <Flex gap={4} align="flex-end" minW={0}>
          <Box mt={{ base: -10, md: -16 }} flexShrink={0} borderRadius="full" lineHeight={0}>
            <AvatarFrame userId={user._id} thickness={4}>
              <Avatar
                size={{ base: "xl", md: "2xl" }}
                src={avatarUrl}
                name={displayName}
                borderWidth="4px"
                borderColor="bg.card"
              />
            </AvatarFrame>
          </Box>
          <VStack align="start" spacing={2} minW={0} pt={2}>
            <HStack spacing={2} minW={0}>
              <Text
                as="h1"
                fontSize={{ base: "xl", md: "3xl" }}
                fontWeight="extrabold"
                letterSpacing="tight"
                lineHeight="short"
                color="text.strong"
                noOfLines={1}
              >
                {displayName}
              </Text>
              <TopAchievementBadge achievement={topAchievement} size={26} />
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              {user.guilde_id ? (
                <Badge
                  colorScheme={getRoleBadgeColor(user.role || "membre")}
                  variant="subtle"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  textTransform="uppercase"
                >
                  {formatRoleName(user.role)} · {user.guild_name}
                </Badge>
              ) : (
                <Text fontSize="sm" color="text.muted">
                  {t("pages.user.noGuild")}
                </Text>
              )}
              {user.is_banned && (
                <Badge colorScheme="red" variant="solid" px={3} py={1} borderRadius="full" fontSize="xs" textTransform="uppercase">
                  {t("pages.user.badgeBanned")}
                </Badge>
              )}
              {accountSwitcher}
            </HStack>
          </VStack>
        </Flex>

        {(cycleControl || followControl) && (
          <Flex gap={3} align="flex-end" w={{ base: "100%", md: "auto" }} flexShrink={0}>
            {followControl && <Box flexShrink={0}>{followControl}</Box>}
            {cycleControl && <Box flex={1} w={{ md: "240px" }}>{cycleControl}</Box>}
          </Flex>
        )}
      </Flex>
      {stats}
    </Box>
  );
};
