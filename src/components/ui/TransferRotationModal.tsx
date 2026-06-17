import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Button,
    VStack,
    HStack,
    Text,
    FormControl,
    FormLabel,
    Box,
    Spinner,
    Center,
    useColorMode,
    Badge,
    Flex,
    Alert,
    AlertIcon,
    Avatar,
    useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import type { ICycle, IGuild, ICycleRotation, IUser } from "../../interfaces";
import { CycleSelect } from "./CycleSelect";
import { CustomSelect } from "./CustomSelect";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { useAPIMutations } from "@/hooks/useAPIMutations";

interface TransferConflict {
    user_id: string;
    user?: Pick<IUser, 'global_name' | 'bbs_name' | 'discord_id' | 'avatar'>;
    existing_raw_score?: number;
}

interface TransferPreviewItem {
    user_id: string;
    user?: Pick<IUser, 'global_name' | 'bbs_name' | 'discord_id' | 'avatar'>;
    raw_score?: number;
}

interface TransferPreviewResult {
    preview?: TransferPreviewItem[];
    conflicts?: TransferConflict[];
    message?: string;
}

interface TransferRotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycles: ICycle[];
    guilds: IGuild[];
}

const AVATAR_BASE = "https://cdn.discordapp.com/avatars";

const userAvatarUrl = (user: Pick<IUser, 'avatar' | 'discord_id'> | null | undefined) =>
    user?.avatar && user?.discord_id
        ? `${AVATAR_BASE}/${user.discord_id}/${user.avatar}.png?size=64`
        : undefined;

