import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { FiCalendar, FiRepeat, FiSearch, FiShield } from "react-icons/fi";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
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

const rotationLabel = (r: ICycleRotation) => `#${r.position} · ${r.killer}`;

// Filtres de l'onglet Scores : guildes en pastilles, puis joueur, cycle et rotation,
// et les filtres actifs en tags qu'on retire d'un clic.
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
    const activeCycle    = cycles.find((c) => c._id === filterCycleId);
    const activeRotation = availableRotations.find((r) => r.rotation_id === filterRotationId);
    const activeGuild    = guilds.find((g) => g._id === filterGuildId);

    return (
        <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={{ base: 3, md: 4 }}>
            {/* Guildes + nombre de résultats */}
            <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                {guilds.length > 1 ? (
                    <HStack spacing={2} flexWrap="wrap" role="group" aria-label="Filtrer par guilde">
                        {[{ _id: "", name: "Toutes" }, ...guilds].map((guild) => {
                            const isActive = filterGuildId === guild._id;
                            return (
                                <Button
                                    key={guild._id || "all"}
                                    size="sm"
                                    borderRadius="full"
                                    variant={isActive ? "solid" : "outline"}
                                    colorScheme={isActive ? "purple" : "gray"}
                                    aria-pressed={isActive}
                                    onClick={() => onGuildChange(guild._id)}
                                >
                                    {guild._id ? `Schrift ${guild.name}` : guild.name}
                                </Button>
                            );
                        })}
                    </HStack>
                ) : <Box />}
                {pagination && (
                    <Text fontSize="sm" color="text.muted">
                        {pagination.totalCount.toLocaleString("fr-FR")} score{pagination.totalCount > 1 ? "s" : ""}
                    </Text>
                )}
            </Flex>

            <Divider my={{ base: 3, md: 4 }} borderColor="border.subtle" />

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="text.muted" />
                    </InputLeftElement>
                    <Input
                        placeholder="Rechercher un joueur…"
                        value={scoreSearchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        borderRadius="lg"
                    />
                </InputGroup>

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

                <CustomSelect
                    options={availableRotations.map((r) => ({
                        value: r.rotation_id,
                        label: rotationLabel(r),
                        content: (
                            <HStack spacing={2}>
                                <AttackTypeBadge attackType={r.attack} size="10px" />
                                <Text as="span">{rotationLabel(r)}</Text>
                            </HStack>
                        ),
                    }))}
                    renderSelected={(option) => option.content ?? option.label}
                    value={filterRotationId}
                    onChange={onRotationChange}
                    placeholder={filterCycleId ? "Toutes les rotations" : "Choisir un cycle d'abord"}
                    isDisabled={!filterCycleId}
                    allowDeselect={true}
                    size="sm"
                />
            </SimpleGrid>

            {/* Filtres actifs */}
            {activeFiltersCount > 0 && (
                <Flex mt={3} gap={2} align="center" wrap="wrap">
                    <Wrap spacing={2} flex={1}>
                        {scoreSearchQuery && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="purple" variant="subtle">
                                    <Icon as={FiSearch} mr={1.5} />
                                    <TagLabel>{scoreSearchQuery}</TagLabel>
                                    <TagCloseButton onClick={() => onSearchChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                        {activeCycle && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="purple" variant="subtle">
                                    <Icon as={FiCalendar} mr={1.5} />
                                    <TagLabel>{activeCycle.name} {activeCycle.year}</TagLabel>
                                    <TagCloseButton onClick={() => onCycleChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                        {activeRotation && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="purple" variant="subtle">
                                    <Icon as={FiRepeat} mr={1.5} />
                                    <TagLabel>{rotationLabel(activeRotation)}</TagLabel>
                                    <TagCloseButton onClick={() => onRotationChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                        {activeGuild && (
                            <WrapItem>
                                <Tag size="sm" borderRadius="full" colorScheme="purple" variant="subtle">
                                    <Icon as={FiShield} mr={1.5} />
                                    <TagLabel>Schrift {activeGuild.name}</TagLabel>
                                    <TagCloseButton onClick={() => onGuildChange("")} />
                                </Tag>
                            </WrapItem>
                        )}
                    </Wrap>
                    <Button size="xs" variant="ghost" colorScheme="red" borderRadius="full" onClick={onResetFilters}>
                        Tout effacer
                    </Button>
                </Flex>
            )}
        </Box>
    );
};
