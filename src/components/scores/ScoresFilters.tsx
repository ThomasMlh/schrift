import {
    VStack,
    HStack,
    Text,
    Badge,
    SimpleGrid,
    Box,
    InputGroup,
    InputLeftElement,
    Input,
    Flex,
    Button,
    useColorMode,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { ICycle, ICycleRotation, IPagination, IGuild } from "@/interfaces";

interface ScoresFiltersProps {
    scoreSearchQuery: string;
    filterCycleId: string;
    filterRotationId: string;
    filterGuildId: string;
    cycles: ICycle[];
    guilds: IGuild[];
    availableRotations: ICycleRotation[];
    activeFiltersCount: number;
    isLoadingCycles: boolean;
    pagination: IPagination | undefined;
    onSearchChange: (search: string) => void;
    onCycleChange: (cycleId: string) => void;
    onRotationChange: (rotationId: string) => void;
    onGuildChange: (guildId: string) => void;
    onResetFilters: () => void;
}

export const ScoresFilters = ({
    scoreSearchQuery,
    filterCycleId,
    filterRotationId,
    filterGuildId,
    cycles,
    guilds,
    availableRotations,
    activeFiltersCount,
    isLoadingCycles,
    pagination,
    onSearchChange,
    onCycleChange,
    onRotationChange,
    onGuildChange,
    onResetFilters
}: ScoresFiltersProps) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    return (
        <Box
            p={4}
            borderRadius="xl"
            bg={isDark ? 'gray.800' : 'white'}
            border="1px solid"
            borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
            boxShadow={isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'}
        >
            <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                    <HStack spacing={2}>
                        <SearchIcon color={isDark ? 'purple.400' : 'purple.500'} />
                        <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
                            textTransform="uppercase" color={isDark ? 'purple.400' : 'purple.600'}>
                            Filtres
                        </Text>
                        {activeFiltersCount > 0 && (
                            <Badge
                                borderRadius="full"
                                px={2}
                                fontSize="2xs"
                                bg={isDark ? 'purple.800' : 'purple.100'}
                                color={isDark ? 'purple.300' : 'purple.700'}
                            >
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </HStack>
                    {activeFiltersCount > 0 && (
                        <Button
                            size="xs"
                            variant="ghost"
                            borderRadius="full"
                            color={isDark ? 'gray.400' : 'gray.500'}
                            _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.100' }}
                            onClick={onResetFilters}
                        >
                            Réinitialiser
                        </Button>
                    )}
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                    {/* Recherche par joueur */}
                    <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1.5}>Joueur</Text>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Rechercher un joueur..."
                                value={scoreSearchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                borderRadius="lg"
                            />
                        </InputGroup>
                    </Box>

                    {/* Filtre par cycle */}
                    <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1.5}>Cycle</Text>
                        <CycleSelect
                            cycles={cycles}
                            value={filterCycleId}
                            onChange={onCycleChange}
                            placeholder="Tous les cycles"
                            isDisabled={isLoadingCycles}
                            allowDeselect={true}
                            valueKey="_id"
                            size="md"
                            showActiveBadge={true}
                        />
                    </Box>

                    {/* Filtre par rotation */}
                    <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1.5}>Rotation</Text>
                        <CustomSelect
                            options={availableRotations.map((rotation) => ({
                                value: rotation.rotation_id,
                                label: `#${rotation.position} - ${rotation.killer} ${rotation.attack === "R" ? "🔴" : rotation.attack === "B" ? "🔵" : "🟠 Mêlée"}`
                            }))}
                            value={filterRotationId}
                            onChange={onRotationChange}
                            placeholder={filterCycleId ? "Toutes les rotations" : "Sélectionner un cycle d'abord"}
                            isDisabled={!filterCycleId}
                            allowDeselect={true}
                            size="md"
                        />
                    </Box>

                    {/* Filtre par guilde */}
                    <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1.5}>Guilde</Text>
                        <CustomSelect
                            options={guilds.map((guild) => ({
                                value: guild._id,
                                label: guild.name
                            }))}
                            value={filterGuildId}
                            onChange={onGuildChange}
                            placeholder="Toutes les guildes"
                            allowDeselect={true}
                            size="md"
                        />
                    </Box>
                </SimpleGrid>

                {activeFiltersCount > 0 && (
                    <Flex justify="flex-end">
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
                            {pagination?.totalCount || 0} résultat(s)
                        </Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};
