import {
    SimpleGrid,
    Box,
    Text,
    HStack,
    Spinner,
    IconButton,
    useColorMode,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import type { IPagination } from "@/interfaces";

interface ScoresStatsCardsProps {
    pagination: IPagination | undefined;
    activeFiltersCount: number;
    isLoadingScores: boolean;
    onRefresh: () => void;
}

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    sub?: string;
    accent: string;
    isDark: boolean;
}

const StatCard = ({ label, value, sub, accent, isDark }: StatCardProps) => (
    <Box
        p={4}
        borderRadius="xl"
        bg={isDark ? 'gray.800' : 'white'}
        border="1px solid"
        borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
        borderLeftWidth="3px"
        borderLeftColor={accent}
        boxShadow={isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'}
    >
        <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
            textTransform="uppercase" color={accent} mb={2}>
            {label}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" lineHeight={1} mb={1}>
            {value}
        </Text>
        {sub && (
            <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mt={1}>
                {sub}
            </Text>
        )}
    </Box>
);

export const ScoresStatsCards = ({
    pagination,
    activeFiltersCount,
    isLoadingScores,
    onRefresh
}: ScoresStatsCardsProps) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    if (!pagination) return null;

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
            <StatCard
                label="Total des scores"
                value={pagination.totalCount.toLocaleString()}
                sub={activeFiltersCount > 0 ? `${activeFiltersCount} filtre(s) actif(s)` : 'Tous les scores'}
                accent="purple.400"
                isDark={isDark}
            />
            <StatCard
                label="Page actuelle"
                value={`${pagination.currentPage} / ${pagination.totalPages}`}
                sub={`${pagination.itemsOnPage} résultats affichés`}
                accent="indigo.400"
                isDark={isDark}
            />
            <Box
                p={4}
                borderRadius="xl"
                bg={isDark ? 'gray.800' : 'white'}
                border="1px solid"
                borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
                borderLeftWidth="3px"
                borderLeftColor={isLoadingScores ? 'orange.400' : 'green.400'}
                boxShadow={isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'}
            >
                <HStack justify="space-between" align="flex-start">
                    <Box>
                        <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
                            textTransform="uppercase"
                            color={isLoadingScores ? 'orange.400' : 'green.400'} mb={2}>
                            État
                        </Text>
                        <HStack spacing={2}>
                            {isLoadingScores
                                ? <><Spinner size="xs" color="orange.400" /><Text fontWeight="bold">Chargement…</Text></>
                                : <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>✓ À jour</Text>
                            }
                        </HStack>
                    </Box>
                    <IconButton
                        aria-label="Actualiser"
                        icon={<RepeatIcon />}
                        size="sm"
                        variant="ghost"
                        borderRadius="full"
                        onClick={onRefresh}
                        isLoading={isLoadingScores}
                        color={isDark ? 'gray.400' : 'gray.500'}
                        _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.100' }}
                    />
                </HStack>
            </Box>
        </SimpleGrid>
    );
};
