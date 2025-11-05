import {
    Container, VStack, Heading, Text, Flex, Select, InputGroup, InputLeftElement,
    Input, Button, Box, Badge, HStack, Spinner, useColorModeValue, useToast
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import ScoresTable from "../components/ui/ScoresTable";
import { Pagination as PaginationComponent } from "../components/ui/Pagination";
import type { Score, User, Cycle, Guild, Pagination, ScoresResponse } from "../interfaces";

const ScoresPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const toast = useToast();

    // États
    const [scores, setScores] = useState<Score[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filtres
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [selectedCycleId, setSelectedCycleId] = useState(searchParams.get('cycle_id') || "");
    const [selectedGuildId, setSelectedGuildId] = useState(searchParams.get('guild_id') || "");
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '20'));

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const filterBg = useColorModeValue('blue.50', 'blue.900');

    // Fonction pour mettre à jour l'URL avec les filtres actuels
    const updateURLParams = (search = "", cycleId = "", guildId = "", limit = itemsPerPage, page = 1) => {
        const params = new URLSearchParams();

        if (search.trim()) params.set('search', search.trim());
        if (cycleId) params.set('cycle_id', cycleId);
        if (guildId) params.set('guild_id', guildId);
        if (limit !== 20) params.set('limit', limit.toString());
        if (page !== 1) params.set('page', page.toString());

        setSearchParams(params);
    };

    // Fonction pour charger les scores
    const loadScores = async (page = 1, search = "", cycleId = "", guildId = "") => {
        setIsLoading(true);
        try {
            let url = `${apiUrl}/api/scores?page=${page}&limit=${itemsPerPage}`;

            if (search && search.trim() !== "") {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }
            if (cycleId && cycleId.trim() !== "") {
                url += `&cycle_id=${encodeURIComponent(cycleId.trim())}`;
            }
            if (guildId && guildId.trim() !== "") {
                url += `&guild_id=${encodeURIComponent(guildId.trim())}`;
            }

            const response = await fetch(url);

            if (response.ok) {
                const data: ScoresResponse = await response.json();
                setScores(data.data || []);
                setPagination(data.pagination);
            } else {
                setScores([]);
                setPagination(null);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les scores",
                    status: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            setScores([]);
            setPagination(null);
            toast({
                title: "Erreur",
                description: "Erreur lors du chargement des scores",
                status: "error",
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour charger les données de référence
    const loadReferenceData = async () => {
        try {
            // Charger les utilisateurs
            const usersResponse = await fetch(`${apiUrl}/api/users?limit=1000`);
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);
            }

            // Charger les cycles
            const cyclesResponse = await fetch(`${apiUrl}/api/cycles`);
            if (cyclesResponse.ok) {
                const cyclesData = await cyclesResponse.json();
                setCycles(cyclesData.data || []);
            }

            // Charger les guildes
            const guildsResponse = await fetch(`${apiUrl}/api/guildes`);
            if (guildsResponse.ok) {
                const guildsData = await guildsResponse.json();
                setGuilds(Array.isArray(guildsData) ? guildsData : guildsData.guilds || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données de référence:', error);
        }
    };

    // Chargement initial
    useEffect(() => {
        const currentPage = parseInt(searchParams.get('page') || '1');
        const currentSearch = searchParams.get('search') || '';
        const currentCycleId = searchParams.get('cycle_id') || '';
        const currentGuildId = searchParams.get('guild_id') || '';

        setSearchTerm(currentSearch);
        setSelectedCycleId(currentCycleId);
        setSelectedGuildId(currentGuildId);

        loadScores(currentPage, currentSearch, currentCycleId, currentGuildId);
        loadReferenceData();
    }, []);

    // Effet pour la recherche automatique avec debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const currentSearchFromURL = searchParams.get('search') || '';
            if (searchTerm !== currentSearchFromURL) {
                loadScores(1, searchTerm, selectedCycleId, selectedGuildId);
                updateURLParams(searchTerm, selectedCycleId, selectedGuildId, itemsPerPage, 1);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Gestionnaires d'événements
    const handleCycleChange = (cycleId: string) => {
        setSelectedCycleId(cycleId);
        loadScores(1, searchTerm, cycleId, selectedGuildId);
        updateURLParams(searchTerm, cycleId, selectedGuildId, itemsPerPage, 1);
    };

    const handleGuildChange = (guildId: string) => {
        setSelectedGuildId(guildId);
        loadScores(1, searchTerm, selectedCycleId, guildId);
        updateURLParams(searchTerm, selectedCycleId, guildId, itemsPerPage, 1);
    };

    const handlePageChange = (page: number) => {
        loadScores(page, searchTerm, selectedCycleId, selectedGuildId);
        updateURLParams(searchTerm, selectedCycleId, selectedGuildId, itemsPerPage, page);
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        loadScores(1, searchTerm, selectedCycleId, selectedGuildId);
        updateURLParams(searchTerm, selectedCycleId, selectedGuildId, newLimit, 1);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedCycleId("");
        setSelectedGuildId("");
        setSearchParams({});
        loadScores(1);
    };

    // Obtenir le nom de la guilde
    const getGuildName = (guildId: string) => {
        const guild = guilds.find(g => g._id === guildId);
        return guild?.name || "Guilde inconnue";
    };

    // Obtenir le nom du cycle
    const getCycleName = (cycleId: string) => {
        const cycle = cycles.find(c => c._id === cycleId);
        return cycle?.name || "Cycle inconnu";
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                {/* En-tête */}
                <VStack spacing={2} textAlign="center">
                    <Heading size="xl">Scores des Joueurs</Heading>
                    <Text color="gray.600">
                        Consultez les scores de tous les joueurs par cycle et rotation
                    </Text>
                </VStack>

                {/* Contrôles de filtrage */}
                <VStack spacing={4} align="stretch">
                    {/* Première ligne - Recherche */}
                    <Flex justify="center">
                        <InputGroup maxW="500px">
                            <InputLeftElement pointerEvents="none">
                                {isLoading ? (
                                    <Spinner size="sm" color="blue.500" />
                                ) : (
                                    <SearchIcon color="gray.300" />
                                )}
                            </InputLeftElement>
                            <Input
                                placeholder="Rechercher un joueur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Flex>

                    {/* Deuxième ligne - Filtres */}
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        gap={4}
                        justify="center"
                        align="center"
                        wrap="wrap"
                    >
                        {/* Filtre par cycle */}
                        <Select
                            placeholder="Tous les cycles"
                            value={selectedCycleId}
                            onChange={(e) => handleCycleChange(e.target.value)}
                            maxW="200px"
                        >
                            {cycles.map((cycle) => (
                                <option key={cycle._id} value={cycle._id}>
                                    {cycle.name}
                                </option>
                            ))}
                        </Select>

                        {/* Filtre par guilde */}
                        <Select
                            placeholder="Toutes les guildes"
                            value={selectedGuildId}
                            onChange={(e) => handleGuildChange(e.target.value)}
                            maxW="200px"
                        >
                            {guilds.map((guild) => (
                                <option key={guild._id} value={guild._id}>
                                    {guild.name}
                                </option>
                            ))}
                        </Select>

                        {/* Éléments par page */}
                        <Select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                            maxW="120px"
                        >
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                        </Select>

                        <Button onClick={resetFilters} variant="outline" minW="120px">
                            Réinitialiser
                        </Button>
                    </Flex>
                </VStack>

                {/* Filtres actifs */}
                {(searchTerm || selectedCycleId || selectedGuildId) && (
                    <Box p={3} bg={filterBg} borderRadius="md">
                        <HStack spacing={2} flexWrap="wrap">
                            <Text fontSize="sm" fontWeight="medium">Filtres actifs:</Text>
                            {searchTerm && (
                                <Badge colorScheme="blue">
                                    Recherche: {searchTerm}
                                </Badge>
                            )}
                            {selectedCycleId && (
                                <Badge colorScheme="green">
                                    Cycle: {getCycleName(selectedCycleId)}
                                </Badge>
                            )}
                            {selectedGuildId && (
                                <Badge colorScheme="orange">
                                    Guilde: {getGuildName(selectedGuildId)}
                                </Badge>
                            )}
                        </HStack>
                    </Box>
                )}

                {/* Informations sur les résultats */}
                {pagination && (
                    <Text fontSize="sm" color="gray.600">
                        {pagination.totalCount} score(s) trouvé(s) -
                        Page {pagination.currentPage} sur {pagination.totalPages} -
                        Affichage de {pagination.itemsOnPage} résultat(s)
                    </Text>
                )}

                {/* Tableau des scores */}
                <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                    {isLoading ? (
                        <Flex justify="center" p={8}>
                            <Spinner size="lg" />
                        </Flex>
                    ) : (
                        <ScoresTable
                            scores={scores}
                            users={users}
                            cycles={cycles}
                            isAdmin={false} // Pas de mode admin sur la page publique
                            onEditScore={() => {}} // Fonction vide car pas utilisée
                            onDeleteScore={() => {}} // Fonction vide car pas utilisée
                        />
                    )}
                </Box>

                {/* Pagination */}
                {pagination && (
                    <PaginationComponent
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        hasPrevPage={pagination.hasPrevPage}
                        hasNextPage={pagination.hasNextPage}
                        onPageChange={handlePageChange}
                        totalCount={pagination.totalCount}
                        itemsOnPage={pagination.itemsOnPage}
                    />
                )}

                {/* Message si aucun résultat */}
                {!isLoading && scores.length === 0 && (
                    <Text textAlign="center" color="gray.500" py={8}>
                        Aucun score trouvé
                    </Text>
                )}
            </VStack>
        </Container>
    );
};

export default ScoresPage;