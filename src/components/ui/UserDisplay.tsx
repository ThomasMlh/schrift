import { HStack, VStack, Text, Avatar, useColorModeValue } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import { Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { User } from "@/interfaces";

// Interface flexible pour l'affichage utilisateur (peut être un User complet ou partiel)
interface UserDisplayData {
    _id: string;
    username: string;
    global_name: string;
    avatar?: string | null;
    discord_id?: string;
    bbs_id?: string;
    bbs_name?: string;
}

interface UserDisplayProps {
    user: User | UserDisplayData;
    avatarSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    spacing?: number;
    showUsername?: boolean;
    textSize?: "xs" | "sm" | "md" | "lg";
}

export const UserDisplay = ({
    user,
    avatarSize = "sm",
    spacing = 3,
    showUsername = true,
    textSize = "sm"
}: UserDisplayProps) => {
    const avatarUrl = user.avatar && user.discord_id
        ? getUserAvatarUrl({
            discord_id: user.discord_id,
            avatar: user.avatar
        }) || undefined
        : undefined;

    const linkColor = useColorModeValue("black", "white");

    return (
        <HStack spacing={spacing}>
            <Avatar
                size={avatarSize}
                src={avatarUrl}
                name={user.global_name || user.username}
            />
            <VStack spacing={0} align="start">
                <Link as={RouterLink} to={`/user/${user._id}`} color={linkColor} _hover={{
                    textDecoration: "underline",
                    color: linkColor
                }}
                    _focus={{
                        outline: "1px solid",
                        outlineColor: linkColor,
                        outlineOffset: "2px"
                    }} fontWeight="medium" fontSize={textSize}>
                    {user.global_name || user.username}
                </Link>
                {showUsername && user.global_name && (
                    <Text fontSize="xs" color="gray.500">
                        @{user.username}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};