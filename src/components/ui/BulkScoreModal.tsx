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
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    Box,
    Spinner,
    Center,
    useColorMode,
    Badge,
    Flex,
    Stat,
    StatLabel,
    StatNumber,
} from "@chakra-ui/react";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import type { IUser, ICycle, IGuild, IScoreFormData, ICycleRotation } from "../../interfaces";
import { useGuildMembers, useScores } from "@/hooks/useAPI";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { CycleSelect } from "./CycleSelect";
import { CustomSelect } from "./CustomSelect";
import { UserDisplay } from "./UserDisplay";

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

interface ScoreRowProps {
    member: IUser;
    index: number;
    score: number;
    onChange: (userId: string, value: number) => void;
    isDisabled: boolean;
    isDark: boolean;
    rowBg: string;
    rowBorder: string;
    rowActiveBg: string;
    rowActiveBorder: string;
    formatNumber: (v: string | number) => string;
    parseNumber: (v: string) => string;
}

const ScoreRow = memo(({
    member, index, score, onChange, isDisabled,
    isDark, rowBg, rowBorder, rowActiveBg, rowActiveBorder,
    formatNumber, parseNumber
}: ScoreRowProps) => {
    const hasScore = score > 0;
    return (
        <Flex
            align="center"
            gap={3}
            px={3} py={2.5}
            borderRadius="lg"
            border="1px solid"
            bg={hasScore ? rowActiveBg : rowBg}
            borderColor={hasScore ? rowActiveBorder : rowBorder}
            transition="background 0.1s, border-color 0.1s"
        >
            <Text
                fontSize="2xs" fontWeight="bold" minW="18px" textAlign="right"
                color={isDark ? 'whiteAlpha.300' : 'gray.300'}
            >
                {index + 1}
            </Text>
            <Box flex={1} minW={0}>
                <UserDisplay user={member} avatarSize="xs" showUsername={false} asLink={false} />
            </Box>
            <NumberInput
                size="sm"
                min={0}
                max={9999999999}
                step={10000000}
                value={score}
                onChange={(_, value) => onChange(member._id, value)}
                isDisabled={isDisabled}
                w="160px"
                flexShrink={0}
                format={formatNumber}
                parse={parseNumber}
            >
                <NumberInputField
                    borderRadius="lg"
                    textAlign="right"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    borderColor={hasScore ? (isDark ? 'purple.600' : 'purple.300') : undefined}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    onFocus={(e) => e.target.select()}
                />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </Flex>
    );
});

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
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    const modalBg        = isDark ? '#1a1b2e' : 'white';
    const sectionBg      = isDark ? 'rgba(124,58,237,0.08)' : 'purple.50';
    const sectionBorder  = isDark ? 'rgba(124,58,237,0.25)' : 'purple.100';
    const rowBg          = isDark ? 'rgba(255,255,255,0.03)' : 'white';
    const rowBorder      = isDark ? 'whiteAlpha.80' : 'gray.100';
    const rowActiveBg    = isDark ? 'rgba(124,58,237,0.08)' : 'purple.50';
    const rowActiveBorder = isDark ? 'purple.700' : 'purple.200';
    const summaryBg      = isDark ? 'rgba(124,58,237,0.12)' : 'purple.50';
    const summaryBorder  = isDark ? 'purple.700' : 'purple.200';
    const guildBoxBg     = isDark ? 'blue.900' : 'blue.50';
    const guildTextColor = isDark ? 'blue.200' : 'blue.700';

    const [selectedGuildId, setSelectedGuildId] = useState<string>(isGuildRestricted ? userGuildId || "" : "");
    const [selectedCycleId, setSelectedCycleId] = useState<string>("");
    const [selectedRotationId, setSelectedRotationId] = useState<string>("");
    const [scores, setScores] = useState<{ [userId: string]: number }>({});
    const [hasExistingScores, setHasExistingScores] = useState(false);
    const [displayedMembers, setDisplayedMembers] = useState<IUser[]>([]);
    
    // Charger les membres avec le hook
    const { members: guildMembers = [], isLoading } = useGuildMembers(
        selectedGuildId || undefined,
        true
    );
    
    // Charger les scores existants avec le hook
    const { scores: existingScoresData = [], isLoading: isLoadingScores } = useScores({
        guild_id: selectedGuildId,
        cycle_id: selectedCycleId,
        rotation_id: selectedRotationId,
        authenticated: true
    });

    // Réinitialiser la guilde sélectionnée quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            setSelectedGuildId(isGuildRestricted ? userGuildId || "" : "");
        }
    }, [isOpen, isGuildRestricted, userGuildId]);

    // Déterminer la liste des membres à afficher et initialiser les scores
    useEffect(() => {
        if (!selectedGuildId || !selectedCycleId || !selectedRotationId) {
            if (displayedMembers.length > 0 || Object.keys(scores).length > 0) {
                setDisplayedMembers([]);
                setScores({});
                setHasExistingScores(false);
            }
            return;
        }

        if (isLoading || isLoadingScores) {
            return;
        }

        const newScores: { [userId: string]: number } = {};
        let membersToDisplay: IUser[] = [];
        let foundExistingScores = false;

        // Si des scores existent déjà, utiliser uniquement les joueurs de ces scores
        if (existingScoresData.length > 0) {
            // Extraire les utilisateurs des scores existants
            existingScoresData.forEach((score: any) => {
                if (score.user) {
                    // score.user peut être un tableau ou un objet selon le pipeline MongoDB
                    const user = Array.isArray(score.user) ? score.user[0] : score.user;
                    if (user) {
                        membersToDisplay.push(user);
                        newScores[user._id] = score.raw_score || 0;
                        if (score.raw_score > 0) {
                            foundExistingScores = true;
                        }
                    }
                }
            });
        } else {
            // Sinon, utiliser la liste des membres actuels de la guilde
            if (Array.isArray(guildMembers) && guildMembers.length > 0) {
                guildMembers.forEach((user: IUser) => {
                    newScores[user._id] = 0;
                });
                membersToDisplay = guildMembers;
            }
        }

        // Ne mettre à jour que si les membres ont changé
        const membersChanged = membersToDisplay.length !== displayedMembers.length || 
            membersToDisplay.some((m, i) => m._id !== displayedMembers[i]?._id);

        if (membersChanged) {
            setDisplayedMembers(membersToDisplay);
            setScores(newScores);
            setHasExistingScores(foundExistingScores);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGuildId, selectedCycleId, selectedRotationId, guildMembers, existingScoresData, isLoading, isLoadingScores]);

    const selectedCycle = cycles.find(cycle => cycle._id === selectedCycleId);
    const selectedGuild = guilds.find(guild => guild._id === selectedGuildId);

    const handleScoreChange = useCallback((userId: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [userId]: score
        }));
    }, []);

    const handleSubmit = () => {
        if (!selectedGuildId || !selectedCycleId || !selectedRotationId) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner une guilde, un cycle et une rotation",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Créer les données de scores pour tous les membres affichés
        const scoresData: IScoreFormData[] = displayedMembers.map((member: IUser) => ({
            user_id: member._id,
            cycle_id: selectedCycleId,
            rotation_id: selectedRotationId,
            guild_id: selectedGuildId,
            raw_score: scores[member._id] || 0
        }));

        if (scoresData.length === 0) {
            toast({
                title: "Attention",
                description: "Aucun membre trouvé",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        onSubmit(scoresData);
    };

    const handleClose = () => {
        if (!isGuildRestricted) {
            setSelectedGuildId("");
        }
        setSelectedCycleId("");
        setSelectedRotationId("");
        setScores({});
        setHasExistingScores(false);
        setDisplayedMembers([]);
        onClose();
    };

    const canSubmit = selectedGuildId && selectedCycleId && selectedRotationId && displayedMembers.length > 0;

    const totalScore = useMemo(() => Object.values(scores).reduce((acc, v) => acc + (v || 0), 0), [scores]);
    const scoredCount = useMemo(() => Object.values(scores).filter(v => v > 0).length, [scores]);

    const formatNumber = useCallback((value: string | number): string => {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }, []);

    const parseNumber = useCallback((value: string): string => {
        return value.replace(/,/g, '');
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.700" />
            <ModalContent bg={modalBg} borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={sectionBorder}>

                {/* ── Header ── */}
                <ModalHeader px={6} pt={6} pb={4} borderBottom="1px solid" borderColor={sectionBorder}>
                    <HStack spacing={3} align="center">
                        <Box
                            w={9} h={9} borderRadius="xl"
                            bgGradient="linear(135deg, #7C3AED, #4F46E5)"
                            display="flex" alignItems="center" justifyContent="center"
                            fontSize="lg" flexShrink={0}
                        >
                            📊
                        </Box>
                        <Box>
                            <Text
                                fontSize="lg" fontWeight="bold"
                                sx={{
                                    background: isDark
                                        ? 'linear-gradient(135deg, #C4B5FD, #818CF8)'
                                        : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Saisie groupée des scores
                            </Text>
                            <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} fontWeight="normal">
                                Saisissez les scores de tous les membres en une seule opération
                            </Text>
                        </Box>
                    </HStack>
                </ModalHeader>

                <ModalBody px={6} py={5}>
                    <VStack spacing={5} align="stretch">

                        {/* ── Config card ── */}
                        <Box
                            p={4} borderRadius="xl" bg={sectionBg}
                            border="1px solid" borderColor={sectionBorder}
                        >
                            <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
                                textTransform="uppercase" color={isDark ? 'purple.400' : 'purple.600'} mb={3}>
                                Configuration
                            </Text>
                            <VStack spacing={3} align="stretch">
                                {/* Guilde */}
                                {!isGuildRestricted ? (
                                    <FormControl>
                                        <FormLabel fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>Guilde</FormLabel>
                                        <CustomSelect
                                            placeholder="Sélectionnez une guilde"
                                            value={selectedGuildId}
                                            onChange={setSelectedGuildId}
                                            isDisabled={isSubmitting}
                                            options={guilds.map((guild: IGuild) => ({
                                                value: guild._id,
                                                label: guild.name
                                            }))}
                                            allowDeselect={false}
                                            size="md"
                                            variant="modal"
                                        />
                                    </FormControl>
                                ) : selectedGuild && (
                                    <Box px={3} py={2} bg={guildBoxBg} borderRadius="lg">
                                        <Text fontSize="2xs" color={guildTextColor} fontWeight="semibold" letterSpacing="wide" textTransform="uppercase" mb={0.5}>
                                            Guilde assignée
                                        </Text>
                                        <Text fontWeight="bold">{selectedGuild.name}</Text>
                                    </Box>
                                )}

                                {/* Cycle */}
                                <FormControl>
                                    <FormLabel fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>Cycle</FormLabel>
                                    <CycleSelect
                                        cycles={cycles}
                                        value={selectedCycleId}
                                        onChange={setSelectedCycleId}
                                        placeholder="Sélectionnez un cycle"
                                        isDisabled={isSubmitting}
                                        allowDeselect={true}
                                        showActiveBadge={true}
                                        size="md"
                                        variant="modal"
                                    />
                                </FormControl>

                                {/* Rotation */}
                                {selectedCycle && (
                                    <FormControl>
                                        <FormLabel fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>Rotation</FormLabel>
                                        <CustomSelect
                                            placeholder="Sélectionnez une rotation"
                                            value={selectedRotationId}
                                            onChange={setSelectedRotationId}
                                            isDisabled={isSubmitting}
                                            size="md"
                                            variant="modal"
                                            options={selectedCycle.rotations.map((rotation: ICycleRotation) => ({
                                                value: rotation.rotation_id,
                                                label: `Rotation #${rotation.position} - ${rotation.killer} ${rotation.attack === "R" ? "🔴" : rotation.attack === "B" ? "🔵" : "🟠 Mêlée"}`,
                                                content: (
                                                    <VStack align="start" spacing={1} w="100%">
                                                        <HStack spacing={2} w="100%">
                                                            <Text fontWeight="medium">
                                                                Rotation #{rotation.position} - {rotation.killer}
                                                            </Text>
                                                            <AttackTypeBadge attackType={rotation.attack} />
                                                        </HStack>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {rotation.start_date} - {rotation.end_date} • {rotation.period}
                                                        </Text>
                                                    </VStack>
                                                )
                                            }))}
                                            renderSelected={(option) => {
                                                const rotation = selectedCycle.rotations.find((r: ICycleRotation) => r._id === option.value);
                                                const index = selectedCycle.rotations.findIndex((r: ICycleRotation) => r._id === option.value);
                                                return rotation ? (
                                                    <HStack spacing={2} w="100%">
                                                        <Text>Rotation #{index + 1} - {rotation.killer}</Text>
                                                        <AttackTypeBadge attackType={rotation.attack} />
                                                        <Text>({rotation.start_date} - {rotation.end_date})</Text>
                                                    </HStack>
                                                ) : <Text>{option.label}</Text>;
                                            }}
                                            allowDeselect={false}
                                        />
                                    </FormControl>
                                )}
                            </VStack>
                        </Box>

                        {/* ── Summary strip ── */}
                        {selectedGuild && selectedCycle && selectedRotationId && (() => {
                            const rotation = selectedCycle.rotations.find((r: ICycleRotation) => r.rotation_id === selectedRotationId);
                            return (
                                <Box
                                    px={4} py={3} borderRadius="xl"
                                    bg={summaryBg} border="1px solid" borderColor={summaryBorder}
                                >
                                    <HStack spacing={4} flexWrap="wrap">
                                        <HStack spacing={1.5}>
                                            <Text fontSize="xs" color={isDark ? 'purple.300' : 'purple.500'} fontWeight="semibold">🏰</Text>
                                            <Text fontSize="xs" fontWeight="semibold">{selectedGuild.name}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color={isDark ? 'whiteAlpha.400' : 'gray.300'}>•</Text>
                                        <HStack spacing={1.5}>
                                            <Text fontSize="xs" color={isDark ? 'purple.300' : 'purple.500'} fontWeight="semibold">🔄</Text>
                                            <Text fontSize="xs" fontWeight="semibold">{selectedCycle.name} {selectedCycle.year ? `(${selectedCycle.year})` : ''}</Text>
                                        </HStack>
                                        {rotation && (
                                            <>
                                                <Text fontSize="xs" color={isDark ? 'whiteAlpha.400' : 'gray.300'}>•</Text>
                                                <HStack spacing={1.5}>
                                                    <Text fontSize="xs" fontWeight="semibold">
                                                        Rot. #{rotation.position} — {rotation.killer}
                                                    </Text>
                                                    <AttackTypeBadge attackType={rotation.attack} />
                                                </HStack>
                                            </>
                                        )}
                                        {hasExistingScores && (
                                            <Badge colorScheme="green" borderRadius="full" fontSize="2xs" ml="auto">
                                                ✓ Scores existants
                                            </Badge>
                                        )}
                                    </HStack>
                                </Box>
                            );
                        })()}

                        {/* ── Score rows ── */}
                        {isLoading || isLoadingScores ? (
                            <Center p={10}>
                                <VStack spacing={3}>
                                    <Spinner size="lg" color="purple.400" />
                                    <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                                        {isLoading ? 'Chargement des membres…' : 'Chargement des scores existants…'}
                                    </Text>
                                </VStack>
                            </Center>
                        ) : displayedMembers.length > 0 ? (
                            <Box>
                                <HStack justify="space-between" align="center" mb={3}>
                                    <Text fontSize="xs" fontWeight="semibold" letterSpacing="widest"
                                        textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
                                        Membres — {displayedMembers.length}
                                    </Text>
                                    <Text fontSize="xs" color={isDark ? 'purple.300' : 'purple.600'}>
                                        {scoredCount} / {displayedMembers.length} saisis
                                    </Text>
                                </HStack>
                                <VStack spacing={1.5} align="stretch">
                                    {displayedMembers.map((member: IUser, idx: number) => (
                                        <ScoreRow
                                            key={member._id}
                                            member={member}
                                            index={idx}
                                            score={scores[member._id] || 0}
                                            onChange={handleScoreChange}
                                            isDisabled={isSubmitting || isLoadingScores}
                                            isDark={isDark}
                                            rowBg={rowBg}
                                            rowBorder={rowBorder}
                                            rowActiveBg={rowActiveBg}
                                            rowActiveBorder={rowActiveBorder}
                                            formatNumber={formatNumber}
                                            parseNumber={parseNumber}
                                        />
                                    ))}
                                </VStack>
                            </Box>
                        ) : selectedGuildId ? (
                            <Center p={8}>
                                <Text color="gray.500" fontSize="sm">Aucun membre trouvé pour cette guilde</Text>
                            </Center>
                        ) : null}

                    </VStack>
                </ModalBody>

                {/* ── Footer ── */}
                <ModalFooter
                    px={6} py={4}
                    borderTop="1px solid" borderColor={sectionBorder}
                    bg={sectionBg}
                >
                    <Flex w="100%" align="center" justify="space-between" gap={4} wrap="wrap">
                        {/* Live total */}
                        {displayedMembers.length > 0 ? (
                            <Stat flex="unset">
                                <StatLabel fontSize="2xs" letterSpacing="widest" textTransform="uppercase"
                                    color={isDark ? 'gray.400' : 'gray.500'}>
                                    Total cumulé
                                </StatLabel>
                                <StatNumber
                                    fontSize="lg"
                                    sx={{
                                        background: isDark
                                            ? 'linear-gradient(135deg, #C4B5FD, #818CF8)'
                                            : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {totalScore.toLocaleString()}
                                </StatNumber>
                            </Stat>
                        ) : <Box />}

                        <HStack spacing={2}>
                            <Button
                                variant="ghost" size="sm" borderRadius="full"
                                onClick={handleClose} isDisabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                borderRadius="full"
                                sx={{
                                    background: canSubmit
                                        ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                                        : undefined,
                                    color: canSubmit ? 'white' : undefined,
                                    _hover: canSubmit ? { background: 'linear-gradient(135deg, #6D28D9, #4338CA)' } : undefined,
                                }}
                                colorScheme={canSubmit ? undefined : "gray"}
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                loadingText="Envoi…"
                                isDisabled={!canSubmit}
                            >
                                Enregistrer {displayedMembers.length > 0 ? `(${displayedMembers.length})` : ''}
                            </Button>
                        </HStack>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default BulkScoreModal;