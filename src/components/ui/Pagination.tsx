import { HStack, Button, Text, VStack } from "@chakra-ui/react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
    totalCount?: number;
    itemsOnPage?: number;
}

export const Pagination = ({ 
    currentPage, 
    totalPages, 
    hasPrevPage, 
    hasNextPage, 
    onPageChange,
    totalCount,
    itemsOnPage
}: PaginationProps) => {
    if (totalPages <= 1) return null;

    const renderPaginationButtons = () => {
        const buttons = [];

        // Bouton précédent
        buttons.push(
            <Button
                key="prev"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                isDisabled={!hasPrevPage}
            >
                ← Précédent
            </Button>
        );

        // Calcul des pages à afficher
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Ajuster si on est près du début ou de la fin
        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        }
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        // Première page si pas visible
        if (startPage > 1) {
            buttons.push(
                <Button 
                    key={1} 
                    size="sm" 
                    variant={1 === currentPage ? "solid" : "outline"} 
                    onClick={() => onPageChange(1)}
                >
                    1
                </Button>
            );
            if (startPage > 2) {
                buttons.push(<Text key="ellipsis1">...</Text>);
            }
        }

        // Pages du milieu
        for (let page = startPage; page <= endPage; page++) {
            buttons.push(
                <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "solid" : "outline"}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            );
        }

        // Dernière page si pas visible
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(<Text key="ellipsis2">...</Text>);
            }
            buttons.push(
                <Button
                    key={totalPages}
                    size="sm"
                    variant={totalPages === currentPage ? "solid" : "outline"}
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </Button>
            );
        }

        // Bouton suivant
        buttons.push(
            <Button
                key="next"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                isDisabled={!hasNextPage}
            >
                Suivant →
            </Button>
        );

        return (
            <HStack spacing={2} justify="center" wrap="wrap">
                {buttons}
            </HStack>
        );
    };

    return (
        <VStack spacing={4}>
            {renderPaginationButtons()}
            <Text fontSize="sm" color="gray.500" textAlign="center">
                Page {currentPage} sur {totalPages}
                {totalCount && itemsOnPage && (
                    <Text as="span" ml={2}>
                        ({itemsOnPage} éléments sur {totalCount} au total)
                    </Text>
                )}
            </Text>
        </VStack>
    );
};