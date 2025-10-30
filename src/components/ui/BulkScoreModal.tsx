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
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    Divider,
    Box,
    Avatar,
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
import { getDiscordAvatarUrl } from "../../utils/discord";
import { getAttackTypeName } from "@/utils/attackTypes";

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
                console.error('Erreur lors du chargement des membres:', error);
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
            score: scores[member._id] || 0
        }));

        onSubmit(scoresData);
    };

    const handleClose = () => {
        setSelectedGuildId("");
        setSelectedCycleId("");
        setSelectedRotationId("");
        setGuildMembers([]);
        setScores({});
        onClose();
    };

    const canSubmit = selectedGuildId && selectedCycleId && selectedRotationId && guildMembers.length > 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Saisie groupée des scores</ModalHeader>
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {/* Sélection de la guilde */}
                        <FormControl>
                            <FormLabel>Guilde</FormLabel>
                            <Select
                                placeholder="Sélectionnez une guilde"
                                value={selectedGuildId}
                                onChange={(e) => setSelectedGuildId(e.target.value)}
                                isDisabled={isSubmitting}
                            >
                                {guilds.map((guild: Guild) => (
                                    <option key={guild._id} value={guild._id}>
                                        {guild.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Sélection du cycle */}
                        <FormControl>
                            <FormLabel>Cycle</FormLabel>
                            <Select
                                placeholder="Sélectionnez un cycle"
                                value={selectedCycleId}
                                onChange={(e) => setSelectedCycleId(e.target.value)}
                                isDisabled={isSubmitting}
                            >
                                {cycles.map((cycle: Cycle) => (
                                    <option key={cycle._id} value={cycle._id}>
                                        {cycle.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Sélection de la rotation */}
                        {selectedCycle && (
                            <FormControl>
                                <FormLabel>Rotation</FormLabel>
                                <Select
                                    placeholder="Sélectionnez une rotation"
                                    value={selectedRotationId}
                                    onChange={(e) => setSelectedRotationId(e.target.value)}
                                    isDisabled={isSubmitting}
                                >
                                    {selectedCycle.rotations.map((rotation: any, index: number) => (
                                        <option key={rotation._id} value={rotation._id}>
                                            <Box>Rotation #{index + 1} - {rotation.killer} - {getAttackTypeName(rotation.attack)} - ({rotation.start_date} - {rotation.end_date})</Box>
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Informations de la sélection */}
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
                        ) : guildMembers.length > 0 ? (
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>
                                    Saisie des scores ({guildMembers.length} membres)
                                </Text>
                                <Grid templateColumns="repeat(auto-fill, 320px)" gap={4} justifyContent="center">
                                    {guildMembers.map((member: User) => (
                                        <GridItem key={member._id}>
                                            <Card h="120px">
                                                <CardBody p={3}>
                                                    <VStack spacing={3} h="full">
                                                        <HStack spacing={3} w="full">
                                                            <Avatar
                                                                size="sm"
                                                                src={getDiscordAvatarUrl(member.discordId || member.discord_id || '', member.avatar || '') || undefined}
                                                                name={member.global_name || member.username}
                                                            />
                                                            <VStack align="start" spacing={1} flex={1}>
                                                                <Text 
                                                                    fontWeight="medium" 
                                                                    fontSize="sm"
                                                                    noOfLines={1}
                                                                    title={member.global_name || member.username}
                                                                    w="full"
                                                                >
                                                                    {member.global_name || member.username}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                                                                    {member.role}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                        <Box w="full">
                                                            <NumberInput
                                                                size="sm"
                                                                min={0}
                                                                max={9999999999}
                                                                value={scores[member._id] || 0}
                                                                onChange={(_, value) => handleScoreChange(member._id, value)}
                                                                isDisabled={isSubmitting}
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