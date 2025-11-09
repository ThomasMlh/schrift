import {
    Container, VStack, HStack, Heading, Text, Box, Badge, Spinner,
    useColorModeValue, Button, Flex, Table, Thead, Tbody, Tr, Th, Td,
    TableContainer, useToast, Select, IconButton
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBackIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import type { RotationTemplate } from "@/interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { getScoreDisplayValue } from "@/utils/scores";

interface Score {
    _id: string;
    user_id: string;
    score: number;
    user: {
        _id: string;
        username: string;
        global_name: string;
        bbs_id: string;
        bbs_name: string;
        avatar: string | null;
        discord_id: string;
        role: string;
    };
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    success: boolean;
    data: Score[];
    cycle: string;
    rotation: RotationTemplate | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

interface RankInfo {
    rank: number;
    color: string;
    bgColor: string;
    borderColor: string;
}

const RotationDetailPage = () => {
    const { cycleId, position } = useParams<{ cycleId: string; position: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [scores, setScores] = useState<Score[]>([]);
    const [cycle, setCycle] = useState<string | null>(null);
    const [rotation, setRotation] = useState<RotationTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const shadowColor = useColorModeValue('lg', 'dark-lg');

    // Fonction pour calculer le rang avec gestion des égalités
    const calculateRanks = (scores: Score[]): Map<string, RankInfo> => {
        const rankMap = new Map<string, RankInfo>();
        
        // Grouper les scores par valeur
        const scoreGroups = new Map<number, Score[]>();
        scores.forEach(score => {
            if (!scoreGroups.has(score.score)) {
                scoreGroups.set(score.score, []);
            }
            scoreGroups.get(score.score)!.push(score);
        });

        // Trier les scores de manière décroissante
        const sortedScores = Array.from(scoreGroups.keys()).sort((a, b) => b - a);
        
        let currentRank = 1;
        sortedScores.forEach((scoreValue, index) => {
            const scoresWithThisValue = scoreGroups.get(scoreValue)!;
            
            let rankInfo: RankInfo;
            if (currentRank === 1) {
                // Or pour le #1
                rankInfo = {
                    rank: 1,
                    color: "yellow.600",
                    bgColor: "yellow.50",
                    borderColor: "yellow.300"
                };
            } else if (currentRank === 2 || (currentRank > 2 && index === 1)) {
                // Argent pour le #2 (ou le 2e meilleur score unique)
                rankInfo = {
                    rank: 2,
                    color: "gray.600",
                    bgColor: "gray.50",
                    borderColor: "gray.300"
                };
            } else if (currentRank === 3 || (currentRank > 3 && index === 2)) {
                // Bronze pour le #3 (ou le 3e meilleur score unique)
                rankInfo = {
                    rank: 3,
                    color: "orange.600",
                    bgColor: "orange.50",
                    borderColor: "orange.300"
                };
            } else {
                // Pas de podium
                rankInfo = {
                    rank: currentRank,
                    color: "gray.500",
                    bgColor: "transparent",
                    borderColor: "transparent"
                };
            }

            scoresWithThisValue.forEach(score => {
                rankMap.set(score._id, rankInfo);
            });

            currentRank += scoresWithThisValue.length;
        });

        return rankMap;
    };

    useEffect(() => {
        if (cycleId && position) {
            loadScores();
        }
    }, [cycleId, position, currentPage, itemsPerPage]);

    const loadScores = async () => {
        if (!cycleId || !position) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${apiUrl}/api/cycles/${cycleId}/rotations/${position}/scores?page=${currentPage}&limit=${itemsPerPage}`
            );
            
            if (response.ok) {
                const data: ApiResponse = await response.json();
                setScores(data.data);
                setCycle(data.cycle);
                setRotation(data.rotation);
                setCurrentPage(data.pagination?.currentPage || 1);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalItems(data.pagination?.totalItems || data.data?.length || 0);
            } else if (response.status === 404) {
                setError("Rotation introuvable");
            } else {
                setError("Erreur lors du chargement des scores");
            }
        } catch (error) {
            setError("Erreur de connexion");
            toast({
                title: "Erreur",
                description: "Impossible de charger les scores de la rotation",
                status: "error",
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

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

    const renderRankBadge = (rankInfo: RankInfo) => {
        if (rankInfo.rank <= 3) {
            const symbols = { 1: "🥇", 2: "🥈", 3: "🥉" };
            return (
                <Badge
                    colorScheme={rankInfo.rank === 1 ? "yellow" : rankInfo.rank === 2 ? "gray" : "orange"}
                    variant="solid"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                >
                    {symbols[rankInfo.rank as keyof typeof symbols]} #{rankInfo.rank}
                </Badge>
            );
        } else {
            return (
                <Badge
                    variant="outline"
                    colorScheme="gray"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                >
                    #{rankInfo.rank}
                </Badge>
            );
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

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <VStack spacing={6} align="center">
                    <Text fontSize="xl" color="red.500">
                        {error}
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

    const ranksMap = calculateRanks(scores);

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between" align="center" flexWrap="wrap">
                    <VStack align="start" spacing={1}>
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            Retour
                        </Button>
                        <Heading size="lg">
                            <HStack spacing={2} align="center">
                                <Text as="span">{cycle} - Rotation #{position} - {rotation?.killer}</Text>
                                {rotation?.attack && <AttackTypeBadge attackType={rotation.attack} size="24px"/>}
                                <Text as="span"> - Classement</Text>
                            </HStack>
                        </Heading>
                        <Text color="gray.500" fontSize="sm">
                            {totalItems} score{totalItems > 1 ? 's' : ''} au total
                        </Text>
                    </VStack>
                </HStack>

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
                            <Text fontSize="lg" color="gray.500">
                                Aucun score trouvé pour cette rotation
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Rang</Th>
                                            <Th>Joueur</Th>
                                            <Th isNumeric>Score</Th>
                                            <Th>Date</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {scores.map((score) => {
                                            const rankInfo = ranksMap.get(score._id)!;
                                            
                                            return (
                                                <Tr 
                                                    key={score._id}
                                                    borderLeft={rankInfo.rank <= 3 ? "4px solid" : "none"}
                                                    borderLeftColor={rankInfo.borderColor}
                                                >
                                                    <Td>
                                                        {renderRankBadge(rankInfo)}
                                                    </Td>
                                                    <Td>
                                                        <UserDisplay user={score.user} />
                                                    </Td>
                                                    <Td isNumeric>
                                                        <Badge colorScheme={getScoreDisplayValue(score.score)} fontWeight="bold" fontSize={"medium"}>
                                                            {score.score.toLocaleString()}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" color="gray.500">
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
                            <Flex
                                justify="space-between"
                                align="center"
                                p={4}
                                borderTop="1px solid"
                                borderTopColor={borderColor}
                                flexWrap="wrap"
                                gap={4}
                            >
                                <HStack spacing={2}>
                                    <Text fontSize="sm" color="gray.500">
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
                                    <Text fontSize="sm" color="gray.500">
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
                                    <Text fontSize="sm" color="gray.500">
                                        Page {currentPage} sur {totalPages}
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

                                <Text fontSize="sm" color="gray.500">
                                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
                                </Text>
                            </Flex>
                        </>
                    )}
                </Box>
            </VStack>
        </Container>
    );
};

export default RotationDetailPage;