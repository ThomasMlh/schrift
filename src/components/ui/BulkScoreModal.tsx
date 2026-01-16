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
    Divider,
    Box,
    Grid,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    useColorModeValue
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import type { IUser, ICycle, IGuild, IScoreFormData, ICycleRotation } from "../../interfaces";
import { useGuildMembers, useScores } from "@/hooks/useAPI";
import { AttackTypeBadge } from "./AttackTypeBadge";
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
    
    // Déplacer useColorModeValue au niveau du composant pour éviter les appels conditionnels
    const guildBoxBg = useColorModeValue("blue.50", "blue.900");
    const guildTextColor = useColorModeValue("blue.700", "blue.200");
    const modalBg = useColorModeValue("white", "gray.700");

    const [selectedGuildId, setSelectedGuildId] = useState<string>(isGuildRestricted ? userGuildId || "" : "");
    const [selectedCycleId, setSelectedCycleId] = useState<string>("");
    const [selectedRotationId, setSelectedRotationId] = useState<string>("");
    const [scores, setScores] = useState<{ [userId: string]: number }>({});
    const [hasExistingScores, setHasExistingScores] = useState(false);
    
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

    // Initialiser les scores quand les membres changent
    useEffect(() => {
        if (Array.isArray(guildMembers) && guildMembers.length > 0) {
            const initialScores: { [userId: string]: number } = {};
            guildMembers.forEach((user: IUser) => {
                initialScores[user._id] = 0;
            });
            setScores(initialScores);
        }
    }, [guildMembers]);

    // Charger les scores existants pour la rotation sélectionnée
    useEffect(() => {
        if (!selectedGuildId || !selectedCycleId || !selectedRotationId || !Array.isArray(guildMembers) || guildMembers.length === 0) {
            setHasExistingScores(false);
            return;
        }

        // Créer un objet de scores
        const newScores: { [userId: string]: number } = {};
        
        // Initialiser avec 0 pour tous les membres
        guildMembers.forEach((user: IUser) => {
            newScores[user._id] = 0;
        });

        if (existingScoresData.length > 0) {
            // Remplacer par les scores existants si disponibles
            let foundExistingScores = false;
            existingScoresData.forEach((score: IScoreFormData) => {
                if (score.raw_score !== undefined) {
                    newScores[score.user_id] = score.raw_score;
                    if (score.raw_score > 0) {
                        foundExistingScores = true;
                    }
                }
            });
            
            setHasExistingScores(foundExistingScores);
        } else {
            setHasExistingScores(false);
        }

        // Toujours mettre à jour les scores (soit avec les scores existants, soit avec des 0)
        setScores(newScores);
    }, [selectedGuildId, selectedCycleId, selectedRotationId, guildMembers, existingScoresData]);

    const selectedCycle = cycles.find(cycle => cycle._id === selectedCycleId);
    const selectedGuild = guilds.find(guild => guild._id === selectedGuildId);

    const handleScoreChange = (userId: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [userId]: score
        }));
    };

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

        // Créer les données de scores pour tous les membres
        const scoresData: IScoreFormData[] = guildMembers.map((member: IUser) => ({
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
        onClose();
    };

    const canSubmit = selectedGuildId && selectedCycleId && selectedRotationId && guildMembers.length > 0;

    // Fonction pour formater les nombres avec des virgules
    const formatNumber = (value: string | number): string => {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Fonction pour parser les nombres formatés
    const parseNumber = (value: string): string => {
        return value.replace(/,/g, '');
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent minH="60vh" bg={modalBg}>
                <ModalHeader>Saisie groupée des scores</ModalHeader>
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {/* Sélection de la guilde */}
                        {!isGuildRestricted && (
                            <FormControl>
                                <FormLabel>Guilde</FormLabel>
                                <CustomSelect
                                    placeholder="Sélectionnez une guilde"
                                    value={selectedGuildId}
                                    onChange={setSelectedGuildId}
                                    isDisabled={isSubmitting}
                                    bg={modalBg}
                                    options={guilds.map((guild: IGuild) => ({
                                        value: guild._id,
                                        label: guild.name
                                    }))}
                                    allowDeselect={false}
                                />
                            </FormControl>
                        )}

                        {/* Affichage de la guilde pour les utilisateurs restreints */}
                        {isGuildRestricted && selectedGuild && (
                            <Box p={4} bg={guildBoxBg} borderRadius="md">
                                <Text fontSize="sm" color={guildTextColor} mb={1}>
                                    Guilde assignée
                                </Text>
                                <Text fontSize="lg" fontWeight="bold">
                                    {selectedGuild.name}
                                </Text>
                            </Box>
                        )}

                        {/* Sélection du cycle */}
                        <FormControl>
                            <FormLabel>Cycle</FormLabel>
                            <CustomSelect
                                placeholder="Sélectionnez un cycle"
                                value={selectedCycleId}
                                onChange={setSelectedCycleId}
                                isDisabled={isSubmitting}
                                bg={modalBg}
                                options={cycles.map((cycle: ICycle) => ({
                                    value: cycle._id || '',
                                    label: cycle.name
                                }))}
                                allowDeselect={false}
                            />
                        </FormControl>

                        {/* Sélection de la rotation */}
                        {selectedCycle && (
                            <FormControl>
                                <FormLabel>Rotation</FormLabel>
                                <CustomSelect
                                    placeholder="Sélectionnez une rotation"
                                    value={selectedRotationId}
                                    onChange={setSelectedRotationId}
                                    isDisabled={isSubmitting}
                                    bg={modalBg}
                                    options={selectedCycle.rotations.map((rotation: ICycleRotation) => ({
                                        value: rotation.rotation_id,
                                        label: `Rotation #${rotation.position} - ${rotation.killer}`,
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
                        )}                        {/* Informations de la sélection */}
                        {selectedGuild && selectedCycle && selectedRotationId && (
                            <Alert status="info">
                                <AlertIcon />
                                <VStack align="start" spacing={1}>
                                    <Text><strong>Guilde:</strong> {selectedGuild.name}</Text>
                                    <Text><strong>Cycle:</strong> {selectedCycle.name}</Text>
                                    <Text><strong>Rotation:</strong> #{selectedCycle.rotations.find((r: ICycleRotation) => r.rotation_id === selectedRotationId)?.position}</Text>
                                </VStack>
                            </Alert>
                        )}

                        <Divider />

                        {/* Liste des membres et saisie des scores */}
                        {isLoading ? (
                            <Center p={8}>
                                <VStack>
                                    <Spinner size="lg" />
                                    <Text>Chargement des membres...</Text>
                                </VStack>
                            </Center>
                        ) : isLoadingScores ? (
                            <Center p={8}>
                                <VStack>
                                    <Spinner size="lg" />
                                    <Text>Chargement des scores existants...</Text>
                                </VStack>
                            </Center>
                        ) : guildMembers.length > 0 ? (
                            <Box>
                                <HStack justify="space-between" align="center" mb={4}>
                                    <Text fontSize="lg" fontWeight="bold">
                                        Saisie des scores ({guildMembers.length} membres)
                                    </Text>
                                    {hasExistingScores && (
                                        <Text fontSize="sm" color="green.500" fontStyle="italic">
                                            ✓ Scores existants chargés automatiquement
                                        </Text>
                                    )}
                                </HStack>
                                <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={2}>
                                    {guildMembers.map((member: IUser) => (
                                        <VStack 
                                            key={member._id}
                                            p={2}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            spacing={2}
                                        >
                                            <UserDisplay user={member} avatarSize="xs" showUsername={false} />
                                            <NumberInput
                                                size="sm"
                                                min={0}
                                                max={9999999999}
                                                step={10000000}
                                                value={scores[member._id] || 0}
                                                onChange={(_, value) => handleScoreChange(member._id, value)}
                                                isDisabled={isSubmitting || isLoadingScores}
                                                flex={1}
                                                format={formatNumber}
                                                parse={parseNumber}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </VStack>
                                    ))}
                                </Grid>
                            </Box>
                        ) : selectedGuildId ? (
                            <Center p={8}>
                                <Text color="gray.500">Aucun membre trouvé pour cette guilde</Text>
                            </Center>
                        ) : null}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button variant="ghost" onClick={handleClose} isDisabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                            loadingText="Envoi en cours..."
                            isDisabled={!canSubmit}
                        >
                            Enregistrer les scores ({guildMembers.length})
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default BulkScoreModal;