import {
  Container,
  VStack,
  Box,
  HStack,
  Button,
  ButtonGroup,
  IconButton,
  Alert,
  AlertIcon,
  useToast,
  useColorMode,
  Badge,
  Icon,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { MultiPlayerSelector } from "@/components/comparator/MultiPlayerSelector";
import { MultiGuildSelector } from "@/components/comparator/MultiGuildSelector";
import { MultiCharacterSelector } from "@/components/comparator/MultiCharacterSelector";
import type { SelectedCharacter } from "@/components/comparator/MultiCharacterSelector";
import { ComparisonRadarChart } from "@/components/comparator/ComparisonRadarChart";
import { ComparisonDataTable } from "@/components/comparator/ComparisonDataTable";
import { useUserAccounts, useCycles, useGuilds, fetchUserStats, fetchGuildStats } from "@/hooks/useAPI";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";
import type { IUser, IGuild } from "@/interfaces";
import type { IUserStats, IGuildStats } from "@/hooks/useAPI";
import { FiRefreshCw, FiBarChart2, FiUsers, FiShield, FiCalendar, FiBookOpen } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useComparatorMetrics, ENTITY_COLORS } from "@/components/comparator/useComparatorMetrics";
import { CharacterAttributesTable } from "@/components/comparator/CharacterAttributesTable";
import { WeeklyModeBanner } from "@/components/comparator/WeeklyModeBanner";

interface SelectedPlayer {
  id: string;
  user: IUser;
}

interface SelectedGuild {
  id: string;
  guild: IGuild;
}

