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
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { CycleSelect } from "./CycleSelect";
import { CustomSelect } from "./CustomSelect";
import { UserSearchSelect } from "./UserSearchSelect";
import { ScoreBadge } from "./ScoreBadge";
import { getUserAvatarUrl } from "@/utils/discord";
import type { IUser, ICycle } from "../../interfaces";

interface ScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: IUser[];
    cycles: ICycle[];
    selectedUserId: string;
    setSelectedUserId: (id: string) => void;
    selectedCycleId: string;
    setSelectedCycleId: (id: string) => void;
    selectedRotationId: string;
    setSelectedRotationId: (id: string) => void;
    scoreValue: number;
    setScoreValue: (value: number) => void;
    userSearchQuery: string;
    setUserSearchQuery: (query: string) => void;
    // Compte bbs qui a réellement produit le score édité — peut différer du compte bbs principal
    // actuel du user (score.user_id ne bouge pas quand un compte est transféré à un autre user,
    // cf. account transfer) : sans ça, le nom/lien affichés seraient ceux du mauvais compte.
    editingScoreBbsName?: string;
    editingScoreBbsId?: string;
    onSubmit: () => void;
    isSubmitting: boolean;
    isLoadingCycles: boolean;
    title: string;
    submitButtonText: string;
    submitButtonColor?: string;
    isEdit?: boolean;
}

