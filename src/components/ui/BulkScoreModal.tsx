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
    GridItem,
    Card,
    CardBody,
    Spinner,
    Center,
    Alert,
    AlertIcon
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import type { User, Cycle, Guild, ScoreFormData } from "../../interfaces";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { CustomSelect } from "./CustomSelect";
import { UserDisplay } from "./UserDisplay";

interface BulkScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycles: Cycle[];
    guilds: Guild[];
    onSubmit: (scores: ScoreFormData[]) => void;
    isSubmitting?: boolean;
    apiUrl?: string;
}

export default function BulkScoreModal({
    isOpen,
    onClose,
    cycles,
    guilds,
    onSubmit,
    isSubmitting = false,
    apiUrl = '/api'
}: BulkScoreModalProps) {
    const toast = useToast();

    const [selectedGuildId, setSelectedGuildId] = useState<string>("");
    const [selectedCycleId, setSelectedCycleId] = useState<string>("");
    const [selectedRotationId, setSelectedRotationId] = useState<string>("");
    const [guildMembers, setGuildMembers] = useState<User[]>([]);
    const [scores, setScores] = useState<{ [userId: string]: number }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingScores, setIsLoadingScores] = useState(false);
    const [hasExistingScores, setHasExistingScores] = useState(false);

    // Charger les membres de la guilde sélectionnée
    useEffect(() => {
        const loadGuildMembers = async () => {
            if (!selectedGuildId) {
                setGuildMembers([]);
                setScores({});
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${apiUrl}/api/guildes/${selectedGuildId}/membres`);

                const data = await response.json();

                if (data.success) {
                    setGuildMembers(data.data);
                    // Initialiser les scores à 0 pour tous les membres
                    const initialScores: { [userId: string]: number } = {};
                    data.data.forEach((user: User) => {
                        initialScores[user._id] = 0;
                    });
                    setScores(initialScores);
                } else {
                    throw new Error(data.message || 'Erreur lors du chargement des membres');
                }
            } catch (error: any) {
                toast({
                    title: "Erreur",
                    description: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                setGuildMembers([]);
                setScores({});
            } finally {
                setIsLoading(false);
            }
        };

        loadGuildMembers();
    }, [selectedGuildId, apiUrl, toast]);

    // Charger les scores existants pour la rotation sélectionnée
    useEffect(() => {
        const loadExistingScores = async () => {
            if (!selectedGuildId || !selectedCycleId || !selectedRotationId || guildMembers.length === 0) {
                setHasExistingScores(false);
                return;
            }

            setIsLoadingScores(true);
            try {
                const response = await fetch(`${apiUrl}/api/scores?guild_id=${selectedGuildId}&cycle_id=${selectedCycleId}&rotation_id=${selectedRotationId}`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        // Créer un objet de scores existants
                        const existingScores: { [userId: string]: number } = {};
                        
                        // Initialiser avec 0 pour tous les membres
                        guildMembers.forEach((user: User) => {
                            existingScores[user._id] = 0;
                        });
                        
                        // Remplacer par les scores existants si disponibles
                        let foundExistingScores = false;
                        data.data.forEach((score: any) => {
                            if (score.raw_score !== undefined) {
                                existingScores[score.user_id] = score.raw_score;
                                if (score.raw_score > 0) {
                                    foundExistingScores = true;
                                }
                            }
                        });
                        
                        setScores(existingScores);
                        setHasExistingScores(foundExistingScores);
                    }
                } 
            } catch (error: any) {
                console.log('Erreur lors du chargement des scores existants:', error.message);
                // En cas d'erreur, garder les scores à 0
                setHasExistingScores(false);
            } finally {
                setIsLoadingScores(false);
            }
        };

        loadExistingScores();
    }, [selectedGuildId, selectedCycleId, selectedRotationId, guildMembers, apiUrl]);

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
        const scoresData: ScoreFormData[] = guildMembers.map(member => ({
            user_id: member._id,
            cycle_id: selectedCycleId,
            rotation_id: selectedRotationId,
            guild_id: selectedGuildId,
            raw_score: scores[member._id] || 0
        }));

        onSubmit(scoresData);
    };

    const handleClose = () => {
        setSelectedGuildId("");
        setSelectedCycleId("");
        setSelectedRotationId("");
        setGuildMembers([]);
        setScores({});
        setHasExistingScores(false);
        onClose();
    };

    const canSubmit = selectedGuildId && selectedCycleId && selectedRotationId && guildMembers.length > 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent minH="400px">
                <ModalHeader>Saisie groupée des scores</ModalHeader>
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {/* Sélection de la guilde */}
                        <FormControl>
                            <FormLabel>Guilde</FormLabel>
                            <CustomSelect
                                placeholder="Sélectionnez une guilde"
                                value={selectedGuildId}
                                onChange={setSelectedGuildId}
                                isDisabled={isSubmitting}
                                options={guilds.map((guild: Guild) => ({
                                    value: guild._id,
                                    label: guild.name
                                }))}
                                allowDeselect={false}
                            />
                        </FormControl>

                        {/* Sélection du cycle */}
                        <FormControl>
                            <FormLabel>Cycle</FormLabel>
                            <CustomSelect
                                placeholder="Sélectionnez un cycle"
                                value={selectedCycleId}
                                onChange={setSelectedCycleId}
                                isDisabled={isSubmitting}
                                options={cycles.map((cycle: Cycle) => ({
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
                                    options={selectedCycle.rotations.map((rotation: any) => ({
                                        value: rotation._id,
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
                                        const rotation = selectedCycle.rotations.find((r: any) => r._id === option.value);
                                        const index = selectedCycle.rotations.findIndex((r: any) => r._id === option.value);
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
                                    <Text><strong>Rotation:</strong> #{selectedCycle.rotations.findIndex((r: any) => r._id === selectedRotationId) + 1}</Text>
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
                                <Grid templateColumns="repeat(auto-fill, 320px)" gap={4} justifyContent="center">
                                    {guildMembers.map((member: User) => (
                                        <GridItem key={member._id}>
                                            <Card h="120px">
                                                <CardBody p={3}>
                                                    <VStack spacing={3} h="full">
                                                        <HStack spacing={3} w="full">
                                                            <UserDisplay user={member} />
                                                            <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                                                                {member.role}
                                                            </Text>
                                                        </HStack>
                                                        <Box w="full">
                                                            <NumberInput
                                                                size="sm"
                                                                min={0}
                                                                max={9999999999}
                                                                value={scores[member._id] || 0}
                                                                onChange={(_, value) => handleScoreChange(member._id, value)}
                                                                isDisabled={isSubmitting || isLoadingScores}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </Box>
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        </GridItem>
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