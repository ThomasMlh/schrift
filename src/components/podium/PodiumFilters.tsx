import { Flex, Button, VStack, Box, Badge, HStack, Text } from "@chakra-ui/react";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { ICycle, IGuild, ICycleRotation } from "@/interfaces";
import { ScoreLegend } from "@/components/ui/ScoreLegend";
import { useTranslation } from "react-i18next";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";
type CycleRankingType = "average" | "max";

interface PodiumFiltersProps {
  displayMode: DisplayMode;
  cycleRankingType: CycleRankingType;
  selectedCycleId: string;
  selectedRotationId: string;
  selectedWeekNumber: string;
  selectedGuildName: string;
  itemsPerPage: number;
  cycles: ICycle[];
  guilds: IGuild[];
  selectedCycle?: ICycle;
  availableWeeks: number;
  onModeChange: (mode: DisplayMode) => void;
  onCycleRankingTypeChange: (rankingType: CycleRankingType) => void;
  onCycleChange: (cycleId: string) => void;
  onRotationChange: (rotationId: string) => void;
  onWeekChange: (weekNumber: string) => void;
  onGuildChange: (guildName: string) => void;
  onItemsPerPageChange: (limit: number) => void;
  onReset: () => void;
  filterBg: string;
}

export const PodiumFilters = ({
  displayMode,
  cycleRankingType,
  selectedCycleId,
  selectedRotationId,
  selectedWeekNumber,
  selectedGuildName,
  itemsPerPage,
  cycles,
  guilds,
  selectedCycle,
  availableWeeks,
  onModeChange,
  onCycleRankingTypeChange,
  onCycleChange,
  onRotationChange,
  onWeekChange,
  onGuildChange,
  onItemsPerPageChange,
  onReset,
  filterBg,
}: PodiumFiltersProps) => {
  const { t } = useTranslation();
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
              { value: "cycle", label: t("components.podiumFilters.modeFullCycle") },
              { value: "rotation", label: t("components.podiumFilters.modeByRotation") },
              { value: "weekly", label: t("components.podiumFilters.modeByWeek") },
              { value: "misses", label: t("components.podiumFilters.modeMiss") }
            ]}
            allowDeselect={false}
            size="md"
          />

          {/* Type de podium (uniquement en mode cycle complet) */}
          {displayMode === "cycle" && (
            <CustomSelect
              value={cycleRankingType}
              onChange={(value) =>
                onCycleRankingTypeChange(value as CycleRankingType)
              }
              options={[
                { value: "average", label: t("components.podiumFilters.rankingAverage") },
                { value: "max", label: t("components.podiumFilters.rankingMax") }
              ]}
              allowDeselect={false}
              size="md"
            />
          )}
          
          {/* Filtre par cycle */}
          <CycleSelect
            cycles={cycles}
            value={selectedCycleId}
            onChange={onCycleChange}
            placeholder={t("components.podiumFilters.selectCyclePlaceholder")}
            valueKey="_id"
            allowDeselect={false}
            size="md"
            showActiveBadge={true}
          />
          
          {/* Filtre par rotation (uniquement en mode rotation) */}
          {selectedCycle && displayMode === "rotation" && (
            <CustomSelect
              placeholder={t("components.podiumFilters.selectRotationPlaceholder")}
              value={selectedRotationId}
              onChange={onRotationChange}
              options={selectedCycle.rotations.map((rotation: ICycleRotation) => ({
                value: rotation.rotation_id,
                label: `#${rotation.position} - ${t(`factions.${rotation.killer}`, rotation.killer)} ${rotation.attack === "R" ? "🔴" : rotation.attack === "B" ? "🔵" : `🟠 ${t("attackTypes.meleeFallback")}`}`
              }))}
              allowDeselect={false}
              minW={"200px"}
              size="md"
            />
          )}
          
          {/* Filtre par semaine (uniquement en mode weekly) */}
          {selectedCycle && displayMode === "weekly" && (
            <CustomSelect
              placeholder={t("components.podiumFilters.selectWeekPlaceholder")}
              value={selectedWeekNumber}
              onChange={onWeekChange}
              options={Array.from({ length: availableWeeks }, (_, i) => i + 1).map(
                (weekNum) => ({
                  value: String(weekNum),
                  label: `${t("components.podiumFilters.week")} ${weekNum}`
                })
              )}
              allowDeselect={false}
              size="md"
            />
          )}
          
          {/* Filtre par guilde */}
          <CustomSelect
            placeholder={t("components.podiumFilters.allGuilds")}
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
            {t("components.podiumFilters.reset")}
          </Button>
          
          {displayMode === "rotation" && <ScoreLegend />}
        </Flex>
      </Flex>
      
      {/* Filtres actifs */}
      {(selectedCycleId || selectedGuildName || displayMode !== "cycle" || cycleRankingType !== "average") && (
        <Box p={3} bg={filterBg} borderRadius="md">
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="medium">
              {t("components.podiumFilters.activeFilters")}
            </Text>
            {displayMode !== "cycle" && (
              <Badge colorScheme="purple">
                {t("components.podiumFilters.badgeMode")}{" "}
                {displayMode === "rotation"
                  ? t("components.podiumFilters.modeByRotation")
                  : displayMode === "weekly"
                  ? t("components.podiumFilters.modeByWeek")
                  : t("components.podiumFilters.modeMiss")}
              </Badge>
            )}
            {displayMode === "cycle" && cycleRankingType !== "average" && (
              <Badge colorScheme="pink">{t("components.podiumFilters.badgeTypeMax")}</Badge>
            )}
            {selectedCycle && (
              <Badge colorScheme="blue">{t("components.podiumFilters.badgeCycle")} {selectedCycle.name} - {selectedCycle.year}</Badge>
            )}
            {selectedWeekNumber && displayMode === "weekly" && (
              <Badge colorScheme="teal">{t("components.podiumFilters.badgeWeek")} {selectedWeekNumber}</Badge>
            )}
            {selectedGuildName && (
              <Badge colorScheme="orange">{t("components.podiumFilters.badgeGuild")} {selectedGuildName}</Badge>
            )}
          </HStack>
        </Box>
      )}
    </VStack>
  );
};
