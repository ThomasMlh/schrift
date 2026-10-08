import { Badge, Box, Card, CardBody, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IUser } from "@/interfaces";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { formatRoleName } from "@/utils/user";
import { getDiscordBannerUrl } from "@/utils/discord";

interface UserProfileHeaderProps {
  // Utilisateur enrichi avec le compte consulté (pseudo, guilde et rôle de l'alt le cas échéant)
  user: IUser;
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

// En-tête de la page joueur : bannière Discord (ou dégradé), avatar, guilde et rôle
export const UserProfileHeader = ({ user }: UserProfileHeaderProps) => {
  const { t } = useTranslation();
  const bannerUrl = user.discord_id && user.banner ? getDiscordBannerUrl(user.discord_id, user.banner) : null;
  const gradientBg = useColorModeValue(
    "linear(to-br, blue.50, purple.50)",
    "linear(to-br, gray.800, purple.900)"
  );

  return (
    <Card
      bgGradient={gradientBg}
      {...(bannerUrl && {
        backgroundImage: `url('${bannerUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      })}
      borderRadius="2xl"
      boxShadow="2xl"
      mb={6}
      overflow="hidden"
      position="relative"
    >
      {/* Overlay sombre pour la lisibilité (uniquement si bannière) */}
      {bannerUrl && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={0}
        />
      )}
      {!bannerUrl && (
        <Box
          position="absolute"
          top={0}
          right={0}
          width="300px"
          height="300px"
          opacity={0.1}
        />
      )}
      <CardBody py={8}>
        <VStack 
          spacing={4} 
          align="center" 
          position="relative" 
          zIndex={1}
          {...(bannerUrl && {
            sx: {
              "& *": {
                color: "white !important"
              }
            }
          })}
        >
          <UserDisplay
            user={user}
            avatarSize="2xl"
            direction="column"
            textSize="2xl"
            spacing={4}
            asLink={false}
          />

          <VStack spacing={2} textAlign="center">
            {user.guilde_id ? (
              <HStack spacing={2}>
                <Badge
                  colorScheme={getRoleBadgeColor(user.role || "membre")}
                  variant="solid"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="md"
                  textTransform="uppercase"
                >
                  {formatRoleName(user.role)} {user.guild_name}
                </Badge>
              </HStack>
            ) : (
              <Text fontSize="md" color={bannerUrl ? "whiteAlpha.800" : "gray.500"}>
                {t("pages.user.noGuild")}
              </Text>
            )}
            {user.is_banned && (
              <Badge
                colorScheme="red"
                variant="solid"
                px={4}
                py={1}
                borderRadius="full"
                fontSize="sm"
                textTransform="uppercase"
              >
                {t("pages.user.badgeBanned")}
              </Badge>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
