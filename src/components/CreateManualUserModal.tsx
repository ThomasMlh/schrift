import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, Input, VStack, HStack, useToast, Text
} from "@chakra-ui/react";
import { useState } from "react";
import type { IGuild, Role } from "../interfaces";
import { useUserMutations } from "@/hooks/useAPIMutations";
import { CustomSelect } from "./ui/CustomSelect";

interface CreateManualUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    guilds: IGuild[];
    onUserCreated: () => void;
}

const CreateManualUserModal: React.FC<CreateManualUserModalProps> = ({ isOpen, onClose, guilds, onUserCreated }) => {
    const { createManualUser } = useUserMutations();
    const toast = useToast();
    const mutedLabel = "text.muted";

    const [form, setForm] = useState({ bbs_id: "", bbs_name: "", guilde_id: "", role: "membre" as Role });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetAndClose = () => {
        setForm({ bbs_id: "", bbs_name: "", guilde_id: "", role: "membre" });
        onClose();
    };

    const handleCreate = async () => {
        if (!form.bbs_id.trim()) return;
        setIsSubmitting(true);
        try {
            await createManualUser({
                bbs_id: form.bbs_id.trim(),
                bbs_name: form.bbs_name.trim() || undefined,
                guilde_id: form.guilde_id || undefined,
                role: form.role,
            });
            toast({ title: "Joueur créé avec succès", status: "success", duration: 3000 });
            onUserCreated();
            resetAndClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors de la création du joueur",
                status: "error",
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Créer un joueur sans Discord</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="xs" color={mutedLabel}>
                            À utiliser uniquement pour un joueur qui n'a pas de compte Discord.
                            Son compte bbs principal est créé en même temps, pour pouvoir lui
                            rattacher une guilde et saisir ses scores.
                        </Text>

                        <HStack spacing={2}>
                            <VStack flex={1} align="stretch" spacing={1}>
                                <Text fontSize="2xs" color={mutedLabel}>ID BBS *</Text>
                                <Input
                                    size="sm"
                                    placeholder="ID BBS"
                                    value={form.bbs_id}
                                    onChange={(e) => setForm(prev => ({ ...prev, bbs_id: e.target.value }))}
                                />
                            </VStack>
                            <VStack flex={1} align="stretch" spacing={1}>
                                <Text fontSize="2xs" color={mutedLabel}>Nom BBS</Text>
                                <Input
                                    size="sm"
                                    placeholder="Nom BBS"
                                    value={form.bbs_name}
                                    onChange={(e) => setForm(prev => ({ ...prev, bbs_name: e.target.value }))}
                                />
                            </VStack>
                        </HStack>

                        <HStack spacing={2}>
                            <VStack flex={1} align="stretch" spacing={1}>
                                <Text fontSize="2xs" color={mutedLabel}>Guilde</Text>
                                <CustomSelect
                                    placeholder="Aucune"
                                    value={form.guilde_id}
                                    onChange={(value) => setForm(prev => ({ ...prev, guilde_id: value }))}
                                    options={guilds.map((g) => ({ value: g._id, label: g.name }))}
                                    size="sm"
                                />
                            </VStack>
                            <VStack flex={1} align="stretch" spacing={1}>
                                <Text fontSize="2xs" color={mutedLabel}>Rôle</Text>
                                <CustomSelect
                                    value={form.role}
                                    onChange={(value) => setForm(prev => ({ ...prev, role: value as Role }))}
                                    options={[
                                        { value: "membre", label: "Membre" },
                                        { value: "sous-chef", label: "Sous-chef" },
                                        { value: "chef", label: "Chef" }
                                    ]}
                                    allowDeselect={false}
                                    size="sm"
                                />
                            </VStack>
                        </HStack>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={resetAndClose}>
                        Annuler
                    </Button>
                    <Button
                        colorScheme="purple"
                        isDisabled={!form.bbs_id.trim()}
                        isLoading={isSubmitting}
                        onClick={handleCreate}
                    >
                        Créer le joueur
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateManualUserModal;
