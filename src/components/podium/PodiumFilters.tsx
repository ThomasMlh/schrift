import { Flex, Select, Button, VStack, Box, Badge, HStack, Text } from "@chakra-ui/react";
import type { ICycle, IGuild, ICycleRotation } from "@/interfaces";
import { ScoreLegend } from "@/components/ui/ScoreLegend";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";

interface PodiumFiltersProps {
  displayMode: DisplayMode;
  selectedCycleName: string;
  selectedRotationId: string;
  selectedWeekNumber: string;
  selectedGuildName: string;
  itemsPerPage: number;
  cycles: ICycle[];
  guilds: IGuild[];
  selectedCycle?: ICycle;
  availableWeeks: number;
  onModeChange: (mode: DisplayMode) => void;
  onCycleChange: (cycleName: string) => void;
  onRotationChange: (rotationId: string) => void;
  onWeekChange: (weekNumber: string) => void;
  onGuildChange: (guildName: string) => void;
  onItemsPerPageChange: (limit: number) => void;
  onReset: () => void;
  filterBg: string;
}

export const PodiumFilters = ({
  displayMode,
  selectedCycleName,
  selectedRotationId,
  selectedWeekNumber,
  selectedGuildName,
  itemsPerPage,
  cycles,
  guilds,
  selectedCycle,
  availableWeeks,
  onModeChange,
  onCycleChange,
  onRotationChange,
  onWeekChange,
  onGuildChange,
  onItemsPerPageChange,
  onReset,
  filterBg,
}: PodiumFiltersProps) => {
  return (
    <VStack spacing={4} align="stretch">
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        justify="space-between"
        align="center"
        wrap="wrap"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          justify="center"
          align="center"
          wrap="wrap"
          flex={1}
        >
          {/* Filtre par mode d'affichage */}
          <Select
            value={displayMode}
            onChange={(e) => onModeChange(e.target.value as DisplayMode)}
            maxW="200px"
          >
            <option value="cycle">Cycle complet</option>
            <option value="rotation">Par rotation</option>
            <option value="weekly">Par semaine</option>
            <option value="misses">Miss</option>
          </Select>
          
          {/* Filtre par cycle */}
          <Select
            placeholder="Sélectionner un cycle"
            value={selectedCycleName}
            onChange={(e) => onCycleChange(e.target.value)}
            maxW="200px"
          >
            {cycles.map((cycle) => (
              <option key={cycle._id} value={cycle.name}>
                {cycle.name}
              </option>
            ))}
          </Select>
          
          {/* Filtre par rotation (uniquement en mode rotation) */}
          {selectedCycle && displayMode === "rotation" && (
            <Select
              placeholder="Sélectionner une rotation"
              value={selectedRotationId}
              onChange={(e) => onRotationChange(e.target.value)}
              maxW="300px"
            >
              {selectedCycle.rotations.map((rotation: ICycleRotation) => (
                <option key={rotation.rotation_id} value={rotation.rotation_id}>
                  #{rotation.position} - {rotation.killer} ({rotation.attack})
                </option>
              ))}
            </Select>
          )}
          
          {/* Filtre par semaine (uniquement en mode weekly) */}
          {selectedCycle && displayMode === "weekly" && (
            <Select
              placeholder="Sélectionner une semaine"
              value={selectedWeekNumber}
              onChange={(e) => onWeekChange(e.target.value)}
              maxW="200px"
            >
              {Array.from({ length: availableWeeks }, (_, i) => i + 1).map(
                (weekNum) => (
                  <option key={weekNum} value={weekNum}>
                    Semaine {weekNum}
                  </option>
                )
              )}
            </Select>
          )}
          
          {/* Filtre par guilde */}
          <Select
            placeholder="Toutes les guildes"
            value={selectedGuildName}
            onChange={(e) => onGuildChange(e.target.value)}
            maxW="200px"
          >
            {guilds.map((guild) => (
              <option key={guild._id} value={guild.name}>
                {guild.name}
              </option>
            ))}
          </Select>
          
          {/* Éléments par page */}
          <Select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            maxW="120px"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </Select>
          
          <Button onClick={onReset} variant="outline" minW="120px">
            Réinitialiser
          </Button>
          
          <ScoreLegend />
        </Flex>
      </Flex>
      
      {/* Filtres actifs */}
      {(selectedCycleName || selectedGuildName || displayMode !== "cycle") && (
        <Box p={3} bg={filterBg} borderRadius="md">
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="medium">
              Filtres actifs:
            </Text>
            {displayMode !== "cycle" && (
              <Badge colorScheme="purple">
                Mode:{" "}
                {displayMode === "rotation"
                  ? "Rotation"
                  : displayMode === "weekly"
                  ? "Semaine"
                  : "Miss"}
              </Badge>
            )}
            {selectedCycleName && (
              <Badge colorScheme="blue">Cycle: {selectedCycleName}</Badge>
            )}
            {selectedWeekNumber && displayMode === "weekly" && (
              <Badge colorScheme="teal">Semaine: {selectedWeekNumber}</Badge>
            )}
            {selectedGuildName && (
              <Badge colorScheme="orange">Guilde: {selectedGuildName}</Badge>
            )}
          </HStack>
        </Box>
      )}
    </VStack>
  );
};
