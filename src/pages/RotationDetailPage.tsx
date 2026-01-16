import {
    Container, VStack, HStack, Heading, Text, Box, Spinner,
    useColorModeValue, Button, Flex, Table, Thead, Tbody, Tr, Th, Td,
    TableContainer, useToast, Select, IconButton, Badge
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBackIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import type { IRotationTemplate, IScoreWithUser, IRankInfo } from "@/interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoreLegend } from "@/components/ui/ScoreLegend";
import { useGuilds, useRotationScores } from "@/hooks/useAPI";
import { RankBadge } from "@/components/ui/RankBadge";

const RotationDetailPage = () => {
    const { cycleId, position } = useParams<{ cycleId: string; position: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [scores, setScores] = useState<IScoreWithUser[]>([]);
    const [cycle, setCycle] = useState<string | null>(null);
    const [rotation, setRotation] = useState<IRotationTemplate | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    // Constante : chaque cycle a toujours 20 rotations
    const totalRotations = 20;
    
    // Utiliser les hooks API
    const { guilds, isLoading: isLoadingGuilds } = useGuilds();
    const { fetchRotationScores, isLoading, error: apiError } = useRotationScores();
    const [selectedGuild, setSelectedGuild] = useState<string>(''); // ID de la guilde ou vide pour "toutes"

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textSecondary = useColorModeValue('gray.700', 'gray.300');
    const shadowColor = useColorModeValue('lg', 'dark-lg');

    // Fonction pour obtenir le nom de la guilde à partir de l'ID
    const getGuildNameFromId = (guildId?: string): string | undefined => {
        if (!guildId) return undefined;
        const guild = guilds.find(g => g._id === guildId);
        return guild?.name;
    };

    const loadScores = async (guildFilter?: string) => {
        if (!cycleId || !position) return;

        // Trouver le nom de la guilde si un filtre est fourni
        let guildName: string | undefined;
        if (guildFilter) {
            const selectedGuildData = guilds.find(guild => guild._id === guildFilter);
            if (selectedGuildData) {
                guildName = selectedGuildData.name;
            }
        }

        const data = await fetchRotationScores(cycleId, position, {
            page: currentPage,
            limit: itemsPerPage,
            guildName,
        });

        if (data) {
            setScores(data.data);
            setCycle(data.cycle);
            setRotation(data.rotation);
            setCurrentPage(data.pagination?.currentPage || 1);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalItems(data.pagination?.totalItems || data.data?.length || 0);
        } else if (apiError) {
            toast({
                title: "Erreur",
                description: apiError,
                status: "error",
                duration: 5000
            });
        }
    };

    // Fonction pour créer les informations de rang basées sur le rang du serveur
    const getRankInfo = (rank: number): IRankInfo => {
        if (rank === 1) {
            // Or pour le #1
            return {
                rank: 1,
                color: "yellow.600",
                bgColor: "yellow.50",
                borderColor: "yellow.300"
            };
        } else if (rank === 2) {
            // Argent pour le #2
            return {
                rank: 2,
                color: "gray.600",
                bgColor: "gray.50",
                borderColor: "gray.300"
            };
        } else if (rank === 3) {
            // Bronze pour le #3
            return {
                rank: 3,
                color: "orange.600",
                bgColor: "orange.50",
                borderColor: "orange.300"
            };
        } else {
            // Pas de podium
            return {
                rank: rank,
                color: "gray.500",
                bgColor: "transparent",
                borderColor: "transparent"
            };
        }
    };

    useEffect(() => {
        if (cycleId && position) {
            loadScores(selectedGuild || undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cycleId, position, currentPage, itemsPerPage, selectedGuild]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(event.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset à la première page
    };

    const handleGuildChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newGuildId = event.target.value;
        setSelectedGuild(newGuildId);
        setCurrentPage(1); // Reset à la première page quand on change le filtre
        
        // Faire la requête API avec le nouveau filtre
        await loadScores(newGuildId);
    };

    const handlePreviousRotation = () => {
        const currentPosition = parseInt(position || '1');
        if (currentPosition > 1) {
            navigate(`/cycle/${cycleId}/rotation/${currentPosition - 1}`);
        }
    };

    const handleNextRotation = () => {
        const currentPosition = parseInt(position || '1');
        if (currentPosition < totalRotations) {
            navigate(`/cycle/${cycleId}/rotation/${currentPosition + 1}`);
        }
    };

    if (isLoading) {
        return (
            <Container maxW="container.xl" py={8}>
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" />
                </Flex>
            </Container>
        );
    }

    if (apiError) {
        return (
            <Container maxW="container.xl" py={8}>
                <VStack spacing={6} align="center">
                    <Text fontSize="xl" color="red.500">
                        {apiError}
                    </Text>
                    <Button
                        leftIcon={<ArrowBackIcon />}
                        colorScheme="blue"
                        onClick={() => navigate(-1)}
                    >
                        Retour
                    </Button>
                </VStack>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            Retour
                        </Button>
                        
                        <HStack spacing={2}>
                            <Button
                                leftIcon={<ChevronLeftIcon />}
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousRotation}
                                isDisabled={parseInt(position || '1') <= 1}
                            >
                                Précédente
                            </Button>
                            <Button
                                rightIcon={<ChevronRightIcon />}
                                variant="outline"
                                size="sm"
                                onClick={handleNextRotation}
                                isDisabled={parseInt(position || '1') >= totalRotations}
                            >
                                Suivante
                            </Button>
                        </HStack>
                    </HStack>
                    
                    <VStack align="start" spacing={2}>
                        <Heading size={{ base: "md", md: "lg" }}>
                            <VStack spacing={2} align="start">
                                <HStack spacing={2} align="center" flexWrap="wrap">
                                    <Text as="span">{cycle}</Text>
                                    <Text as="span" color={textSecondary}>-</Text>
                                    <Text as="span">Rotation #{position}</Text>
                                </HStack>
                                <HStack spacing={2} align="center" flexWrap="wrap">
                                    <Text as="span">{rotation?.killer}</Text>
                                    {rotation?.attack && <AttackTypeBadge attackType={rotation.attack} size="24px"/>}
                                </HStack>
                            </VStack>
                        </Heading>
                        <Text color={textSecondary} fontSize="sm">
                            {totalItems} score{totalItems > 1 ? 's' : ''} au total
                            {selectedGuild && (
                                <Text as="span" ml={2} fontSize="xs" color="blue.500">
                                    (filtré sur {guilds.find(g => g._id === selectedGuild)?.name})
                                </Text>
                            )}
                        </Text>
                    </VStack>
                </VStack>

                {/* Filtre des guildes */}
                <Box
                    bg={bgColor}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={4}
                >
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        gap={4}
                        align="center"
                        justify="space-between"
                    >
                        <HStack spacing={4} align="center" flex={1}>
                            <Text fontSize="sm" fontWeight="medium" minW="max-content">
                                Filtrer par guilde :
                            </Text>
                            <Select
                                value={selectedGuild}
                                onChange={handleGuildChange}
                                placeholder="Toutes les guildes"
                                size="sm"
                                maxW="300px"
                                isDisabled={isLoadingGuilds}
                            >
                                {guilds.map((guild) => (
                                    <option key={guild._id} value={guild._id}>
                                        {guild.name}
                                    </option>
                                ))}
                            </Select>
                        </HStack>
                        <Box>
                            <ScoreLegend />
                        </Box>
                    </Flex>
                </Box>

                {/* Scores Table */}
                <Box
                    bg={bgColor}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    boxShadow={shadowColor}
                    overflow="hidden"
                >
                    {scores.length === 0 ? (
                        <Flex justify="center" align="center" py={12}>
                            <Text fontSize="lg" color={textSecondary}>
                                {selectedGuild ? 
                                    `Aucun score trouvé pour la guilde ${guilds.find(g => g._id === selectedGuild)?.name}` :
                                    "Aucun score trouvé pour cette rotation"
                                }
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <TableContainer>
                                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                    <Thead>
                                        <Tr>
                                            <Th>Rang</Th>
                                            <Th>Joueur</Th>
                                            {!selectedGuild && <Th display={{ base: "none", md: "table-cell" }}>Guilde</Th>}
                                            <Th isNumeric>Score</Th>
                                            <Th display={{ base: "none", sm: "table-cell" }}>Date</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {scores.map((score) => {
                                            const rankInfo = getRankInfo(score.rank);
                                            
                                            return (
                                                <Tr 
                                                    key={score._id}
                                                    borderLeft={rankInfo.rank <= 3 ? "4px solid" : "none"}
                                                    borderLeftColor={rankInfo.borderColor}
                                                >
                                                    <Td>
                                                        <RankBadge rank={rankInfo.rank} variant="compact" />
                                                    </Td>
                                                    <Td>
                                                        <UserDisplay 
                                                            user={score.user} 
                                                            rainbowText={score.rank === 1}
                                                        />
                                                    </Td>
                                                    {!selectedGuild && (
                                                        <Td display={{ base: "none", md: "table-cell" }}>
                                                            {score.user.guilde_id && (
                                                                <Badge colorScheme="blue" fontSize="xs">
                                                                    {getGuildNameFromId(score.user.guilde_id)}
                                                                </Badge>
                                                            )}
                                                        </Td>
                                                    )}
                                                    <Td isNumeric>
                                                        <ScoreBadge score={score.score} />
                                                    </Td>
                                                    <Td display={{ base: "none", sm: "table-cell" }}>
                                                        <Text fontSize="sm" color={textSecondary}>
                                                            {new Date(score.created_at).toLocaleDateString('fr-FR')}
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            <VStack
                                spacing={4}
                                p={4}
                                borderTop="1px solid"
                                borderTopColor={borderColor}
                            >
                                {/* Controls row */}
                                <Flex
                                    justify="space-between"
                                    align="center"
                                    w="100%"
                                    flexWrap="wrap"
                                    gap={4}
                                >
                                    <HStack spacing={2}>
                                        <Text fontSize="sm" color={textSecondary}>
                                            Afficher
                                        </Text>
                                        <Select
                                            size="sm"
                                            value={itemsPerPage}
                                            onChange={handleItemsPerPageChange}
                                            w="auto"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </Select>
                                        <Text fontSize="sm" color={textSecondary} display={{ base: "none", sm: "block" }}>
                                            par page
                                        </Text>
                                    </HStack>

                                    <HStack spacing={2}>
                                        <IconButton
                                            aria-label="Page précédente"
                                            icon={<ChevronLeftIcon />}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            isDisabled={currentPage <= 1}
                                        />
                                        <Text fontSize="sm" color={textSecondary} whiteSpace="nowrap">
                                            {currentPage}/{totalPages}
                                        </Text>
                                        <IconButton
                                            aria-label="Page suivante"
                                            icon={<ChevronRightIcon />}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            isDisabled={currentPage >= totalPages}
                                        />
                                    </HStack>
                                </Flex>

                                {/* Info row - hidden on very small screens */}
                                <Text fontSize="sm" color={textSecondary} textAlign="center" display={{ base: "none", md: "block" }}>
                                    {selectedGuild ? (
                                        `Affichage de ${totalItems} résultat${totalItems > 1 ? 's' : ''} pour ${guilds.find(g => g._id === selectedGuild)?.name}`
                                    ) : (
                                        `${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)} sur ${totalItems}`
                                    )}
                                </Text>
                            </VStack>
                        </>
                    )}
                </Box>
            </VStack>
        </Container>
    );
};

export default RotationDetailPage;