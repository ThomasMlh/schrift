import { Flex, Button, VStack, Box, Badge, HStack, Text } from "@chakra-ui/react";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
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
          <CustomSelect
            value={displayMode}
            onChange={(value) => onModeChange(value as DisplayMode)}
            options={[
              { value: "cycle", label: "Cycle complet" },
              { value: "rotation", label: "Par rotation" },
              { value: "weekly", label: "Par semaine" },
              { value: "misses", label: "Miss" }
            ]}
            allowDeselect={false}
            size="md"
          />
          
          {/* Filtre par cycle */}
          <CycleSelect
            cycles={cycles}
            value={selectedCycleName}
            onChange={onCycleChange}
            placeholder="Sélectionner un cycle"
            valueKey="name"
            allowDeselect={false}
            size="md"
            showActiveBadge={true}
          />
          
          {/* Filtre par rotation (uniquement en mode rotation) */}
          {selectedCycle && displayMode === "rotation" && (
            <CustomSelect
              placeholder="Sélectionner une rotation"
              value={selectedRotationId}
              onChange={onRotationChange}
              options={selectedCycle.rotations.map((rotation: ICycleRotation) => ({
                value: rotation.rotation_id,
                label: `#${rotation.position} - ${rotation.killer} (${rotation.attack})`
              }))}
              allowDeselect={false}
              size="md"
            />
          )}
          
          {/* Filtre par semaine (uniquement en mode weekly) */}
          {selectedCycle && displayMode === "weekly" && (
            <CustomSelect
              placeholder="Sélectionner une semaine"
              value={selectedWeekNumber}
              onChange={onWeekChange}
              options={Array.from({ length: availableWeeks }, (_, i) => i + 1).map(
                (weekNum) => ({
                  value: String(weekNum),
                  label: `Semaine ${weekNum}`
                })
              )}
              allowDeselect={false}
              size="md"
            />
          )}
          
          {/* Filtre par guilde */}
          <CustomSelect
            placeholder="Toutes les guildes"
            value={selectedGuildName}
            onChange={onGuildChange}
            options={guilds.map((guild) => ({
              value: guild.name,
              label: guild.name
            }))}
            allowDeselect={true}
            size="md"
          />
          
          {/* Éléments par page */}
          <CustomSelect
            value={String(itemsPerPage)}
            onChange={(value) => onItemsPerPageChange(parseInt(value))}
            options={[
              { value: "25", label: "25 / page" },
              { value: "50", label: "50 / page" },
              { value: "100", label: "100 / page" }
            ]}
            allowDeselect={false}
            size="md"
          />
          
          <Button onClick={onReset} variant="outline" minW="120px">
            Réinitialiser
          </Button>
          
          {displayMode === "rotation" && <ScoreLegend />}
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
