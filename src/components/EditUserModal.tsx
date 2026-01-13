import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, Select, VStack, useToast, HStack, Avatar, Text
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import type { IUser, IGuild, Role } from "../interfaces";
import { getUserAvatarUrl } from "../utils/discord";
import { useAuth } from "@/providers/AuthProvider";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
    guilds: IGuild[];
    onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, guilds, onUserUpdated }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        bbs_id: "",
        bbs_name: "",
        guilde_id: "",
        role: "" as Role
    });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Initialiser le formulaire avec les données de l'utilisateur
    useEffect(() => {
        if (user) {
            setFormData({
                bbs_id: user.bbs_id || "",
                bbs_name: user.bbs_name || "",
                guilde_id: user.guilde_id || "",
                role: user.role || "membre"
            });
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/users/${user._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Utilisateur modifié avec succès",
                    status: "success",
                    duration: 3000
                });
                onUserUpdated();
                onClose();
            } else {
                throw new Error(data.message || "Erreur lors de la modification de l'utilisateur");
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors de la modification de l'utilisateur",
                status: "error",
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            bbs_id: "",
            bbs_name: "",
            guilde_id: "",
            role: "membre"
        });
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={3}>
                        <Avatar
                            size="sm"
                            src={getUserAvatarUrl(user) || undefined}
                            name={user.global_name || user.username}
                        />
                        <VStack spacing={0} align="start">
                            <Text>Modifier l'utilisateur</Text>
                            <Text fontSize="sm" color="gray.500">
                                {user.global_name || user.username} (@{user.username})
                            </Text>
                        </VStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>ID BBS</FormLabel>
                            <Input
                                placeholder="Ex: 123456"
                                value={formData.bbs_id}
                                onChange={(e) => handleInputChange('bbs_id', e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Nom BBS</FormLabel>
                            <Input
                                placeholder="Ex: NomJoueur"
                                value={formData.bbs_name}
                                onChange={(e) => handleInputChange('bbs_name', e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Guilde</FormLabel>
                            <Select
                                placeholder="Sélectionner une guilde"
                                value={formData.guilde_id}
                                onChange={(e) => handleInputChange('guilde_id', e.target.value)}
                            >
                                {guilds.map((guild) => (
                                    <option key={guild._id} value={guild._id}>
                                        {guild.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Rôle</FormLabel>
                            <Select
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value as Role)}
                            >
                                <option value="membre">Membre</option>
                                <option value="sous-chef">Sous-chef</option>
                                <option value="chef">Chef</option>
                            </Select>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        loadingText="Modification..."
                    >
                        Modifier
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditUserModal;