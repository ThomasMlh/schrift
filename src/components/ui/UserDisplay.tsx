import { VStack, Text, Avatar, Stack } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import type { IUser } from "@/interfaces";
import CustomLink from "./CustomLink";
import { formatRoleName } from "@/utils/user";

interface UserDisplayProps {
  user?: IUser;
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  spacing?: number;
  showUsername?: boolean;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  roleBadge?: boolean;
  rainbowText?: boolean;
  direction?: "row" | "column";
}

export const UserDisplay = ({
  user,
  avatarSize = "sm",
  spacing = 3,
  showUsername = false,
  roleBadge = false,
  rainbowText = false,
  textSize = "md",
  direction = "row"
}: UserDisplayProps) => {

  if (!user) {
    return (
      <Stack direction={direction} spacing={spacing} fontSize={textSize}>
        <Avatar size={avatarSize} />
        <Text color="gray.500">Utilisateur inconnu</Text>
      </Stack>
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
    <Stack direction={direction} justify={direction === "row" ? "flex-start" : "center"} align="center" spacing={spacing}>
      <Avatar
        size={avatarSize}
        src={avatarUrl}
        name={user.bbs_name || user.global_name}
      />
      <VStack spacing={0} align={direction === "row" ? "start" : "center"}>
        <CustomLink
          to={`/joueur/${user._id}`}
          text={user.bbs_name || user.global_name}
          textSize={textSize}
          requireAuth={true}
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
        <Text as="span" fontSize="xs" color="gray.500" ml={direction === "row" ? 2 : 0}>
          [{formatRoleName(user.role)}]
        </Text>
      )}
    </Stack>
  );
};