const ComparatorPage: React.FC = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const [comparisonType, setComparisonType] = useState<"players" | "guilds" | "characters">(
    (searchParams.get("type") as "players" | "guilds" | "characters") || "players"
  );
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [playersStats, setPlayersStats] = useState<Map<string, IUserStats | null>>(new Map());
  const [selectedGuilds, setSelectedGuilds] = useState<SelectedGuild[]>([]);
  const [guildsStats, setGuildsStats] = useState<Map<string, IGuildStats | null>>(new Map());
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [weeklyMode, setWeeklyMode] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [userSearch, setUserSearch] = useState("");
  // Comptes bbs (pas users) : un joueur avec plusieurs comptes apparaît une fois par compte,
  // chacun avec son propre bbs_name/guilde — nécessaire pour pouvoir comparer deux comptes
  // d'un même joueur entre eux.
  const { accounts: users = [] } = useUserAccounts({ authenticated: false, limit: 100, search: userSearch || undefined });
  const { guilds = [] } = useGuilds(false);
  const { cycles = [] } = useCycles();

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const mutedText = "text.muted";

  const {
    charRadarMetrics, charTableMetrics,
    playerRadarMetrics, guildRadarMetrics, playerTableMetrics, guildTableMetrics,
    weeklyRadarMetrics, weeklyTableMetrics,
  } = useComparatorMetrics();

  const playerAccentBg = isDark ? "rgba(49,130,206,0.08)" : "blue.50";
  const guildAccentBg = isDark ? "rgba(159,122,234,0.08)" : "purple.50";

  const charsData = useMemo(() =>
    selectedCharacters.map((sc, i) => ({
      name: sc.character.name,
      stats: (sc.character.stats || {}) as unknown as Record<string, unknown>,
      color: ENTITY_COLORS[i % ENTITY_COLORS.length],
    })),
    [selectedCharacters]
  );

  // Résolution slug cycle depuis l'URL → _id
  useEffect(() => {
    if (!cycles.length) return;
    const slug = searchParams.get("cycle_name");
    if (!slug || selectedCycleId) return;
    const resolved = cycleFromSlug(cycles, slug)?._id ?? slug;
    setSelectedCycleId(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles]);

  // Load from URL on mount — runs once when data first becomes available
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || (users.length === 0 && guilds.length === 0)) return;
    initializedRef.current = true;

    if (comparisonType === "players") {
      // players=<bbs_id>,<bbs_id>,... — bbs_id (unique par compte) plutôt que bbs_name
      // (non garanti unique, notamment entre alts) pour désambiguïser précisément le compte.
      const bbsIds = searchParams.get("players")?.split(",").filter(Boolean) || [];
      const valid: SelectedPlayer[] = [];
      bbsIds.forEach((bbsId) => {
        const user = users.find((u) => u.bbs_id === bbsId);
        if (user) valid.push({ id: bbsId, user });
      });
      if (valid.length > 0) setSelectedPlayers(valid);
    } else {
      const names = searchParams.get("guilds")?.split(",").filter(Boolean) || [];
      const valid: SelectedGuild[] = [];
      names.forEach((name) => {
        const guild = guilds.find((g) => g.name === name);
        if (guild?._id) valid.push({ id: guild._id, guild });
      });
      if (valid.length > 0) setSelectedGuilds(valid);
    }
  }, [users, guilds, comparisonType, searchParams]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", comparisonType);
    if (comparisonType === "players" && selectedPlayers.length > 0)
      params.set("players", selectedPlayers.map((p) => p.id).join(","));
    else if (comparisonType === "guilds" && selectedGuilds.length > 0)
      params.set("guilds", selectedGuilds.map((g) => g.guild.name).join(","));
    const cycleObj = selectedCycleId ? cycles.find(c => c._id === selectedCycleId) : undefined;
    if (cycleObj) params.set("cycle_name", cycleSlug(cycleObj.name, cycleObj.year));
    else if (selectedCycleId) params.set("cycle_name", selectedCycleId);
    setSearchParams(params);
  }, [comparisonType, selectedPlayers, selectedGuilds, selectedCycleId, cycles, setSearchParams]);

  const loadPlayersStats = async () => {
    if (selectedPlayers.length < 2) {
      toast({ title: t("pages.comparator.toastInsufficientTitle"), description: t("pages.comparator.toastMin2Players"), status: "warning", duration: 3000 });
      return;
    }
    setIsLoadingStats(true);
    const map = new Map<string, IUserStats | null>();
    try {
      await Promise.all(
        selectedPlayers.map(async (p) => {
          map.set(p.id, await fetchUserStats(p.user._id, selectedCycleId, p.user.bbs_id));
        })
      );
      setPlayersStats(map);
      toast({ title: t("pages.comparator.toastComparisonLoadedTitle"), status: "success", duration: 2000 });
    } catch {
      toast({ title: t("common.error"), description: t("pages.comparator.toastErrorLoadingStats"), status: "error", duration: 3000 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadGuildsStats = async () => {
    if (selectedGuilds.length < 2) {
      toast({ title: t("pages.comparator.toastInsufficientTitle"), description: t("pages.comparator.toastMin2Guilds"), status: "warning", duration: 3000 });
      return;
    }
    setIsLoadingStats(true);
    const map = new Map<string, IGuildStats | null>();
    try {
      await Promise.all(
        selectedGuilds.map(async (g) => {
          map.set(g.id, await fetchGuildStats(g.id, selectedCycleId));
        })
      );
      setGuildsStats(map);
      toast({ title: t("pages.comparator.toastComparisonLoadedTitle"), status: "success", duration: 2000 });
    } catch {
      toast({ title: t("common.error"), description: t("pages.comparator.toastErrorLoadingStats"), status: "error", duration: 3000 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleAddPlayer = (userId: string, user: IUser) =>
    setSelectedPlayers([...selectedPlayers, { id: userId, user }]);

  const handleRemovePlayer = (id: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== id));
    setPlayersStats((prev) => { const m = new Map(prev); m.delete(id); return m; });
  };

  const handleAddGuild = (guildId: string, guild: IGuild) =>
    setSelectedGuilds([...selectedGuilds, { id: guildId, guild }]);

  const handleRemoveGuild = (id: string) => {
    setSelectedGuilds(selectedGuilds.filter((g) => g.id !== id));
    setGuildsStats((prev) => { const m = new Map(prev); m.delete(id); return m; });
  };

  const handleAddCharacter = (id: string, character: SelectedCharacter["character"]) =>
    setSelectedCharacters([...selectedCharacters, { id, character }]);

  const handleRemoveCharacter = (id: string) =>
    setSelectedCharacters(selectedCharacters.filter((c) => c.id !== id));

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    setPlayersStats(new Map());
    setGuildsStats(new Map());
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setSelectedGuilds([]);
    setSelectedCharacters([]);
    setSelectedCycleId("");
    setPlayersStats(new Map());
    setGuildsStats(new Map());
    setSearchParams(new URLSearchParams({ type: comparisonType }));
  };

  // Auto-compare dès que ≥2 joueurs/guildes sont sélectionnés ou que le cycle change
  useEffect(() => {
    if (comparisonType === "players" && selectedPlayers.length >= 2) {
      loadPlayersStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers, selectedCycleId]);

  useEffect(() => {
    if (comparisonType === "guilds" && selectedGuilds.length >= 2) {
      loadGuildsStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuilds, selectedCycleId]);

  const handleSwitchType = (type: "players" | "guilds" | "characters") => {
    setComparisonType(type);
    setSearchParams(new URLSearchParams({ type }));
  };

  // Derived data for charts
  const playersData = selectedPlayers.map((p, i) => ({
    name: p.user.bbs_name || p.user.global_name || "Joueur",
    stats: (playersStats.get(p.id) ?? null) as unknown as Record<string, unknown>,
    color: ENTITY_COLORS[i % ENTITY_COLORS.length],
  }));

  const guildsData = selectedGuilds.map((g, i) => ({
    name: g.guild.name,
    stats: (guildsStats.get(g.id) ?? null) as unknown as Record<string, unknown>,
    color: ENTITY_COLORS[i % ENTITY_COLORS.length],
  }));

  // Weekly mode helpers (players only)
  const selectedCycleObj = cycles.find((c) => c._id === selectedCycleId);
  const maxWeeks = selectedCycleObj
    ? Math.floor(selectedCycleObj.rotations.length / 2)
    : 0;

  const getWeeklyStats = (
    stats: IUserStats | null,
    weekNum: number
  ): Record<string, unknown> | null => {
    if (!stats || !selectedCycleObj) return null;
    const rot1 = selectedCycleObj.rotations[(weekNum - 1) * 2];
    const rot2 = selectedCycleObj.rotations[(weekNum - 1) * 2 + 1];
    const s1 = stats.allRotations?.find(
      (r) => r.rotation_id === rot1?.rotation_id
    );
    const s2 = stats.allRotations?.find(
      (r) => r.rotation_id === rot2?.rotation_id
    );
    return {
      weekTotal: (s1?.averageScore ?? 0) + (s2?.averageScore ?? 0),
      rotation1Score: s1?.averageScore ?? 0,
      rotation2Score: s2?.averageScore ?? 0,
    };
  };

  const weeklyPlayersData = useMemo(
    () =>
      selectedPlayers.map((p, i) => ({
        name: p.user.bbs_name || p.user.global_name || "Joueur",
        stats:
          getWeeklyStats(playersStats.get(p.id) ?? null, selectedWeek) ??
          ({} as Record<string, unknown>),
        color: ENTITY_COLORS[i % ENTITY_COLORS.length],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPlayers, playersStats, selectedWeek, selectedCycleObj]
  );

  const hasPlayersStats = playersStats.size > 0 && Array.from(playersStats.values()).some((s) => s !== null);
  const hasGuildsStats = guildsStats.size > 0 && Array.from(guildsStats.values()).some((s) => s !== null);
  const hasCharStats = selectedCharacters.length >= 2 && selectedCharacters.some((c) => !!c.character.stats);

  const isPlayers = comparisonType === "players";
  const isGuilds = comparisonType === "guilds";
  const isCharacters = comparisonType === "characters";

  const selectedCount = isPlayers ? selectedPlayers.length : isGuilds ? selectedGuilds.length : selectedCharacters.length;
  const canCompare = selectedCount >= 2;
  const hasResults = isPlayers ? hasPlayersStats : isGuilds ? hasGuildsStats : hasCharStats;

  const compareWord = isPlayers
    ? selectedCount > 1 ? t("pages.comparator.wordPlayers") : t("pages.comparator.wordPlayer")
    : isGuilds
    ? selectedCount > 1 ? t("pages.comparator.wordGuilds") : t("pages.comparator.wordGuild")
    : selectedCount > 1 ? t("pages.comparator.wordCharacters") : t("pages.comparator.wordCharacter");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Comparateur - Bleach Brave Souls | Schrift BBS",
    description: "Comparez les performances entre joueurs ou guildes dans Bleach Brave Souls.",
    url: "https://bbs-schrift.fr/comparateur",
  };

  return (
    <Box mb="150px">
      <SEOHead
        title={t("pages.comparator.seoTitle")}
        description={t("pages.comparator.seoDescription")}
        keywords="comparateur, multi-joueurs, guildes, radar, statistiques, comparaison"
        url="https://bbs-schrift.fr/comparateur"
        structuredData={structuredData}
      />

      <Box w="100%">
        <HeroSection
          title={t("pages.comparator.heroTitle")}
          description={t("pages.comparator.heroDescription")}
          badge={{ text: t("pages.comparator.heroBadge"), icon: FiBarChart2 }}
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={5} align="stretch">

            {/* Compact toolbar */}
            <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={3}>
              <Flex gap={3} align="center" wrap="wrap">

                {/* Type toggle */}
                <ButtonGroup size="sm" isAttached flexShrink={0}>
                  <Button
                    variant={isPlayers ? "solid" : "outline"}
                    colorScheme={isPlayers ? "blue" : "gray"}
                    leftIcon={<Icon as={FiUsers} />}
                    onClick={() => handleSwitchType("players")}
                  >
                    {t("pages.comparator.tabPlayers")}
                    {selectedPlayers.length > 0 && (
                      <Badge ml={2} colorScheme="blue" variant={isPlayers ? "solid" : "outline"} fontSize="2xs" borderRadius="full">
                        {selectedPlayers.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={isGuilds ? "solid" : "outline"}
                    colorScheme={isGuilds ? "purple" : "gray"}
                    leftIcon={<Icon as={FiShield} />}
                    onClick={() => handleSwitchType("guilds")}
                  >
                    {t("pages.comparator.tabGuilds")}
                    {selectedGuilds.length > 0 && (
                      <Badge ml={2} colorScheme="purple" variant={isGuilds ? "solid" : "outline"} fontSize="2xs" borderRadius="full">
                        {selectedGuilds.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={isCharacters ? "solid" : "outline"}
                    colorScheme={isCharacters ? "green" : "gray"}
                    leftIcon={<Icon as={FiBookOpen} />}
                    onClick={() => handleSwitchType("characters")}
                  >
                    {t("pages.comparator.tabCharacters")}
                    {selectedCharacters.length > 0 && (
                      <Badge ml={2} colorScheme="green" variant={isCharacters ? "solid" : "outline"} fontSize="2xs" borderRadius="full">
                        {selectedCharacters.length}
                      </Badge>
                    )}
                  </Button>
                </ButtonGroup>

                {/* Cycle select (hidden for character mode) */}
                {!isCharacters && (
                  <Box flex={1} minW="160px">
                    <CycleSelect
                      cycles={cycles}
                      value={selectedCycleId}
                      onChange={handleCycleChange}
                      placeholder={t("pages.comparator.cycleAllPlaceholder")}
                      allowDeselect
                      size="sm"
                    />
                  </Box>
                )}

                {/* Weekly mode toggle (players only) */}
                {isPlayers && selectedCycleId && maxWeeks > 0 && (
                  <HStack spacing={2} flexShrink={0}>
                    <Button
                      size="sm"
                      variant={weeklyMode ? "solid" : "outline"}
                      colorScheme="purple"
                      leftIcon={<Icon as={FiCalendar} />}
                      onClick={() => setWeeklyMode((v) => !v)}
                    >
                      {t("pages.comparator.weeklyModeButton")}
                    </Button>
                    {weeklyMode && (
                      <CustomSelect
                        size="sm"
                        w="130px"
                        allowDeselect={false}
                        value={String(selectedWeek)}
                        onChange={(v) => setSelectedWeek(Number(v))}
                        options={Array.from({ length: maxWeeks }, (_, i) => ({
                          value: String(i + 1),
                          label: t("pages.comparator.weeklyWeekOption", { n: i + 1 }),
                        }))}
                      />
                    )}
                  </HStack>
                )}

                {/* Actions */}
                <HStack spacing={2} flexShrink={0}>
                  <IconButton
                    icon={<Icon as={FiRefreshCw} />}
                    aria-label={t("pages.comparator.buttonReset")}
                    size="sm"
                    variant="ghost"
                    color={mutedText}
                    onClick={handleReset}
                  />
                  {!isCharacters && (
                    <Button
                      size="sm"
                      colorScheme={isPlayers ? "blue" : "purple"}
                      leftIcon={<Icon as={FiBarChart2} />}
                      onClick={isPlayers ? loadPlayersStats : loadGuildsStats}
                      isDisabled={!canCompare}
                      isLoading={isLoadingStats}
                    >
                      {t("pages.comparator.buttonCompare")} {selectedCount} {compareWord}
                    </Button>
                  )}
                </HStack>
              </Flex>
            </Box>

            {/* Selector */}
            {isPlayers ? (
              <MultiPlayerSelector
                selectedPlayers={selectedPlayers}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
                availableUsers={users}
                maxPlayers={5}
                entityColors={ENTITY_COLORS}
                onSearchChange={setUserSearch}
                guilds={guilds}
              />
            ) : isGuilds ? (
              <MultiGuildSelector
                selectedGuilds={selectedGuilds}
                onAddGuild={handleAddGuild}
                onRemoveGuild={handleRemoveGuild}
                availableGuilds={guilds}
                maxGuilds={5}
                entityColors={ENTITY_COLORS}
              />
            ) : (
              <MultiCharacterSelector
                selectedCharacters={selectedCharacters}
                onAddCharacter={handleAddCharacter}
                onRemoveCharacter={handleRemoveCharacter}
                maxCharacters={5}
                entityColors={ENTITY_COLORS}
              />
            )}

            {/* Min 2 alert */}
            {!isLoadingStats && selectedCount < 2 && (
              <Alert status="info" borderRadius="xl" fontSize="sm" py={2}>
                <AlertIcon />
                {isPlayers
                  ? t("pages.comparator.alertMin2Players")
                  : isGuilds
                  ? t("pages.comparator.alertMin2Guilds")
                  : t("pages.comparator.alertMin2Characters")}
              </Alert>
            )}

            {/* Loading */}
            {isLoadingStats && (
              <PageLoader
                label={t("pages.comparator.loadingStats")}
                color={isPlayers ? "blue.500" : "purple.500"}
                height="200px"
              />
            )}

            {/* Character comparison results */}
            {isCharacters && hasCharStats && (
              <>
                <Grid
                  templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }}
                  gap={5}
                  alignItems="stretch"
                >
                  <ComparisonRadarChart
                    entities={charsData}
                    metrics={charRadarMetrics}
                    heading={t("components.comparatorCharts.radarHeadingCharacters")}
                    accentBg={isDark ? "rgba(56,161,105,0.08)" : "green.50"}
                  />
                  <ComparisonDataTable
                    entities={charsData}
                    metrics={charTableMetrics}
                    heading={t("components.comparatorCharts.tableHeadingCharacters")}
                    accentBg={isDark ? "rgba(56,161,105,0.08)" : "green.50"}
                  />
                </Grid>

                <CharacterAttributesTable selectedCharacters={selectedCharacters} />
              </>
            )}

            {/* Results – side-by-side on xl+ */}
            {!isLoadingStats && hasResults && !isCharacters && (
              <>
                {weeklyMode && isPlayers && (
                  <WeeklyModeBanner week={selectedWeek} cycle={selectedCycleObj} />
                )}
                <Grid
                  templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }}
                  gap={5}
                  alignItems="stretch"
                >
                  <ComparisonRadarChart
                    entities={
                      weeklyMode && isPlayers
                        ? weeklyPlayersData
                        : isPlayers
                        ? playersData
                        : guildsData
                    }
                    metrics={
                      weeklyMode && isPlayers
                        ? weeklyRadarMetrics
                        : isPlayers
                        ? playerRadarMetrics
                        : guildRadarMetrics
                    }
                    heading={t(isPlayers
                      ? "components.comparatorCharts.radarHeadingPlayers"
                      : "components.comparatorCharts.radarHeadingGuilds"
                    )}
                    accentBg={isPlayers ? playerAccentBg : guildAccentBg}
                  />
                  <ComparisonDataTable
                    entities={
                      weeklyMode && isPlayers
                        ? weeklyPlayersData
                        : isPlayers
                        ? playersData
                        : guildsData
                    }
                    metrics={
                      weeklyMode && isPlayers
                        ? weeklyTableMetrics
                        : isPlayers
                        ? playerTableMetrics
                        : guildTableMetrics
                    }
                    heading={t(isPlayers
                      ? "components.comparatorCharts.tableHeadingPlayers"
                      : "components.comparatorCharts.tableHeadingGuilds"
                    )}
                    accentBg={isPlayers ? playerAccentBg : guildAccentBg}
                  />
                </Grid>
              </>
            )}

          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ComparatorPage;
