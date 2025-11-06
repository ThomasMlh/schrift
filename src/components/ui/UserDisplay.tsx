import { HStack, VStack, Text, Avatar } from "@chakra-ui/react";
import { getUserAvatarUrl } from "@/utils/discord";
import type { User } from "@/interfaces";
import CustomLink from "./CustomLink";

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
}: UserDisplayProps) => {
    const avatarUrl = user.avatar && user.discord_id
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
                name={user.global_name || user.username}
            />
            <VStack spacing={0} align="start">
                <CustomLink to={`/joueur/${user._id}`} text={user.global_name || user.username} />
                {showUsername && user.global_name && (
                    <Text fontSize="xs" color="gray.500">
                        @{user.username}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};