import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Select,
    Card,
    CardBody,
    Badge,
    Flex,
    Spinner,
    useColorModeValue,
    Alert,
    AlertIcon
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { UserDisplay } from "./ui/UserDisplay";

interface PodiumPlayer {
    rank: number;
    user_id: string;
    bbs_name: string;
    discord_id: string;
    global_name: string;
    averageScore: number;
    totalScores: number;
    avatar: string;
}

interface PodiumData {
    success: boolean;
    podium: PodiumPlayer[];
    filters: {
        cycle_id: string;
        guild_id: string | null;
    };
    meta: {
        totalPlayers: number;
        cycleId: string;
        guildSpecific: boolean;
    };
}

interface Guild {
    _id: string;
    name: string;
}

interface Cycle {
    _id: string;
    name: string;
    created_at?: string;
}

interface PodiumSectionProps {
    // Props optionnelles pour les tests
}

export const PodiumSection = ({}: PodiumSectionProps = {}) => {
    const [podiumData, setPodiumData] = useState<PodiumData | null>(null);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState<string>("");
    const [selectedGuildId, setSelectedGuildId] = useState<string>("global");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API URL depuis les variables d'environnement
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Fonction utilitaire pour les requêtes authentifiées
    const authenticatedFetch = (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('userToken');
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
        });
    };

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const shadowColor = useColorModeValue('lg', 'dark-lg');

    // Charger les cycles et guildes au montage
    useEffect(() => {
        const loadInitialData = async () => {
            if (!apiUrl) {
                setError('Configuration API manquante');
                return;
            }

            try {
                // Charger les cycles
                const cyclesResponse = await authenticatedFetch(`${apiUrl}/api/cycles?limit=50`);
                const cyclesData = await cyclesResponse.json();
                
                let cyclesToProcess = [];
                
                // La réponse peut être un tableau directement ou un objet avec success
                if (Array.isArray(cyclesData)) {
                    cyclesToProcess = cyclesData;
                } else if (cyclesData.success && cyclesData.data) {
                    cyclesToProcess = cyclesData.data;
                }
                
                if (cyclesToProcess.length > 0) {
                    // Trier par date de création décroissante pour avoir le plus récent en premier
                    const sortedCycles = cyclesToProcess.sort((a: Cycle, b: Cycle) => {
                        if (a.created_at && b.created_at) {
                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        }
                        return 0;
                    });
                    setCycles(sortedCycles);
                    
                    // Sélectionner le cycle le plus récent par défaut
                    if (sortedCycles.length > 0) {
                        setSelectedCycleId(sortedCycles[0]._id);
                    }
                }

                // Charger les guildes
                const guildsResponse = await authenticatedFetch(`${apiUrl}/api/guildes`);
                const guildsData = await guildsResponse.json();
                
                // La réponse peut être un tableau directement ou un objet avec success
                if (Array.isArray(guildsData)) {
                    setGuilds(guildsData);
                } else if (guildsData.success) {
                    const guildsArray = guildsData.data || guildsData.guilds || [];
                    setGuilds(guildsArray);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données initiales:', error);
                setError('Erreur lors du chargement des données');
            }
        };

        loadInitialData();
    }, [apiUrl]);

    const loadPodium = async () => {
        if (!selectedCycleId || !apiUrl) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                cycle_id: selectedCycleId
            });

            // Ajouter guild_id seulement si ce n'est pas "global"
            if (selectedGuildId !== "global") {
                params.append('guild_id', selectedGuildId);
            }

            const response = await authenticatedFetch(`${apiUrl}/api/users/podium?${params.toString()}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setPodiumData(data);
            } else {
                setError(data.message || 'Erreur lors du chargement du podium');
            }
        } catch (error) {
            console.error('Erreur lors du chargement du podium:', error);
            setError('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    // Charger le podium quand les filtres changent
    useEffect(() => {
        if (selectedCycleId) {
            loadPodium();
        }
    }, [selectedCycleId, selectedGuildId]);

    const getRankDisplay = (rank: number) => {
        const medals = {
            1: { emoji: "🥇", color: "yellow", bg: "yellow.50" },
            2: { emoji: "🥈", color: "gray", bg: "gray.50" },
            3: { emoji: "🥉", color: "orange", bg: "orange.50" }
        };

        const medal = medals[rank as keyof typeof medals];
        
        if (medal) {
            return (
                <HStack spacing={2}>
                    <Text fontSize="xl">{medal.emoji}</Text>
                    <Badge 
                        colorScheme={medal.color} 
                        variant="solid" 
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                    >
                        #{rank}
                    </Badge>
                </HStack>
            );
        }

        return (
            <Badge 
                variant="outline" 
                colorScheme="gray" 
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
            >
                #{rank}
            </Badge>
        );
    };

    const selectedCycle = cycles.find(cycle => cycle._id === selectedCycleId);
    const selectedGuild = guilds.find(guild => guild._id === selectedGuildId);

    return (
        <Box
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow={shadowColor}
            p={6}
            w="100%"
            maxW="80%"
            mx="auto"
        >
            <VStack spacing={6} align="stretch">
                {/* En-tête */}
                <VStack spacing={4} textAlign="center">
                    <Heading size="lg">
                        🏆 Podium des Joueurs
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                        Classement basé sur la moyenne des scores par cycle
                    </Text>
                </VStack>

                {/* Filtres */}
                <HStack spacing={4} flexWrap="wrap">
                    {/* Sélection du cycle */}
                    <VStack align="start" spacing={1} flex={1} minW="200px">
                        <Text fontSize="sm" fontWeight="medium" color="gray.600">
                            Cycle
                        </Text>
                        <Select
                            value={selectedCycleId}
                            onChange={(e) => setSelectedCycleId(e.target.value)}
                            size="sm"
                        >
                            <option value="">Sélectionner un cycle</option>
                            {cycles.map((cycle) => (
                                <option key={cycle._id} value={cycle._id}>
                                    {cycle.name}
                                </option>
                            ))}
                        </Select>
                    </VStack>

                    {/* Sélection du scope */}
                    <VStack align="start" spacing={1} flex={1} minW="200px">
                        <Text fontSize="sm" fontWeight="medium" color="gray.600">
                            Scope
                        </Text>
                        <Select
                            value={selectedGuildId}
                            onChange={(e) => setSelectedGuildId(e.target.value)}
                            size="sm"
                        >
                            <option value="global">🌍 Global (Toutes les guildes)</option>
                            {guilds.map((guild) => (
                                <option key={guild._id} value={guild._id}>
                                    🏰 {guild.name}
                                </option>
                            ))}
                        </Select>
                    </VStack>
                </HStack>

                {/* Informations du filtre actuel */}
                {selectedCycle && (
                    <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <VStack align="start" spacing={0} fontSize="sm">
                            <Text>
                                <strong>Cycle:</strong> {selectedCycle.name}
                            </Text>
                            <Text>
                                <strong>Scope:</strong> {selectedGuildId === "global" ? "Global" : selectedGuild?.name}
                            </Text>
                        </VStack>
                    </Alert>
                )}

                {/* Contenu du podium */}
                {!selectedCycleId ? (
                    <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text>Veuillez sélectionner un cycle pour afficher le podium</Text>
                    </Alert>
                ) : error ? (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Text>{error}</Text>
                    </Alert>
                ) : isLoading ? (
                    <Flex justify="center" align="center" py={8}>
                        <VStack spacing={3}>
                            <Spinner size="lg" />
                            <Text>Chargement du podium...</Text>
                        </VStack>
                    </Flex>
                ) : podiumData && podiumData.podium.length > 0 ? (
                    podiumData.podium.length === 10 ? (
                        // Affichage 2 colonnes pour 10 joueurs en desktop
                        <HStack 
                            spacing={4} 
                            align="start" 
                            flexDirection={{ base: "column", lg: "row" }}
                        >
                            {/* Première colonne (Top 5) */}
                            <VStack spacing={3} align="stretch" flex={1}>
                                {podiumData.podium.slice(0, 5).map((player) => (
                                    <Card key={player.user_id} variant="outline">
                                        <CardBody p={4}>
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    {getRankDisplay(player.rank)}
                                                    <UserDisplay 
                                                        user={{
                                                            _id: player.user_id,
                                                            username: player.global_name,
                                                            global_name: player.global_name,
                                                            discord_id: player.discord_id,
                                                            bbs_name: player.bbs_name,
                                                            avatar: player.avatar,
                                                            guilde_id: '',
                                                            role: 'membre'
                                                        }}
                                                    />
                                                </HStack>
                                                <VStack spacing={1} align="end">
                                                    <Badge 
                                                        colorScheme="blue" 
                                                        variant="solid"
                                                        fontSize="md"
                                                        px={3}
                                                        py={1}
                                                    >
                                                        {player.averageScore.toLocaleString()} pts
                                                    </Badge>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {player.totalScores} score{player.totalScores > 1 ? 's' : ''}
                                                    </Text>
                                                </VStack>
                                            </Flex>
                                        </CardBody>
                                    </Card>
                                ))}
                            </VStack>

                            {/* Deuxième colonne (Places 6-10) */}
                            <VStack spacing={3} align="stretch" flex={1}>
                                {podiumData.podium.slice(5, 10).map((player) => (
                                    <Card key={player.user_id} variant="outline">
                                        <CardBody p={4}>
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    {getRankDisplay(player.rank)}
                                                    <UserDisplay 
                                                        user={{
                                                            _id: player.user_id,
                                                            username: player.global_name,
                                                            global_name: player.global_name,
                                                            discord_id: player.discord_id,
                                                            bbs_name: player.bbs_name,
                                                            avatar: player.avatar,
                                                            guilde_id: '',
                                                            role: 'membre'
                                                        }}
                                                    />
                                                </HStack>
                                                <VStack spacing={1} align="end">
                                                    <Badge 
                                                        colorScheme="blue" 
                                                        variant="solid"
                                                        fontSize="md"
                                                        px={3}
                                                        py={1}
                                                    >
                                                        {player.averageScore.toLocaleString()} pts
                                                    </Badge>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {player.totalScores} score{player.totalScores > 1 ? 's' : ''}
                                                    </Text>
                                                </VStack>
                                            </Flex>
                                        </CardBody>
                                    </Card>
                                ))}
                            </VStack>
                        </HStack>
                    ) : (
                        // Affichage colonne unique pour moins de 10 joueurs
                        <VStack spacing={3} align="stretch">
                            {podiumData.podium.map((player) => (
                                <Card key={player.user_id} variant="outline">
                                    <CardBody p={4}>
                                        <Flex justify="space-between" align="center">
                                            <HStack spacing={4}>
                                                {getRankDisplay(player.rank)}
                                                <UserDisplay 
                                                    user={{
                                                        _id: player.user_id,
                                                        username: player.global_name,
                                                        global_name: player.global_name,
                                                        discord_id: player.discord_id,
                                                        bbs_name: player.bbs_name,
                                                        avatar: player.avatar,
                                                        guilde_id: '',
                                                        role: 'membre'
                                                    }}
                                                />
                                            </HStack>
                                            <VStack spacing={1} align="end">
                                                <Badge 
                                                    colorScheme="blue" 
                                                    variant="solid"
                                                    fontSize="md"
                                                    px={3}
                                                    py={1}
                                                >
                                                    {player.averageScore.toLocaleString()} pts
                                                </Badge>
                                                <Text fontSize="xs" color="gray.500">
                                                    {player.totalScores} score{player.totalScores > 1 ? 's' : ''}
                                                </Text>
                                            </VStack>
                                        </Flex>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    )
                ) : (
                    <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Text>Aucun score trouvé pour ce cycle</Text>
                    </Alert>
                )}

                {/* Stats supplémentaires */}
                {podiumData && selectedCycleId && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                        {podiumData.meta.totalPlayers} joueur{podiumData.meta.totalPlayers > 1 ? 's' : ''} au total
                    </Text>
                )}
            </VStack>
        </Box>
    );
};