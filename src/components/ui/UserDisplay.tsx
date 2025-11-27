import { HStack, VStack, Text, Avatar } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import type { IUser } from "@/interfaces";
import CustomLink from "./CustomLink";
import { formatRoleName } from "@/utils/user";

interface UserDisplayProps {
  user?: IUser;
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  spacing?: number;
  showUsername?: boolean;
  textSize?: "xs" | "sm" | "md" | "lg";
  roleBadge?: boolean;
}

export const UserDisplay = ({
  user,
  avatarSize = "sm",
  spacing = 3,
  showUsername = true,
  roleBadge = false
}: UserDisplayProps) => {
  // Si pas d'utilisateur, afficher un fallback
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
          to={`/joueur/${user._id}`}
          text={user.bbs_name || user.global_name}
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
