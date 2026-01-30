import {
    Card,
    CardBody,
    VStack,
    HStack,
    Text,
    Badge,
    Icon,
    SimpleGrid,
    Box,
    InputGroup,
    InputLeftElement,
    Input,
    Divider,
    Flex,
    Button
} from "@chakra-ui/react";
import { SearchIcon, CalendarIcon, RepeatIcon } from "@chakra-ui/icons";
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
    return (
        <Card bg="blue.50" _dark={{ bg: "blue.900" }}>
            <CardBody>
                <VStack spacing={4} align="stretch">
                    <HStack spacing={2}>
                        <Icon as={SearchIcon} color="blue.500" />
                        <Text fontSize="md" fontWeight="semibold">
                            Filtres de recherche
                        </Text>
                        {activeFiltersCount > 0 && (
                            <Badge colorScheme="blue" fontSize="xs">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                        {/* Recherche par joueur */}
                        <Box>
                            <Text fontSize="xs" fontWeight="medium" mb={2}>
                                Joueur
                            </Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Rechercher un joueur..."
                                    value={scoreSearchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    bg="white"
                                    _dark={{ bg: "gray.800" }}
                                />
                            </InputGroup>
                        </Box>

                        {/* Filtre par cycle */}
                        <Box>
                            <Text fontSize="xs" fontWeight="medium" mb={2}>
                                <Icon as={CalendarIcon} mr={1} />
                                Cycle
                            </Text>
                            <CycleSelect
                                cycles={cycles}
                                value={filterCycleId}
                                onChange={onCycleChange}
                                placeholder="Tous les cycles"
                                isDisabled={isLoadingCycles}
                                allowDeselect={true}
                                valueKey="_id"
                                size="md"
                            />
                        </Box>

                        {/* Filtre par rotation */}
                        <Box>
                            <Text fontSize="xs" fontWeight="medium" mb={2}>
                                <Icon as={RepeatIcon} mr={1} />
                                Rotation
                            </Text>
                            <CustomSelect
                                options={availableRotations.map((rotation) => ({
                                    value: rotation.rotation_id,
                                    label: `Rotation #${rotation.position} - ${rotation.period}`
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
                            <Text fontSize="xs" fontWeight="medium" mb={2}>
                                Guilde
                            </Text>
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
                        <>
                            <Divider />
                            <Flex justify="space-between" align="center">
                                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                                    {pagination?.totalCount || 0} résultat(s) trouvé(s)
                                </Text>
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={onResetFilters}
                                >
                                    Réinitialiser tous les filtres
                                </Button>
                            </Flex>
                        </>
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
};
