import {
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useColorModeValue,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { CycleSelect } from "./CycleSelect";
import { CustomSelect } from "./CustomSelect";
import { UserSearchSelect } from "./UserSearchSelect";
import { ScoreBadge } from "./ScoreBadge";
import { getUserAvatarUrl } from "@/utils/discord";
import { useScores, useUserAccounts } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import type { ICycle, IGuild } from "../../interfaces";

interface TransferScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycles: ICycle[];
    guilds: IGuild[];
}

export const TransferScoreModal = ({ isOpen, onClose, cycles, guilds }: TransferScoreModalProps) => {
    const toast = useToast();
    const { transferScoreAccount } = useAPIMutations();
    // Roster global (tous comptes, toutes guildes confondues) — un joueur transféré de guilde en
    // cours de cycle doit rester trouvable comme compte source ou cible, quelle que soit sa
    // guilde actuelle.
    const { accounts: accountRoster } = useUserAccounts({ authenticated: true, limit: 1000, enabled: isOpen });

    const [selectedCycleId, setSelectedCycleId] = useState("");
    const [selectedRotationId, setSelectedRotationId] = useState(""); // _id Mongo de la rotation (CustomSelect)
    const [sourceBbsId, setSourceBbsId] = useState("");
    const [sourceSearchQuery, setSourceSearchQuery] = useState("");
    const [targetBbsId, setTargetBbsId] = useState("");
    const [targetSearchQuery, setTargetSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCycle = cycles.find((c) => c._id === selectedCycleId);
    const selectedRotation = selectedCycle?.rotations.find((r) => r._id === selectedRotationId);
    const sourceAccount = accountRoster.find((u) => u.bbs_id === sourceBbsId);
    const targetAccount = accountRoster.find((u) => u.bbs_id === targetBbsId);

    const { scores: sourceScores, isLoading: isLoadingScore, mutate: mutateSourceScores } = useScores({
        cycle_id: selectedCycleId || undefined,
        rotation_id: selectedRotation?.rotation_id || undefined,
        bbs_id: sourceBbsId || undefined,
        limit: 1,
        authenticated: true,
    });
    const sourceScore = sourceBbsId && selectedRotation ? sourceScores[0] : undefined;

    const canSubmit =
        !!sourceScore &&
        !!targetAccount &&
        targetBbsId !== sourceBbsId;

    const resetForm = () => {
        setSelectedCycleId("");
        setSelectedRotationId("");
        setSourceBbsId("");
        setSourceSearchQuery("");
        setTargetBbsId("");
        setTargetSearchQuery("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleTransfer = async () => {
        if (!sourceScore || !targetAccount) return;

        setIsSubmitting(true);
        try {
            // Endpoint dédié : contrairement à updateScore (PUT /:id), le compte cible n'a pas besoin
            // d'appartenir à la guilde actuelle du score — c'est tout l'intérêt du transfert (réattribuer
            // un score historique à un compte qui a depuis changé de guilde). guild_id ne bouge pas.
            await transferScoreAccount(sourceScore._id!, {
                target_user_id: targetAccount._id,
                target_bbs_id: targetAccount.bbs_id!,
            });
            toast({
                title: "Score transféré",
                description: `${sourceAccount?.bbs_name || "Ce score"} → ${targetAccount.bbs_name}`,
                status: "success",
                duration: 3000,
            });
            mutateSourceScores();
            handleClose();
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: "Erreur lors du transfert",
                description: err.message || "Le score n'a pas pu être transféré.",
                status: "error",
                duration: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Couleurs ─────────────────────────────────────────────────────────────
    const modalBg = "bg.card";
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const mutedText   = useColorModeValue("gray.500", "gray.400");
    const previewBg = "bg.muted";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" bg={modalBg} mx={4} overflow="hidden">
                <Box h="3px" bgGradient="linear(to-r, teal.400, cyan.400)" />

                <ModalHeader pb={1} pt={4}>
                    <HStack spacing={2}>
                        <Text>🔀</Text>
                        <Text>Transférer un score</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton top={4} />

                <ModalBody pb={4}>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" color={mutedText}>
                            Réattribue un score déjà saisi à un autre compte bbs (ex: saisi sous le mauvais
                            joueur du roster). Utile quand le compte visé n'est plus dans la guilde au moment
                            de la saisie.
                        </Text>

                        {/* ── Cycle + Rotation ───────────────────────────── */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Cycle</FormLabel>
                            <CycleSelect
                                cycles={cycles}
                                value={selectedCycleId}
                                onChange={(val) => { setSelectedCycleId(val); setSelectedRotationId(""); }}
                                placeholder="Sélectionner un cycle"
                                allowDeselect={false}
                                showActiveBadge={true}
                                size="md"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Rotation</FormLabel>
                            <CustomSelect
                                placeholder="Sélectionner une rotation"
                                value={selectedRotationId}
                                onChange={setSelectedRotationId}
                                isDisabled={!selectedCycle}
                                options={(selectedCycle?.rotations || [])
                                    .filter((r) => r._id)
                                    .map((r, i) => ({
                                        value: r._id as string,
                                        label: `#${i + 1} - ${r.killer} (${r.period})`,
                                    }))}
                                allowDeselect={false}
                                size="md"
                            />
                        </FormControl>

                        <Divider borderColor={borderColor} />

                        {/* ── Compte source ─────────────────────────────── */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Compte source (score actuel)</FormLabel>
                            <UserSearchSelect
                                users={accountRoster}
                                getItemId={(u) => u.bbs_id || ''}
                                selectedUserId={sourceBbsId}
                                onUserSelect={setSourceBbsId}
                                searchQuery={sourceSearchQuery}
                                onSearchChange={setSourceSearchQuery}
                                placeholder="Rechercher le compte qui porte le score…"
                                guilds={guilds}
                            />
                        </FormControl>

                        {/* ── État du score trouvé ──────────────────────── */}
                        {sourceBbsId && selectedRotation && (
                            isLoadingScore ? (
                                <HStack color={mutedText} fontSize="sm">
                                    <Spinner size="xs" />
                                    <Text>Recherche du score…</Text>
                                </HStack>
                            ) : sourceScore ? (
                                <Flex align="center" justify="space-between" bg={previewBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={3}>
                                    <HStack spacing={2}>
                                        <Avatar size="xs" src={sourceAccount ? getUserAvatarUrl(sourceAccount) ?? undefined : undefined} name={sourceAccount?.bbs_name} />
                                        <Text fontSize="sm">{sourceAccount?.bbs_name}</Text>
                                        {sourceScore.is_differential && <Badge colorScheme="purple" fontSize="2xs">différentiel</Badge>}
                                    </HStack>
                                    <ScoreBadge score={sourceScore.score} fontSize="sm" />
                                </Flex>
                            ) : (
                                <Text fontSize="sm" color="orange.400">
                                    Aucun score trouvé pour ce compte sur cette rotation.
                                </Text>
                            )
                        )}

                        <Divider borderColor={borderColor} />

                        {/* ── Compte cible ──────────────────────────────── */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Compte cible (à qui l'attribuer)</FormLabel>
                            <UserSearchSelect
                                users={accountRoster}
                                getItemId={(u) => u.bbs_id || ''}
                                selectedUserId={targetBbsId}
                                onUserSelect={setTargetBbsId}
                                searchQuery={targetSearchQuery}
                                onSearchChange={setTargetSearchQuery}
                                placeholder="Rechercher le compte destinataire…"
                                guilds={guilds}
                            />
                        </FormControl>

                        {targetBbsId && targetBbsId === sourceBbsId && (
                            <Text fontSize="sm" color="red.400">
                                Le compte cible doit être différent du compte source.
                            </Text>
                        )}

                        {/* ── Récapitulatif ──────────────────────────────── */}
                        {canSubmit && (
                            <Box bg={previewBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} borderLeftWidth="3px" borderLeftColor="teal.400" p={3}>
                                <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={2}>
                                    Récapitulatif
                                </Text>
                                <Flex align="center" justify="space-between" gap={2}>
                                    <HStack spacing={1} minW={0} flex={1}>
                                        <Text fontSize="sm" noOfLines={1}>{sourceAccount?.bbs_name}</Text>
                                    </HStack>
                                    <Text color={mutedText}>→</Text>
                                    <HStack spacing={1} minW={0} flex={1} justify="flex-end">
                                        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{targetAccount?.bbs_name}</Text>
                                    </HStack>
                                </Flex>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter borderTopWidth="1px" borderColor={borderColor} gap={2}>
                    <Button variant="ghost" borderRadius="lg" onClick={handleClose} size="sm">
                        Annuler
                    </Button>
                    <Button
                        colorScheme="teal"
                        borderRadius="lg"
                        size="sm"
                        onClick={handleTransfer}
                        isLoading={isSubmitting}
                        loadingText="Transfert…"
                        isDisabled={!canSubmit}
                    >
                        Transférer le score
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TransferScoreModal;