const TransferRotationModal = ({ isOpen, onClose, cycles, guilds }: TransferRotationModalProps) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const toast = useToast();
    const { transferRotation } = useAPIMutations();

    // ── Form state ───────────────────────────────────────────────────────────
    const [selectedCycleId, setSelectedCycleId] = useState("");
    const [sourceRotationId, setSourceRotationId] = useState("");
    const [targetRotationId, setTargetRotationId] = useState("");
    const [selectedGuildId, setSelectedGuildId] = useState("");

    // ── Preview state ────────────────────────────────────────────────────────
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<TransferPreviewResult | null>(null);
    const [previewConflicts, setPreviewConflicts] = useState<TransferConflict[] | null>(null);
    const [previewGenericError, setPreviewGenericError] = useState<string | null>(null);

    // ── Transfer state ───────────────────────────────────────────────────────
    const [isTransferring, setIsTransferring] = useState(false);

    // ── Derived ─────────────────────────────────────────────────────────────
    const selectedCycle = cycles.find(c => c._id === selectedCycleId);
    const sourceRotation = selectedCycle?.rotations.find(r => r.rotation_id === sourceRotationId);
    const targetRotation = selectedCycle?.rotations.find(r => r.rotation_id === targetRotationId);

    // Reset enfant quand le cycle change
    useEffect(() => {
        setSourceRotationId("");
        setTargetRotationId("");
        setPreview(null);
        setPreviewConflicts(null);
        setPreviewGenericError(null);
    }, [selectedCycleId]);

    // Reset target + preview quand la source change
    useEffect(() => {
        setTargetRotationId("");
        setPreview(null);
        setPreviewConflicts(null);
        setPreviewGenericError(null);
    }, [sourceRotationId]);

    // Efface le preview quand les sélections changent
    useEffect(() => {
        setPreview(null);
        setPreviewConflicts(null);
        setPreviewGenericError(null);
    }, [targetRotationId, selectedGuildId]);

    // Auto-fetch dry_run dès que les 3 champs sont remplis
    useEffect(() => {
        if (!selectedCycleId || !sourceRotationId || !targetRotationId) return;

        let cancelled = false;

        const fetchPreview = async () => {
            setIsPreviewLoading(true);
            setPreview(null);
            setPreviewConflicts(null);
            setPreviewGenericError(null);

            try {
                const result = await transferRotation({
                    cycle_id: selectedCycleId,
                    source_rotation_id: sourceRotationId,
                    target_rotation_id: targetRotationId,
                    guild_id: selectedGuildId || undefined,
                    dry_run: true
                });
                if (!cancelled) {
                    setPreview(result);
                    // Les conflits sont maintenant des warnings (écrasement), pas des blockers
                    if (result.conflicts?.length > 0) {
                        setPreviewConflicts(result.conflicts);
                    }
                }
            } catch (err: unknown) {
                if (cancelled) return;
                const e = err as Error & { data?: { message?: string } };
                setPreviewGenericError(e.data?.message || e.message);
            } finally {
                if (!cancelled) setIsPreviewLoading(false);
            }
        };

        fetchPreview();
        return () => { cancelled = true; };
    }, [selectedCycleId, sourceRotationId, targetRotationId, selectedGuildId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleTransfer = async () => {
        if (!preview) return;

        setIsTransferring(true);
        try {
            const result = await transferRotation({
                cycle_id: selectedCycleId,
                source_rotation_id: sourceRotationId,
                target_rotation_id: targetRotationId,
                guild_id: selectedGuildId || undefined,
                dry_run: false
            });

            toast({
                title: "Transfert réussi ✓",
                description: result.message,
                status: "success",
                duration: 6000,
                isClosable: true
            });
            handleClose();
        } catch (err: unknown) {
            toast({
                title: "Erreur lors du transfert",
                description: (err as Error).message,
                status: "error",
                duration: 5000,
                isClosable: true
            });
        } finally {
            setIsTransferring(false);
        }
    };

    const handleClose = () => {
        setSelectedCycleId("");
        setSourceRotationId("");
        setTargetRotationId("");
        setSelectedGuildId("");
        setPreview(null);
        setPreviewConflicts(null);
        setPreviewGenericError(null);
        onClose();
    };

    // ── Couleurs ─────────────────────────────────────────────────────────────
    const modalBg      = isDark ? "#1a1b2e" : "white";
    const sectionBg    = isDark ? "rgba(234,88,12,0.08)"  : "orange.50";
    const sectionBorder = isDark ? "rgba(234,88,12,0.25)" : "orange.200";
    const rowConflictBg = isDark ? "rgba(239,68,68,0.08)" : "red.50";
    const rowConflictBorder = isDark ? "red.700" : "red.200";
    const rowOkBg     = isDark ? "rgba(34,197,94,0.06)"   : "green.50";
    const rowOkBorder = isDark ? "green.700"              : "green.200";

    // ── Options pour les selects ──────────────────────────────────────────────
    const makeRotationOptions = (rotations: ICycleRotation[], excludeId?: string) =>
        rotations
            .filter(r => r.rotation_id !== excludeId)
            .map(r => ({
                value: r.rotation_id,
                label: `Rotation #${r.position} — ${r.killer}`,
                content: (
                    <VStack align="start" spacing={0.5} w="100%">
                        <HStack spacing={2}>
                            <Text fontWeight="medium">Rotation #{r.position} — {r.killer}</Text>
                            <AttackTypeBadge attackType={r.attack} />
                        </HStack>
                        <Text fontSize="xs" color="gray.500">{r.start_date} — {r.end_date}</Text>
                    </VStack>
                )
            }));

    // Les conflits sont des warnings (écrasement autorisé), pas des blockers
    const canTransfer = !!preview && !previewGenericError && !isPreviewLoading && (preview.scoreCount ?? 0) > 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.700" />
            <ModalContent bg={modalBg} borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={sectionBorder}>

                {/* Barre accent */}
                <Box h="3px" bgGradient="linear(to-r, #EA580C, #F59E0B)" />

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <ModalHeader px={6} pt={5} pb={4} borderBottom="1px solid" borderColor={sectionBorder}>
                    <HStack spacing={3}>
                        <Box
                            w={9} h={9} borderRadius="xl" flexShrink={0}
                            bgGradient="linear(135deg, #EA580C, #F59E0B)"
                            display="flex" alignItems="center" justifyContent="center" fontSize="lg"
                        >
                            🔄
                        </Box>
                        <Box>
                            <Text
                                fontSize="lg" fontWeight="bold"
                                sx={{
                                    background: isDark
                                        ? "linear-gradient(135deg, #FED7AA, #FCD34D)"
                                        : "linear-gradient(135deg, #EA580C, #D97706)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}
                            >
                                Transfert de rotation
                            </Text>
                            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} fontWeight="normal">
                                Déplacer les scores d'une rotation vers une autre
                            </Text>
                        </Box>
                    </HStack>
                </ModalHeader>

                {/* ── Body ───────────────────────────────────────────────────────── */}
                <ModalBody px={6} py={5}>
                    <VStack spacing={4} align="stretch">

                        {/* Config */}
                        <Box p={4} borderRadius="xl" bg={sectionBg} border="1px solid" borderColor={sectionBorder}>
                            <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
                                textTransform="uppercase" color={isDark ? "orange.300" : "orange.600"} mb={3}>
                                Configuration
                            </Text>
                            <VStack spacing={3} align="stretch">

                                {/* Cycle */}
                                <FormControl>
                                    <FormLabel fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>Cycle</FormLabel>
                                    <CycleSelect
                                        cycles={cycles}
                                        value={selectedCycleId}
                                        onChange={setSelectedCycleId}
                                        placeholder="Sélectionnez un cycle"
                                        allowDeselect
                                        showActiveBadge
                                        size="md"
                                        variant="modal-orange"
                                    />
                                </FormControl>

                                {selectedCycle && (
                                    <>
                                        {/* Guilde optionnelle */}
                                        <FormControl>
                                            <FormLabel fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>
                                                Guilde{" "}
                                                <Text as="span" color={isDark ? "gray.600" : "gray.400"}>
                                                    (optionnel — toutes si vide)
                                                </Text>
                                            </FormLabel>
                                            <CustomSelect
                                                placeholder="Toutes les guildes"
                                                value={selectedGuildId}
                                                onChange={setSelectedGuildId}
                                                options={guilds.map(g => ({ value: g._id, label: g.name }))}
                                                size="md"
                                                variant="modal-orange"
                                            />
                                        </FormControl>

                                        {/* Rotation source */}
                                        <FormControl>
                                            <FormLabel fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>
                                                Rotation source{" "}
                                                <Text as="span" color="red.400">(la mauvaise)</Text>
                                            </FormLabel>
                                            <CustomSelect
                                                placeholder="Rotation à corriger"
                                                value={sourceRotationId}
                                                onChange={setSourceRotationId}
                                                options={makeRotationOptions(selectedCycle.rotations)}
                                                size="md"
                                                variant="modal-orange"
                                                allowDeselect={false}
                                            />
                                        </FormControl>

                                        {/* Rotation cible (visible seulement si source choisie) */}
                                        {sourceRotationId && (
                                            <FormControl>
                                                <FormLabel fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>
                                                    Rotation cible{" "}
                                                    <Text as="span" color="green.400">(la bonne)</Text>
                                                </FormLabel>
                                                <CustomSelect
                                                    placeholder="Rotation de destination"
                                                    value={targetRotationId}
                                                    onChange={setTargetRotationId}
                                                    options={makeRotationOptions(selectedCycle.rotations, sourceRotationId)}
                                                    size="md"
                                                    variant="modal-orange"
                                                    allowDeselect={false}
                                                />
                                            </FormControl>
                                        )}
                                    </>
                                )}
                            </VStack>
                        </Box>

                        {/* ── Zone de preview ─────────────────────────────────────────── */}
                        {selectedCycleId && sourceRotationId && targetRotationId && (
                            <Box>
                                {isPreviewLoading ? (
                                    <Center py={8}>
                                        <VStack spacing={2}>
                                            <Spinner size="md" color="orange.400" />
                                            <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>Analyse en cours…</Text>
                                        </VStack>
                                    </Center>

                                ) : previewGenericError ? (
                                    <Alert status="error" borderRadius="xl" variant="left-accent">
                                        <AlertIcon />
                                        <Text fontSize="sm">{previewGenericError}</Text>
                                    </Alert>

                                ) : preview ? (
                                    /* Aperçu OK */
                                    <VStack spacing={3} align="stretch">

                                        {/* Barre récap */}
                                        <Flex px={4} py={3} borderRadius="xl"
                                            bg={sectionBg} border="1px solid" borderColor={sectionBorder}
                                            align="center" justify="space-between" wrap="wrap" gap={2}
                                        >
                                            <HStack spacing={2} fontSize="sm">
                                                <Text fontWeight="bold" color="red.400">
                                                    {sourceRotation?.killer} #{sourceRotation?.position}
                                                </Text>
                                                <Text color={isDark ? "gray.400" : "gray.500"}>→</Text>
                                                <Text fontWeight="bold" color="green.400">
                                                    {targetRotation?.killer} #{targetRotation?.position}
                                                </Text>
                                            </HStack>
                                            <HStack spacing={2}>
                                                <Badge colorScheme="orange" borderRadius="full">
                                                    {preview.scoreCount} score{preview.scoreCount > 1 ? "s" : ""}
                                                </Badge>
                                                {preview.parityChanged && (
                                                    <Badge colorScheme="yellow" borderRadius="full">
                                                        ⚠ Recalcul
                                                    </Badge>
                                                )}
                                            </HStack>
                                        </Flex>

                                        {/* Avertissement parité */}
                                        {preview.parityChanged && (
                                            <Alert status="warning" borderRadius="xl" variant="left-accent" fontSize="sm">
                                                <AlertIcon />
                                                La parité des rotations diffère (base ↔ différentielle). Les scores affichés
                                                seront recalculés automatiquement.
                                            </Alert>
                                        )}

                                        {/* Avertissement écrasement */}
                                        {previewConflicts && previewConflicts.length > 0 && (
                                            <VStack spacing={2} align="stretch">
                                                <Alert status="warning" borderRadius="xl" variant="left-accent" fontSize="sm">
                                                    <AlertIcon />
                                                    <Box>
                                                        <Text fontWeight="bold">
                                                            {previewConflicts.length} score{previewConflicts.length > 1 ? "s" : ""} existant{previewConflicts.length > 1 ? "s" : ""} seront écrasés
                                                        </Text>
                                                        <Text fontSize="xs">
                                                            Ces joueurs ont déjà un score sur la rotation cible (ancien → nouveau).
                                                        </Text>
                                                    </Box>
                                                </Alert>
                                                <VStack spacing={1} align="stretch">
                                                    {previewConflicts.map((c: TransferConflict) => (
                                                        <Flex key={c.user_id} align="center" gap={3}
                                                            px={3} py={2} borderRadius="lg"
                                                            border="1px solid" borderColor={rowConflictBorder}
                                                            bg={rowConflictBg}
                                                        >
                                                            <Avatar size="xs" name={c.user?.global_name} src={userAvatarUrl(c.user)} />
                                                            <Text flex={1} fontSize="sm" fontWeight="medium">
                                                                {c.user?.bbs_name || c.user?.global_name || c.user_id}
                                                            </Text>
                                                            <HStack spacing={1} fontSize="xs">
                                                                <Badge colorScheme="gray">{c.existing_raw_score?.toLocaleString()}</Badge>
                                                                <Text color={isDark ? "gray.500" : "gray.400"}>→</Text>
                                                                <Badge colorScheme="orange">{c.source_raw_score?.toLocaleString()}</Badge>
                                                            </HStack>
                                                        </Flex>
                                                    ))}
                                                </VStack>
                                            </VStack>
                                        )}

                                        {/* Liste des scores */}
                                        <VStack spacing={1.5} align="stretch">
                                            {preview.preview?.map((p: TransferPreviewItem) => (
                                                <Flex key={p.user_id} align="center" gap={3}
                                                    px={3} py={2} borderRadius="lg"
                                                    border="1px solid" borderColor={rowOkBorder}
                                                    bg={rowOkBg}
                                                >
                                                    <Avatar
                                                        size="xs"
                                                        name={p.user?.global_name}
                                                        src={userAvatarUrl(p.user)}
                                                    />
                                                    <Text flex={1} fontSize="sm" fontWeight="medium">
                                                        {p.user?.bbs_name || p.user?.global_name || p.user_id}
                                                    </Text>
                                                    <HStack spacing={1.5} fontSize="xs">
                                                        {preview.parityChanged ? (
                                                            <>
                                                                <Badge colorScheme="gray">
                                                                    {p.old_score?.toLocaleString()}
                                                                </Badge>
                                                                <Text color={isDark ? "gray.500" : "gray.400"}>→</Text>
                                                                <Badge colorScheme="green">
                                                                    {p.new_score?.toLocaleString()}
                                                                </Badge>
                                                            </>
                                                        ) : (
                                                            <Badge colorScheme="green">
                                                                {p.raw_score?.toLocaleString()}
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </VStack>
                                ) : null}
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                {/* ── Footer ─────────────────────────────────────────────────────── */}
                <ModalFooter px={6} py={4} borderTop="1px solid" borderColor={sectionBorder} bg={sectionBg}>
                    <HStack spacing={2} ml="auto">
                        <Button
                            variant="ghost" size="sm" borderRadius="full"
                            onClick={handleClose} isDisabled={isTransferring}
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            borderRadius="full"
                            sx={{
                                background: canTransfer
                                    ? "linear-gradient(135deg, #EA580C, #D97706)"
                                    : undefined,
                                color: canTransfer ? "white" : undefined,
                                _hover: canTransfer
                                    ? { background: "linear-gradient(135deg, #C2410C, #B45309)" }
                                    : undefined
                            }}
                            colorScheme={canTransfer ? undefined : "gray"}
                            onClick={handleTransfer}
                            isLoading={isTransferring}
                            loadingText="Transfert…"
                            isDisabled={!canTransfer}
                        >
                            Confirmer le transfert
                            {preview?.scoreCount ? ` (${preview.scoreCount})` : ""}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TransferRotationModal;
