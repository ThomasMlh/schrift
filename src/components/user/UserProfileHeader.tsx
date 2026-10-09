import type { ReactNode } from "react";
import { Avatar, Badge, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IUser, ITopAchievement } from "@/interfaces";
import { formatRoleName } from "@/utils/user";
import { getDiscordBannerUrl, getUserAvatarUrl } from "@/utils/discord";
import { TopAchievementBadge } from "@/components/achievements/TopAchievementBadge";

interface UserProfileHeaderProps {
  // Utilisateur enrichi avec le compte consulté (pseudo, guilde et rôle de l'alt le cas échéant)
  user: IUser;
  // Succès le plus rare du compte consulté
  topAchievement?: ITopAchievement | null;
  // Choix du cycle, affiché à droite
  cycleControl?: ReactNode;
  // Sélecteur de compte (alts), affiché sous le rôle
  accountSwitcher?: ReactNode;
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

// En-tête de la page joueur : bannière Discord (ou dégradé) en bandeau, avatar, pseudo,
// meilleur succès, guilde et rôle, avec le choix du cycle et des comptes.
export const UserProfileHeader = ({ user, topAchievement, cycleControl, accountSwitcher }: UserProfileHeaderProps) => {
  const { t } = useTranslation();
  const bannerUrl = user.discord_id && user.banner ? getDiscordBannerUrl(user.discord_id, user.banner) : null;
  const avatarUrl = user.avatar && user.discord_id
    ? getUserAvatarUrl({ discord_id: user.discord_id, avatar: user.avatar }) || undefined
    : undefined;
  const displayName = user.bbs_name || user.global_name;

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
      {/* Bandeau */}
      <Box
        h={{ base: "90px", md: "120px" }}
        bgGradient="linear(to-r, purple.600, blue.500)"
        {...(bannerUrl && {
          backgroundImage: `url('${bannerUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        })}
      />

      <Flex
        px={{ base: 4, md: 6 }}
        pb={5}
        gap={4}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "flex-end" }}
      >
        <Flex gap={4} align="flex-end" minW={0}>
          <Avatar
            size={{ base: "xl", md: "2xl" }}
            src={avatarUrl}
            name={displayName}
            mt={{ base: -10, md: -14 }}
            borderWidth="4px"
            borderColor="bg.card"
            flexShrink={0}
          />
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
            </HStack>
            {accountSwitcher}
          </VStack>
        </Flex>

        {cycleControl && (
          <Box w={{ base: "100%", md: "260px" }} flexShrink={0}>
            {cycleControl}
          </Box>
        )}
      </Flex>
    </Box>
  );
};
