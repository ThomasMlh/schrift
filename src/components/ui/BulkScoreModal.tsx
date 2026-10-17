import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    HStack,
    Text,
    useToast,
    Box,
    Center,
    Flex,
    SimpleGrid,
    Progress,
    IconButton,
    Tooltip,
} from "@chakra-ui/react";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { IUser, ICycle, IGuild, IScore, IScoreFormData, ICycleRotation } from "../../interfaces";
import { useGuildMembers, useScores, useBulkEntryContext } from "@/hooks/useAPI";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { RotationLabel } from "./RotationLabel";
import { CycleSelect } from "./CycleSelect";
import { CustomSelect } from "./CustomSelect";
import { useTranslation } from "react-i18next";
import { PageLoader } from "./PageLoader";
import { BulkScoreRow, ListIcon, GridIcon, type ViewMode } from "./BulkScoreInputs";
import { formatScore } from "@/utils/bulkScoreEntry";

interface BulkScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycles: ICycle[];
    guilds: IGuild[];
    onSubmit: (scores: IScoreFormData[]) => void;
    isSubmitting?: boolean;
    isGuildRestricted?: boolean;
    userGuildId?: string;
}

// Keyed by bbs_id (the account), not user_id: a user may own several accounts in the same guild.
// null means an empty field, nothing is sent.
type ScoreValues = Record<string, number | null>;

// Large enough for a guild with its alts (the scores list is paginated by 20 by default)
const EXISTING_SCORES_LIMIT = 200;

// List/grid choice remembered in the browser (convenience only, ignored when storage is unavailable)
const VIEW_MODE_KEY = "bulkScoreModal.viewMode";
const readViewMode = (): ViewMode => {
    try {
        return localStorage.getItem(VIEW_MODE_KEY) === "grid" ? "grid" : "list";
    } catch {
        return "list";
    }
};

// Preselected rotation: the latest one that has started (the current one, or the one that just
// ended between two rotations), never an upcoming rotation nobody has a score for yet
const findLatestStartedRotation = (cycles: ICycle[], now = new Date()) => {
    let latest: { cycle: ICycle; rotation: ICycleRotation; start: number } | null = null;
    for (const cycle of cycles) {
        for (const rotation of cycle.rotations ?? []) {
            if (!rotation.start_date || !rotation.end_date) continue;
            const start = getRotationRealDates(rotation.start_date, rotation.end_date).realStartDate.getTime();
            if (start <= now.getTime() && (!latest || start > latest.start)) latest = { cycle, rotation, start };
        }
    }
    return latest;
};

