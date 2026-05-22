import {
    Box,
    Flex,
    SimpleGrid,
    Skeleton,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import type { IPagination } from "@/interfaces";

interface ScoresStatsCardsProps {
    pagination: IPagination | undefined;
    activeFiltersCount: number;
    isLoading?: boolean;
}

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    sub?: string;
    icon: string;
    accentColor: string;
    isLoading?: boolean;
}

const StatCard = ({ label, value, sub, icon, accentColor, isLoading }: StatCardProps) => {
    const cardBg      = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const mutedText   = useColorModeValue("gray.500", "gray.400");

    return (
        <Box
            p={4}
            borderRadius="xl"
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderLeftWidth="3px"
            borderLeftColor={accentColor}
            position="relative"
            overflow="hidden"
        >
            {/* Icône décorative en fond */}
            <Text
                position="absolute"
                right={3}
                top={3}
                fontSize="2xl"
                opacity={0.12}
                userSelect="none"
            >
                {icon}
            </Text>

            <Text
                fontSize="2xs"
                fontWeight="semibold"
                letterSpacing="widest"
                textTransform="uppercase"
                color={accentColor}
                mb={2}
            >
                {label}
            </Text>

            {isLoading ? (
                <>
                    <Skeleton h="28px" w="80px" mb={1} borderRadius="md" />
                    <Skeleton h="14px" w="120px" borderRadius="md" />
                </>
            ) : (
                <>
                    <Text fontSize="2xl" fontWeight="bold" lineHeight={1} mb={1}>
                        {value}
                    </Text>
                    {sub && (
                        <Text fontSize="xs" color={mutedText}>
                            {sub}
                        </Text>
                    )}
                </>
            )}
        </Box>
    );
};

export const ScoresStatsCards = ({
    pagination,
    activeFiltersCount,
    isLoading = false,
}: ScoresStatsCardsProps) => {

    const showLoading = isLoading || !pagination;

    // Calcul du % affiché sur la page actuelle
    const pageProgress = pagination
        ? Math.round((pagination.currentPage / pagination.totalPages) * 100)
        : 0;

    return (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <StatCard
                label="Total"
                value={pagination?.totalCount.toLocaleString("fr-FR") ?? "—"}
                sub={activeFiltersCount > 0 ? `${activeFiltersCount} filtre${activeFiltersCount > 1 ? "s" : ""} actif${activeFiltersCount > 1 ? "s" : ""}` : "Tous les scores"}
                icon="📊"
                accentColor="purple.400"
                isLoading={showLoading}
            />
            <StatCard
                label="Page"
                value={pagination ? `${pagination.currentPage} / ${pagination.totalPages}` : "—"}
                sub={pagination ? `${pagination.itemsOnPage} résultat${pagination.itemsOnPage > 1 ? "s" : ""} affichés` : undefined}
                icon="📄"
                accentColor="indigo.400"
                isLoading={showLoading}
            />
            <StatCard
                label="Progression"
                value={showLoading ? "—" : `${pageProgress} %`}
                sub="de la liste parcourue"
                icon="📈"
                accentColor="blue.400"
                isLoading={showLoading}
            />
            <StatCard
                label="Par page"
                value={pagination ? pagination.itemsOnPage.toString() : "—"}
                sub={pagination ? `sur ${pagination.totalCount.toLocaleString("fr-FR")} au total` : undefined}
                icon="🔢"
                accentColor="cyan.400"
                isLoading={showLoading}
            />
        </SimpleGrid>
    );
};