export const ScoreModal = ({
    isOpen,
    onClose,
    users,
    cycles,
    selectedUserId,
    setSelectedUserId,
    selectedCycleId,
    setSelectedCycleId,
    selectedRotationId,
    setSelectedRotationId,
    scoreValue,
    setScoreValue,
    userSearchQuery,
    setUserSearchQuery,
    editingScoreBbsName,
    editingScoreBbsId,
    onSubmit,
    isSubmitting,
    isLoadingCycles,
    title,
    submitButtonText,
    submitButtonColor = "blue",
    isEdit = false,
}: ScoreModalProps) => {
    // ── Données dérivées ─────────────────────────────────────────────────────
    const selectedCycle    = cycles.find((c) => c._id === selectedCycleId);
    const foundUser        = users.find((u) => u._id === selectedUserId);
    const selectedUser     = foundUser && isEdit && editingScoreBbsName
        ? { ...foundUser, bbs_name: editingScoreBbsName, bbs_id: editingScoreBbsId || foundUser.bbs_id }
        : foundUser;
    const selectedRotation = selectedCycle?.rotations.find(
        (r) => (r._id ?? r.rotation_id) === selectedRotationId
    );

    const canSubmit =
        !!selectedUserId &&
        !!selectedCycleId &&
        !!selectedRotationId &&
        scoreValue >= 0;

    // ── Formatage ────────────────────────────────────────────────────────────
    const formatNumber = (value: string | number): string => {
        const num = typeof value === "string" ? parseFloat(value) || 0 : value;
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    const parseNumber = (value: string): string => value.replace(/,/g, "");

    const handleClose = () => {
        setSelectedCycleId("");
        setSelectedRotationId("");
        setSelectedUserId("");
        setUserSearchQuery("");
        setScoreValue(0);
        onClose();
    };

    // ── Couleurs ─────────────────────────────────────────────────────────────
    const modalBg = "bg.card";
    const borderColor = "border.subtle";
    const mutedText     = useColorModeValue("gray.500", "gray.400");
    const lockedBg = "bg.muted";
    const previewBg = "bg.muted";
    const accentColor   = isEdit ? "orange" : submitButtonColor;
    const avatarUrl     = selectedUser
        ? getUserAvatarUrl(selectedUser) ?? undefined
        : undefined;

    // Label de la rotation
    const rotationLabel = selectedRotation
        ? `#${selectedRotation.position} — ${selectedRotation.killer}`
        : null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" bg={modalBg} mx={4} overflow="hidden">

                {/* Barre accent */}
                <Box
                    h="3px"
                    bgGradient={
                        isEdit
                            ? "linear(to-r, orange.400, yellow.400)"
                            : "linear(to-r, blue.400, purple.400)"
                    }
                />

                <ModalHeader pb={1} pt={4}>
                    <HStack spacing={2}>
                        <Text>{isEdit ? "✏️" : "➕"}</Text>
                        <Text>{title}</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton top={4} />

                <ModalBody pb={4}>
                    <VStack spacing={4} align="stretch">

                        {/* ── Joueur ─────────────────────────────────────── */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Joueur</FormLabel>
                            {isEdit && selectedUser ? (
                                <Flex
                                    align="center"
                                    gap={3}
                                    p={3}
                                    bg={lockedBg}
                                    borderRadius="xl"
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                >
                                    <Avatar
                                        size="sm"
                                        src={avatarUrl}
                                        name={selectedUser.bbs_name || selectedUser.global_name}
                                    />
                                    <Box flex={1} minW={0}>
                                        <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                                            {selectedUser.bbs_name || selectedUser.global_name}
                                        </Text>
                                        {selectedUser.global_name && selectedUser.bbs_name && (
                                            <Text fontSize="xs" color={mutedText} noOfLines={1}>
                                                {selectedUser.global_name}
                                            </Text>
                                        )}
                                    </Box>
                                    <LockIcon boxSize={3} color={mutedText} />
                                </Flex>
                            ) : (
                                <UserSearchSelect
                                    users={users}
                                    selectedUserId={selectedUserId}
                                    onUserSelect={setSelectedUserId}
                                    searchQuery={userSearchQuery}
                                    onSearchChange={setUserSearchQuery}
                                    placeholder="Rechercher un joueur…"
                                />
                            )}
                        </FormControl>

                        {/* ── Cycle + Rotation ───────────────────────────── */}
                        <Box
                            bg={isEdit ? lockedBg : undefined}
                            borderRadius={isEdit ? "lg" : undefined}
                            borderWidth={isEdit ? "1px" : undefined}
                            borderColor={isEdit ? borderColor : undefined}
                            p={isEdit ? 3 : 0}
                        >
                            {isEdit && (
                                <HStack spacing={1} mb={3}>
                                    <LockIcon boxSize={2.5} color={mutedText} />
                                    <Text fontSize="2xs" color={mutedText} textTransform="uppercase" letterSpacing="wide" fontWeight="semibold">
                                        Contexte verrouillé
                                    </Text>
                                </HStack>
                            )}
                            <VStack spacing={3} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Cycle</FormLabel>
                                    {isEdit && selectedCycle ? (
                                        <Flex align="center" justify="space-between">
                                            <Text fontSize="sm" fontWeight="medium">{selectedCycle.name}</Text>
                                            {selectedCycle.year && (
                                                <Badge colorScheme="purple" fontSize="xs">{selectedCycle.year}</Badge>
                                            )}
                                        </Flex>
                                    ) : (
                                        <CycleSelect
                                            cycles={cycles}
                                            value={selectedCycleId}
                                            onChange={(val) => { setSelectedCycleId(val); setSelectedRotationId(""); }}
                                            placeholder="Sélectionner un cycle"
                                            isDisabled={isLoadingCycles}
                                            allowDeselect={false}
                                            showActiveBadge={true}
                                            size="md"
                                        />
                                    )}
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Rotation</FormLabel>
                                    {isEdit && selectedRotation ? (
                                        <HStack spacing={2}>
                                            <Text fontSize="sm" fontWeight="medium">{rotationLabel}</Text>
                                            {selectedRotation.period && (
                                                <Badge colorScheme="blue" fontSize="xs">{selectedRotation.period}</Badge>
                                            )}
                                        </HStack>
                                    ) : (
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
                                    )}
                                </FormControl>
                            </VStack>
                        </Box>

                        <Divider borderColor={borderColor} />

                        {/* ── Score ──────────────────────────────────────── */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color={mutedText} mb={1.5}>Score</FormLabel>
                            <NumberInput
                                value={scoreValue}
                                onChange={(_, val) => setScoreValue(val || 0)}
                                min={0}
                                max={9_999_999_999}
                                step={1000}
                                format={formatNumber}
                                parse={parseNumber}
                                size="lg"
                            >
                                <NumberInputField
                                    placeholder="0"
                                    textAlign="center"
                                    fontSize="xl"
                                    fontWeight="bold"
                                    letterSpacing="wide"
                                    borderRadius="lg"
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        {/* ── Prévisualisation ───────────────────────────── */}
                        {canSubmit && (
                            <Box
                                bg={previewBg}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={borderColor}
                                borderLeftWidth="3px"
                                borderLeftColor={`${accentColor}.400`}
                                p={3}
                            >
                                <Text
                                    fontSize="2xs"
                                    fontWeight="semibold"
                                    textTransform="uppercase"
                                    letterSpacing="wide"
                                    color={mutedText}
                                    mb={2}
                                >
                                    {isEdit ? "Modification" : "Récapitulatif"}
                                </Text>
                                <Flex align="center" justify="space-between" gap={3}>
                                    <HStack spacing={2} minW={0} flex={1}>
                                        <Avatar
                                            size="xs"
                                            src={avatarUrl}
                                            name={selectedUser?.bbs_name || selectedUser?.global_name}
                                        />
                                        <VStack spacing={0} align="start" minW={0}>
                                            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                                                {selectedUser?.bbs_name || selectedUser?.global_name}
                                            </Text>
                                            {rotationLabel && (
                                                <Text fontSize="xs" color={mutedText} noOfLines={1}>
                                                    {rotationLabel}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                    <ScoreBadge score={scoreValue} fontSize="md" />
                                </Flex>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter
                    borderTopWidth="1px"
                    borderColor={borderColor}
                    gap={2}
                >
                    <Button variant="ghost" borderRadius="lg" onClick={handleClose} size="sm">
                        Annuler
                    </Button>
                    <Button
                        colorScheme={accentColor}
                        borderRadius="lg"
                        size="sm"
                        onClick={onSubmit}
                        isLoading={isSubmitting}
                        loadingText={isEdit ? "Modification…" : "Ajout…"}
                        isDisabled={!canSubmit}
                    >
                        {submitButtonText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
