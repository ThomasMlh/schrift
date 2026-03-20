import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, VStack, useToast, HStack, Avatar, Text, Textarea, FormControl, FormLabel,
    Alert, AlertIcon, Badge
} from "@chakra-ui/react";
import { useState } from "react";
import type { IUser } from "../interfaces";
import { getUserAvatarUrl } from "../utils/discord";
import { useAPIMutations } from "@/hooks/useAPIMutations";

interface BanUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
    onUserUpdated: () => void;
}

const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { banUser } = useAPIMutations();

    const handleBan = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            await banUser(user._id, reason.trim() || undefined);
            toast({
                title: "Utilisateur banni",
                description: `${user.global_name || user.username} a été banni avec succès.`,
                status: "success",
                duration: 3000,
            });
            onUserUpdated();
            handleClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors du bannissement",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setReason("");
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="red.500">Bannir un utilisateur</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="warning" borderRadius="md">
                            <AlertIcon />
                            <Text fontSize="sm">
                                Cette action empêchera l'utilisateur de se connecter au site.
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
                            {user.is_banned && (
                                <Badge colorScheme="red" ml="auto">Déjà banni</Badge>
                            )}
                        </HStack>

                        {user.ban_reason && (
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium">Raison du bannissement précédent :</Text>
                                    <Text fontSize="sm">{user.ban_reason}</Text>
                                </VStack>
                            </Alert>
                        )}

                        <FormControl>
                            <FormLabel>Raison du bannissement (optionnel)</FormLabel>
                            <Textarea
                                placeholder="Ex: Comportement inapproprié, triche..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleBan}
                        isLoading={isLoading}
                    >
                        Confirmer le bannissement
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BanUserModal;
