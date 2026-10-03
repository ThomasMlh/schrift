import {
  Flex,
  VStack,
  Box,
  Badge,
  HStack,
  Text,
  Tabs,
  TabList,
  Tab,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { ICycle, IGuild, ICycleRotation, PodiumRankingType } from "@/interfaces";
import { ScoreLegend } from "@/components/ui/ScoreLegend";
import { useTranslation } from "react-i18next";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";
type CycleRankingType = PodiumRankingType;

const MODE_ORDER: DisplayMode[] = ["cycle", "rotation", "weekly", "misses"];

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

const SELECT_W = { base: "100%", md: "180px" };

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
  const inactiveTabColor = useColorModeValue("gray.600", "gray.300");

  const modeLabels: Record<DisplayMode, string> = {
    cycle: t("components.podiumFilters.modeFullCycle"),
    rotation: t("components.podiumFilters.modeByRotation"),
    weekly: t("components.podiumFilters.modeByWeek"),
    misses: t("components.podiumFilters.modeMiss"),
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Mode d'affichage */}
      <Tabs
        index={MODE_ORDER.indexOf(displayMode)}
        onChange={(index) => onModeChange(MODE_ORDER[index])}
        variant="soft-rounded"
        colorScheme="blue"
        size="sm"
        isFitted={true}
        w="100%"
      >
        <TabList flexWrap="wrap" gap={1}>
          {MODE_ORDER.map((mode) => (
            <Tab key={mode} color={inactiveTabColor}>
              {modeLabels[mode]}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {/* Filtres contextuels + réglages */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={4}
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
      >
        {/* Filtres contextuels */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={3}
          align={{ base: "stretch", sm: "center" }}
          wrap="wrap"
          flex={1}
        >
          {/* Type de podium (uniquement en mode cycle complet) */}
          {displayMode === "cycle" && (
            <ButtonGroup isAttached size="md" variant="outline">
              <Button
                onClick={() => onCycleRankingTypeChange("average")}
                colorScheme={cycleRankingType === "average" ? "blue" : undefined}
                variant={cycleRankingType === "average" ? "solid" : "outline"}
              >
                {t("components.podiumFilters.rankingAverage")}
              </Button>
              <Button
                onClick={() => onCycleRankingTypeChange("max")}
                colorScheme={cycleRankingType === "max" ? "blue" : undefined}
                variant={cycleRankingType === "max" ? "solid" : "outline"}
              >
                {t("components.podiumFilters.rankingMax")}
              </Button>
              <Button
                onClick={() => onCycleRankingTypeChange("progression")}
                colorScheme={cycleRankingType === "progression" ? "blue" : undefined}
                variant={cycleRankingType === "progression" ? "solid" : "outline"}
              >
                {t("components.podiumFilters.rankingProgression")}
              </Button>
            </ButtonGroup>
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
            w={{ base: "100%", md: "220px" }}
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
              size="md"
              w={SELECT_W}
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
              w={SELECT_W}
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
            w={SELECT_W}
          />
        </Flex>

        <Divider orientation="horizontal" display={{ base: "block", lg: "none" }} />
        <Divider orientation="vertical" h="32px" display={{ base: "none", lg: "block" }} />

        {/* Réglages */}
        <HStack spacing={3} justify={{ base: "space-between", lg: "flex-end" }} flexWrap="wrap">
          {displayMode === "rotation" && <ScoreLegend />}

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
            w={{ base: "140px", md: "150px" }}
          />

          <Tooltip label={t("components.podiumFilters.reset")}>
            <IconButton
              aria-label={t("components.podiumFilters.reset")}
              icon={<RepeatIcon />}
              onClick={onReset}
              variant="outline"
            />
          </Tooltip>
        </HStack>
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
              <Badge colorScheme="pink">
                {cycleRankingType === "progression"
                  ? t("components.podiumFilters.badgeTypeProgression")
                  : t("components.podiumFilters.badgeTypeMax")}
              </Badge>
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
