import {
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    HStack,
    Spinner,
    Text,
    Badge,
    Button
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import type { IPagination } from "@/interfaces";

interface ScoresStatsCardsProps {
    pagination: IPagination | undefined;
    activeFiltersCount: number;
    isLoadingScores: boolean;
    onRefresh: () => void;
}

export const ScoresStatsCards = ({
    pagination,
    activeFiltersCount,
    isLoadingScores,
    onRefresh
}: ScoresStatsCardsProps) => {
    if (!pagination) return null;

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>Total des scores</StatLabel>
                        <StatNumber>{pagination.totalCount.toLocaleString()}</StatNumber>
                        <StatHelpText>
                            {activeFiltersCount > 0 ? `${activeFiltersCount} filtre(s) actif(s)` : 'Tous les scores'}
                        </StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>Page actuelle</StatLabel>
                        <StatNumber>{pagination.currentPage} / {pagination.totalPages}</StatNumber>
                        <StatHelpText>{pagination.itemsOnPage} résultats affichés</StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>État</StatLabel>
                        <StatNumber fontSize="lg">
                            {isLoadingScores ? (
                                <HStack>
                                    <Spinner size="sm" />
                                    <Text>Chargement...</Text>
                                </HStack>
                            ) : (
                                <Badge colorScheme="green" fontSize="md" p={2}>
                                    Données à jour
                                </Badge>
                            )}
                        </StatNumber>
                        <StatHelpText>
                            <Button
                                size="xs"
                                variant="link"
                                colorScheme="blue"
                                leftIcon={<RepeatIcon />}
                                onClick={onRefresh}
                                isLoading={isLoadingScores}
                            >
                                Actualiser
                            </Button>
                        </StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
        </SimpleGrid>
    );
};