const BulkScoreModal = ({
    isOpen,
    onClose,
    cycles,
    guilds,
    onSubmit,
    isSubmitting = false,
    isGuildRestricted = false,
    userGuildId
}: BulkScoreModalProps) => {
    const toast = useToast();
    const { t } = useTranslation();

    const [selectedGuildId, setSelectedGuildId] = useState<string>(isGuildRestricted ? userGuildId || "" : "");
    const [selectedCycleId, setSelectedCycleId] = useState<string>("");
    const [selectedRotationId, setSelectedRotationId] = useState<string>("");
    const [values, setValues] = useState<ScoreValues>({});
    const [initialValues, setInitialValues] = useState<ScoreValues>({});
    const [isConfirmingClose, setIsConfirmingClose] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>(readViewMode);

    const changeViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        try {
            localStorage.setItem(VIEW_MODE_KEY, mode);
        } catch {
            // Storage unavailable: the choice only applies to this session
        }
    };
    // Selection (guild|cycle|rotation) whose values were initialized: a data revalidation must not
    // overwrite what was typed in the meantime
    const initializedKey = useRef<string | null>(null);

    const latestStarted = useMemo(() => findLatestStartedRotation(cycles), [cycles]);
    const currentCycle = latestStarted?.cycle ?? null;
    const currentRotation = latestStarted?.rotation ?? null;

    const { members: guildMembers = [], isLoading: isLoadingMembers } = useGuildMembers(selectedGuildId || undefined, true);
    const { scores: existingScoresData = [], isLoading: isLoadingScores } = useScores({
        guild_id: selectedGuildId,
        cycle_id: selectedCycleId,
        rotation_id: selectedRotationId,
        limit: EXISTING_SCORES_LIMIT,
        authenticated: true
    });

    const isComplete = Boolean(selectedGuildId && selectedCycleId && selectedRotationId);
    const selectionKey = isComplete ? `${selectedGuildId}|${selectedCycleId}|${selectedRotationId}` : null;

    // On open: leader's guild enforced, current cycle and rotation preselected
    useEffect(() => {
        if (!isOpen) return;
        setSelectedGuildId(isGuildRestricted ? userGuildId || "" : "");
        setSelectedCycleId(currentCycle?._id ?? "");
        setSelectedRotationId(currentRotation?.rotation_id ?? "");
        setValues({});
        setInitialValues({});
        setIsConfirmingClose(false);
        initializedKey.current = null;
        // Only on open: a current cycle arriving later is handled by the next effect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isGuildRestricted, userGuildId]);

    // Cycles loaded after opening: complete the preselection if nothing was chosen
    useEffect(() => {
        if (!isOpen || selectedCycleId || !currentCycle) return;
        setSelectedCycleId(currentCycle._id ?? "");
        setSelectedRotationId(currentRotation?.rotation_id ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentCycle, currentRotation]);

    // Displayed members: every current account of the guild, plus accounts that already have a score
    // on this rotation without being (or no longer being) in the guild
    const displayedMembers = useMemo<IUser[]>(() => {
        if (!isComplete) return [];
        const byBbsId = new Map<string, IUser>();
        for (const member of guildMembers) {
            if (member.bbs_id) byBbsId.set(member.bbs_id, member);
        }
        for (const score of existingScoresData as (IScore & { user?: IUser | IUser[] })[]) {
            const user = Array.isArray(score.user) ? score.user[0] : score.user;
            // The bbs_id/bbs_name of the ACCOUNT that played the score takes precedence over the user mirror
            const bbsId = score.bbs_id || user?.bbs_id;
            if (!user || !bbsId || byBbsId.has(bbsId)) continue;
            byBbsId.set(bbsId, { ...user, bbs_id: bbsId, bbs_name: score.bbs_name || user.bbs_name });
        }
        return [...byBbsId.values()];
    }, [isComplete, guildMembers, existingScoresData]);

    const existingByBbsId = useMemo(() => {
        const map = new Map<string, number>();
        for (const score of existingScoresData as IScore[]) {
            if (score.bbs_id) map.set(score.bbs_id, score.raw_score ?? 0);
        }
        return map;
    }, [existingScoresData]);

    // Initialize the values (existing scores prefilled) once per selection
    useEffect(() => {
        if (!selectionKey || isLoadingMembers || isLoadingScores) return;
        if (initializedKey.current === selectionKey) return;
        initializedKey.current = selectionKey;
        const initial: ScoreValues = {};
        for (const member of displayedMembers) {
            initial[member.bbs_id!] = existingByBbsId.get(member.bbs_id!) ?? null;
        }
        setValues(initial);
        setInitialValues(initial);
    }, [selectionKey, isLoadingMembers, isLoadingScores, displayedMembers, existingByBbsId]);

    const bbsIds = useMemo(() => displayedMembers.map((m) => m.bbs_id!).filter(Boolean), [displayedMembers]);
    const { isDifferential, thresholds, references } = useBulkEntryContext(
        selectedGuildId || undefined, selectedCycleId || undefined, selectedRotationId || undefined, bbsIds
    );

    const selectedCycle = cycles.find(cycle => cycle._id === selectedCycleId);
    const selectedGuild = guilds.find(guild => guild._id === selectedGuildId);

    const handleScoreChange = useCallback((bbsId: string, value: number | null) => {
        setValues(prev => ({ ...prev, [bbsId]: value }));
    }, []);

    // Pasting a column of scores (spreadsheet, Discord…) fills from the targeted row
    const handlePasteColumn = useCallback((startIndex: number, pasted: (number | null)[]) => {
        setValues(prev => {
            const next = { ...prev };
            pasted.forEach((value, offset) => {
                const member = displayedMembers[startIndex + offset];
                if (member?.bbs_id) next[member.bbs_id] = value;
            });
            return next;
        });
        const overflow = startIndex + pasted.length - displayedMembers.length;
        if (overflow > 0) {
            toast({ title: `${overflow} valeur(s) collée(s) en trop ignorée(s)`, status: "warning", duration: 3000 });
        }
    }, [displayedMembers, toast]);

    const dirtyCount = useMemo(
        () => Object.keys(values).filter((id) => values[id] !== initialValues[id]).length,
        [values, initialValues]
    );
    const filledIds = useMemo(() => bbsIds.filter((id) => values[id] != null), [bbsIds, values]);
    const totalScore = useMemo(() => filledIds.reduce((sum, id) => sum + (values[id] ?? 0), 0), [filledIds, values]);

    const handleSubmit = () => {
        if (!isComplete) {
            toast({ title: "Sélectionnez une guilde, un cycle et une rotation", status: "error", duration: 3000 });
            return;
        }
        if (filledIds.length === 0) {
            toast({ title: "Aucun score saisi", status: "warning", duration: 3000 });
            return;
        }

        // Only filled fields are sent: an empty field does not create a 0 score
        const scoresData: IScoreFormData[] = displayedMembers
            .filter((member) => member.bbs_id && values[member.bbs_id] != null)
            .map((member) => ({
                user_id: member._id,
                bbs_id: member.bbs_id!,
                cycle_id: selectedCycleId,
                rotation_id: selectedRotationId,
                guild_id: selectedGuildId,
                raw_score: values[member.bbs_id!]!,
            }));

        onSubmit(scoresData);
    };

    // Ask for confirmation when closing with unsaved values
    const handleClose = () => {
        if (isSubmitting) return;
        if (dirtyCount > 0 && !isConfirmingClose) {
            setIsConfirmingClose(true);
            return;
        }
        onClose();
    };

    const rotationOptions = (selectedCycle?.rotations ?? []).map((rotation: ICycleRotation) => ({
        value: rotation.rotation_id,
        // Text used by the select search
        label: `#${rotation.position} ${rotation.killer}`,
        content: (
            <RotationLabel
                rotation={rotation}
                showDate
                badge={rotation.rotation_id === currentRotation?.rotation_id ? "Dernière" : undefined}
            />
        ),
    }));

    const isLoading = isComplete && (isLoadingMembers || isLoadingScores);
    const total = displayedMembers.length;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size={viewMode === "grid" ? "4xl" : "3xl"} scrollBehavior="inside" closeOnOverlayClick={!isSubmitting}>
            <ModalOverlay bg="blackAlpha.700" />
            <ModalContent bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                <ModalHeader px={5} pt={5} pb={4} borderBottomWidth="1px" borderColor="border.subtle">
                    <Text fontSize="lg" fontWeight="bold" color="text.strong">Saisie groupée des scores</Text>
                    <Text fontSize="xs" fontWeight="normal" color="text.muted" mb={4}>
                        Entrée pour passer au joueur suivant · coller une colonne de scores remplit la liste
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2} fontWeight="normal">
                        {isGuildRestricted ? (
                            <Flex align="center" px={3} h="40px" borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
                                <Text fontSize="sm" isTruncated>{selectedGuild?.name ?? "—"}</Text>
                            </Flex>
                        ) : (
                            <CustomSelect
                                placeholder="Guilde"
                                value={selectedGuildId}
                                onChange={setSelectedGuildId}
                                isDisabled={isSubmitting}
                                options={guilds.map((guild: IGuild) => ({ value: guild._id, label: guild.name }))}
                                allowDeselect={false}
                                size="md"
                                variant="default"
                            />
                        )}
                        <CycleSelect
                            cycles={cycles}
                            value={selectedCycleId}
                            onChange={(id) => { setSelectedCycleId(id); setSelectedRotationId(""); }}
                            placeholder="Cycle"
                            isDisabled={isSubmitting}
                            allowDeselect={false}
                            showActiveBadge={true}
                            size="md"
                            variant="default"
                        />
                        <CustomSelect
                            placeholder="Rotation"
                            value={selectedRotationId}
                            onChange={setSelectedRotationId}
                            isDisabled={isSubmitting || !selectedCycle}
                            size="md"
                            variant="default"
                            options={rotationOptions}
                            renderSelected={(option) => {
                                const rotation = selectedCycle?.rotations.find((r: ICycleRotation) => r.rotation_id === option.value);
                                return rotation ? <RotationLabel rotation={rotation} /> : <Text>{option.label}</Text>;
                            }}
                            allowDeselect={false}
                        />
                    </SimpleGrid>
                </ModalHeader>
                <ModalCloseButton isDisabled={isSubmitting} />

                <ModalBody px={5} py={4}>
                    {!isComplete ? (
                        <Center py={10}>
                            <Text fontSize="sm" color="text.muted">Choisissez une guilde, un cycle et une rotation</Text>
                        </Center>
                    ) : isLoading ? (
                        <PageLoader
                            label={isLoadingMembers ? t("components.bulkScoreModal.loadingMembers") : t("components.bulkScoreModal.loadingScores")}
                            color="purple.400"
                            height="200px"
                        />
                    ) : total === 0 ? (
                        <Center py={10}>
                            <Text fontSize="sm" color="text.muted">Aucun membre trouvé pour cette guilde</Text>
                        </Center>
                    ) : (
                        <Box>
                            <Flex justify="space-between" align="center" gap={3} mb={2}>
                                <Text fontSize="xs" color="text.muted">
                                    {isDifferential
                                        ? "Rotation différentielle : saisissez le cumul de la semaine, le score de base est déduit automatiquement."
                                        : `${total} compte(s)`}
                                </Text>
                                <HStack spacing={0.5} flexShrink={0}>
                                    {([["list", "Vue liste", ListIcon], ["grid", "Vue grille", GridIcon]] as const).map(([mode, label, ViewIcon]) => (
                                        <Tooltip key={mode} label={label} placement="top" hasArrow openDelay={400}>
                                            <IconButton
                                                aria-label={label}
                                                icon={<ViewIcon />}
                                                size="xs"
                                                variant={viewMode === mode ? "solid" : "ghost"}
                                                colorScheme={viewMode === mode ? "purple" : "gray"}
                                                onClick={() => changeViewMode(mode)}
                                            />
                                        </Tooltip>
                                    ))}
                                </HStack>
                            </Flex>
                            <SimpleGrid columns={viewMode === "grid" ? { base: 1, sm: 2, md: 4 } : 1} spacing={viewMode === "grid" ? 2 : 1.5}>
                                {displayedMembers.map((member, idx) => (
                                    <BulkScoreRow
                                        key={member.bbs_id}
                                        member={member}
                                        index={idx}
                                        value={values[member.bbs_id!] ?? null}
                                        isDirty={values[member.bbs_id!] !== initialValues[member.bbs_id!]}
                                        reference={references?.[member.bbs_id!]}
                                        isDifferential={isDifferential}
                                        thresholds={thresholds}
                                        isDisabled={isSubmitting}
                                        onChange={handleScoreChange}
                                        onPasteColumn={handlePasteColumn}
                                        layout={viewMode}
                                    />
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}
                </ModalBody>

                <ModalFooter px={5} py={3} borderTopWidth="1px" borderColor="border.subtle" bg="bg.subtle">
                    {isConfirmingClose ? (
                        <Flex w="100%" align="center" justify="space-between" gap={3} wrap="wrap">
                            <Text fontSize="sm" color="text.strong">
                                {dirtyCount} score(s) saisi(s) non enregistré(s). Fermer quand même ?
                            </Text>
                            <HStack spacing={2}>
                                <Button size="sm" variant="ghost" onClick={() => setIsConfirmingClose(false)}>Continuer la saisie</Button>
                                <Button size="sm" colorScheme="red" onClick={onClose}>Abandonner</Button>
                            </HStack>
                        </Flex>
                    ) : (
                        <Flex w="100%" align="center" justify="space-between" gap={4} wrap="wrap">
                            <Box minW="180px" flex="1">
                                {total > 0 && (
                                    <>
                                        <HStack spacing={3} fontSize="xs" color="text.muted" mb={1}>
                                            <Text><Text as="span" fontWeight="bold" color="text.strong">{filledIds.length}</Text> / {total} saisis</Text>
                                            <Text sx={{ fontVariantNumeric: "tabular-nums" }}>Total {formatScore(totalScore)}</Text>
                                        </HStack>
                                        <Progress value={(filledIds.length / total) * 100} size="xs" colorScheme="purple" borderRadius="full" maxW="260px" />
                                    </>
                                )}
                            </Box>
                            <HStack spacing={2}>
                                <Button variant="ghost" size="sm" onClick={handleClose} isDisabled={isSubmitting}>
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    colorScheme="purple"
                                    onClick={handleSubmit}
                                    isLoading={isSubmitting}
                                    loadingText="Envoi…"
                                    isDisabled={!isComplete || filledIds.length === 0}
                                >
                                    Enregistrer{filledIds.length > 0 ? ` (${filledIds.length})` : ""}
                                </Button>
                            </HStack>
                        </Flex>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BulkScoreModal;
