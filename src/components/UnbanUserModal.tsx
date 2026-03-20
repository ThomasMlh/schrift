import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, VStack, useToast, HStack, Avatar, Text, Alert, AlertIcon
} from "@chakra-ui/react";
import { useState } from "react";
import type { IUser } from "../interfaces";
import { getUserAvatarUrl } from "../utils/discord";
import { useAPIMutations } from "@/hooks/useAPIMutations";

interface UnbanUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
    onUserUpdated: () => void;
}

const UnbanUserModal: React.FC<UnbanUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { unbanUser } = useAPIMutations();

    const handleUnban = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            await unbanUser(user._id);
            toast({
                title: "Utilisateur débanni",
                description: `${user.global_name || user.username} a été débanni avec succès.`,
                status: "success",
                duration: 3000,
            });
            onUserUpdated();
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors du débannissement",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="green.500">Débannir un utilisateur</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Text fontSize="sm">
                                Cette action permettra à l'utilisateur de se reconnecter au site.
                            </Text>
                        </Alert>

                        <HStack spacing={3} p={3} bg="gray.50" borderRadius="md" _dark={{ bg: "gray.700" }}>
                            <Avatar
                                size="md"
                                src={getUserAvatarUrl(user) || undefined}
                                name={user.global_name || user.username}
                            />
                            <VStack spacing={0} align="start">
                                <Text fontWeight="bold">{user.global_name || user.username}</Text>
                                <Text fontSize="sm" color="gray.500">@{user.username}</Text>
                                {user.discord_id && (
                                    <Text fontSize="xs" color="gray.400">ID: {user.discord_id}</Text>
                                )}
                            </VStack>
                        </HStack>

                        {user.ban_reason && (
                            <Alert status="warning" borderRadius="md">
                                <AlertIcon />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium">Raison du bannissement :</Text>
                                    <Text fontSize="sm">{user.ban_reason}</Text>
                                </VStack>
                            </Alert>
                        )}

                        {user.banned_at && (
                            <Text fontSize="sm" color="gray.500">
                                Banni le {new Date(user.banned_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Annuler
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={handleUnban}
                        isLoading={isLoading}
                    >
                        Confirmer le débannissement
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UnbanUserModal;
