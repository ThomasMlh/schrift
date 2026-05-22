import {
    Box,
    Button,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    useColorModeValue,
    VStack,
    Wrap,
    WrapItem,
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
    onResetFilters,
}: ScoresFiltersProps) => {
    const cardBg      = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const mutedText   = useColorModeValue("gray.500", "gray.400");
    const labelColor  = useColorModeValue("purple.600", "purple.400");

    // Labels des filtres actifs pour les chips
    const activeCycle    = cycles.find((c) => c._id === filterCycleId);
    const activeRotation = availableRotations.find((r) => r.rotation_id === filterRotationId);
    const activeGuild    = guilds.find((g) => g._id === filterGuildId);

    return (
        <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
        >
            {/* En-tête filtres */}
            <Flex
                px={4}
                py={3}
                align="center"
                justify="space-between"
                borderBottomWidth="1px"
                borderColor={borderColor}
            >
                <HStack spacing={2}>
                    <SearchIcon color={labelColor} boxSize={3} />
                    <Text
                        fontSize="2xs"
                        fontWeight="semibold"
                        letterSpacing="widest"
                        textTransform="uppercase"
                        color={labelColor}
                    >
                        Filtres
                    </Text>
                    {activeFiltersCount > 0 && (
                        <Box
                            bg="purple.500"
                            color="white"
                            borderRadius="full"
                            px={1.5}
                            minW="18px"
                            h="18px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text fontSize="2xs" fontWeight="bold">{activeFiltersCount}</Text>
                        </Box>
                    )}
                </HStack>

                <HStack spacing={3}>
                    {pagination && activeFiltersCount > 0 && (
                        <Text fontSize="xs" color={mutedText}>
                            {pagination.totalCount.toLocaleString("fr-FR")} résultat{pagination.totalCount > 1 ? "s" : ""}
                        </Text>
                    )}
                    {activeFiltersCount > 0 && (
                        <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            borderRadius="full"
                            onClick={onResetFilters}
                        >
                            Tout effacer
                        </Button>
                    )}
                </HStack>
            </Flex>

            <VStack spacing={4} align="stretch" p={4}>
                {/* Chips des filtres actifs */}
                {activeFiltersCount > 0 && (
                    <Wrap spacing={2}>
                        {scoreSearchQuery && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="purple" variant="subtle">
                                    <TagLabel>🔍 {scoreSearchQuery}</TagLabel>
                                    <TagCloseButton onClick={() => onSearchChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                        {activeCycle && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="indigo" variant="subtle">
                                    <TagLabel>📅 {activeCycle.name}</TagLabel>
                                    <TagCloseButton onClick={() => onCycleChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                        {activeRotation && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="blue" variant="subtle">
                                    <TagLabel>
                                        #{activeRotation.position} {activeRotation.killer}{" "}
                                        {activeRotation.attack === "R" ? "🔴" : activeRotation.attack === "B" ? "🔵" : "🟠"}
                                    </TagLabel>
                                    <TagCloseButton onClick={() => onRotationChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                        {activeGuild && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="teal" variant="subtle">
                                    <TagLabel>🏰 {activeGuild.name}</TagLabel>
                                    <TagCloseButton onClick={() => onGuildChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                    </Wrap>
                )}

                {/* Champs de filtres */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                    {/* Recherche joueur */}
                    <Box>
                        <Text fontSize="xs" color={mutedText} mb={1.5} fontWeight="medium">Joueur</Text>
                        <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" boxSize={3} />
                            </InputLeftElement>
                            <Input
                                placeholder="Rechercher…"
                                value={scoreSearchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                borderRadius="lg"
                            />
                        </InputGroup>
                    </Box>

                    {/* Cycle */}
                    <Box>
                        <Text fontSize="xs" color={mutedText} mb={1.5} fontWeight="medium">Cycle</Text>
                        <CycleSelect
                            cycles={cycles}
                            value={filterCycleId}
                            onChange={onCycleChange}
                            placeholder="Tous les cycles"
                            isDisabled={isLoadingCycles}
                            allowDeselect={true}
                            valueKey="_id"
                            size="sm"
                            showActiveBadge={true}
                        />
                    </Box>

                    {/* Rotation */}
                    <Box>
                        <Text fontSize="xs" color={mutedText} mb={1.5} fontWeight="medium">Rotation</Text>
                        <CustomSelect
                            options={availableRotations.map((r) => ({
                                value: r.rotation_id,
                                label: `#${r.position} - ${r.killer} ${r.attack === "R" ? "🔴" : r.attack === "B" ? "🔵" : "🟠"}`
                            }))}
                            value={filterRotationId}
                            onChange={onRotationChange}
                            placeholder={filterCycleId ? "Toutes les rotations" : "Choisir un cycle d'abord"}
                            isDisabled={!filterCycleId}
                            allowDeselect={true}
                            size="sm"
                        />
                    </Box>

                    {/* Guilde */}
                    <Box>
                        <Text fontSize="xs" color={mutedText} mb={1.5} fontWeight="medium">Guilde</Text>
                        <CustomSelect
                            options={guilds.map((g) => ({ value: g._id, label: g.name }))}
                            value={filterGuildId}
                            onChange={onGuildChange}
                            placeholder="Toutes les guildes"
                            allowDeselect={true}
                            size="sm"
                        />
                    </Box>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};
