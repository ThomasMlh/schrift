import { HStack, VStack, Text, Avatar } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import type { IUser } from "@/interfaces";
import CustomLink from "./CustomLink";
import { formatRoleName } from "@/utils/user";
import { useAuth } from "@/providers/AuthProvider";

interface UserDisplayProps {
  user?: IUser;
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  spacing?: number;
  showUsername?: boolean;
  textSize?: "xs" | "sm" | "md" | "lg";
  roleBadge?: boolean;
  rainbowText?: boolean;
}

export const UserDisplay = ({
  user,
  avatarSize = "sm",
  spacing = 3,
  showUsername = false,
  roleBadge = false,
  rainbowText = false
}: UserDisplayProps) => {
  // Si pas d'utilisateur, afficher un fallback
  const { isLoggedIn } = useAuth();

  if (!user) {
    return (
      <HStack spacing={spacing}>
        <Avatar size={avatarSize} />
        <Text color="gray.500">Utilisateur inconnu</Text>
      </HStack>
    );
  }

  const avatarUrl =
    user.avatar && user.discord_id
      ? getUserAvatarUrl({
          discord_id: user.discord_id,
          avatar: user.avatar
        }) || undefined
      : undefined;

  return (
    <HStack spacing={spacing}>
      <Avatar
        size={avatarSize}
        src={avatarUrl}
        name={user.bbs_name || user.global_name}
      />
      <VStack spacing={0} align="start">
        <CustomLink
          to={isLoggedIn ? `/joueur/${user._id}` : "/"}
          text={user.bbs_name || user.global_name}
          sx={
            rainbowText
              ? {
                  bgGradient:
                    "linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                  backgroundSize: "300% 300%",
                  backgroundClip: "text",
                  animation: "rainbow 6s ease infinite",
                  fontWeight: "medium",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  "@keyframes rainbow": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" }
                  }
                }
              : undefined
          }
        />
        {showUsername && user.global_name && (
          <Text as="span" fontSize="xs" color="gray.500">
            {user.global_name}
          </Text>
        )}
      </VStack>
      {roleBadge && user.role && (
        <Text as="span" fontSize="xs" color="gray.500" ml={2}>
          [{formatRoleName(user.role)}]
        </Text>
      )}
    </HStack>
  );
};
