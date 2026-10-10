import type { ReactNode } from "react";
import {
  Flex,
  Box,
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
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import type { ICycle, IGuild, ICycleRotation, PodiumRankingType } from "@/interfaces";
import { ScoreLegend } from "@/components/ui/ScoreLegend";
import { useTranslation } from "react-i18next";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";
type CycleRankingType = PodiumRankingType;

const MODE_ORDER: DisplayMode[] = ["cycle", "rotation", "weekly", "misses"];
const RANKING_ORDER: CycleRankingType[] = ["average", "max", "progression"];

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
  /** Raccourcis affichés à droite des onglets (cycle en cours, ma guilde…) */
  shortcuts?: ReactNode;
}

const SELECT_W = { base: "100%", md: "200px" };

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
  shortcuts,
}: PodiumFiltersProps) => {
  const { t } = useTranslation();

  const modeLabels: Record<DisplayMode, string> = {
    cycle: t("components.podiumFilters.modeFullCycle"),
    rotation: t("components.podiumFilters.modeByRotation"),
    weekly: t("components.podiumFilters.modeByWeek"),
    misses: t("components.podiumFilters.modeMiss"),
  };

  const rankingLabels: Record<CycleRankingType, string> = {
    average: t("components.podiumFilters.rankingAverage"),
    max: t("components.podiumFilters.rankingMax"),
    progression: t("components.podiumFilters.rankingProgression"),
  };

  const rotationLabel = (rotation: ICycleRotation) =>
    `#${rotation.position} · ${t(`factions.${rotation.killer}`, rotation.killer)}`;

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={{ base: 3, md: 4 }}>
      {/* Mode d'affichage + raccourcis */}
      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
        <Tabs
          index={MODE_ORDER.indexOf(displayMode)}
          onChange={(index) => onModeChange(MODE_ORDER[index])}
          variant="soft-rounded"
          colorScheme="purple"
          size="sm"
        >
          <TabList flexWrap="wrap" gap={1}>
            {MODE_ORDER.map((mode) => (
              <Tab key={mode} color="text.secondary" fontWeight="semibold">
                {modeLabels[mode]}
              </Tab>
            ))}
          </TabList>
        </Tabs>

        {shortcuts && <HStack spacing={2} flexWrap="wrap">{shortcuts}</HStack>}
      </Flex>

      <Divider my={{ base: 3, md: 4 }} borderColor="border.subtle" />

      {/* Filtres contextuels + réglages */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={3}
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={3}
          align={{ base: "stretch", sm: "center" }}
          wrap="wrap"
          flex={1}
        >
          {/* Type de classement (uniquement en mode cycle complet) */}
          {displayMode === "cycle" && (
            <ButtonGroup isAttached size="sm" variant="outline" w={{ base: "100%", sm: "auto" }}>
              {RANKING_ORDER.map((type) => (
                <Button
                  key={type}
                  onClick={() => onCycleRankingTypeChange(type)}
                  colorScheme={cycleRankingType === type ? "purple" : "gray"}
                  variant={cycleRankingType === type ? "solid" : "outline"}
                  aria-pressed={cycleRankingType === type}
                  // Sur mobile, les 3 boutons se partagent la largeur et leur texte peut passer à la ligne
                  flex={{ base: 1, sm: "initial" }}
                  minW={0}
                  h="auto"
                  minH="32px"
                  py={1.5}
                  whiteSpace={{ base: "normal", sm: "nowrap" }}
                  fontSize={{ base: "xs", sm: "sm" }}
                  lineHeight="short"
                >
                  {rankingLabels[type]}
                </Button>
              ))}
            </ButtonGroup>
          )}

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

          {selectedCycle && displayMode === "rotation" && (
            <CustomSelect
              placeholder={t("components.podiumFilters.selectRotationPlaceholder")}
              value={selectedRotationId}
              onChange={onRotationChange}
              options={selectedCycle.rotations.map((rotation: ICycleRotation) => ({
                value: rotation.rotation_id,
                label: rotationLabel(rotation),
                content: (
                  <HStack spacing={2}>
                    <AttackTypeBadge attackType={rotation.attack} size="10px" />
                    <Text as="span">{rotationLabel(rotation)}</Text>
                  </HStack>
                ),
              }))}
              allowDeselect={false}
              size="md"
              w={SELECT_W}
            />
          )}

          {selectedCycle && displayMode === "weekly" && (
            <CustomSelect
              placeholder={t("components.podiumFilters.selectWeekPlaceholder")}
              value={selectedWeekNumber}
              onChange={onWeekChange}
              options={Array.from({ length: availableWeeks }, (_, i) => i + 1).map((weekNum) => ({
                value: String(weekNum),
                label: `${t("components.podiumFilters.week")} ${weekNum}`,
              }))}
              allowDeselect={false}
              size="md"
              w={SELECT_W}
            />
          )}

          <CustomSelect
            placeholder={t("components.podiumFilters.allGuilds")}
            value={selectedGuildName}
            onChange={onGuildChange}
            options={guilds.map((guild) => ({ value: guild.name, label: guild.name }))}
            allowDeselect={true}
            size="md"
            w={SELECT_W}
          />
        </Flex>

        <HStack spacing={3} justify={{ base: "space-between", lg: "flex-end" }} flexWrap="wrap">
          {displayMode === "rotation" && <ScoreLegend />}

          <CustomSelect
            value={String(itemsPerPage)}
            onChange={(value) => onItemsPerPageChange(parseInt(value))}
            options={[
              { value: "25", label: "25 / page" },
              { value: "50", label: "50 / page" },
              { value: "100", label: "100 / page" },
            ]}
            allowDeselect={false}
            size="md"
            w={{ base: "140px", md: "130px" }}
          />

          <Tooltip label={t("components.podiumFilters.reset")}>
            <IconButton
              aria-label={t("components.podiumFilters.reset")}
              icon={<RepeatIcon />}
              onClick={onReset}
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );
};
