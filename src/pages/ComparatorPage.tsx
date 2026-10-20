import {
  Container,
  VStack,
  Box,
  HStack,
  Button,
  IconButton,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  Icon,
  Flex,
  Grid,
  Tabs,
  TabList,
  Tab,
  Tooltip,
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
import { ComparisonSummary } from "@/components/comparator/ComparisonSummary";
import type { IconType } from "react-icons";
import { useUserAccounts, useCycles, useGuilds, fetchUserStats, fetchGuildStats } from "@/hooks/useAPI";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";
import { apiUrl } from "@/utils/apiRequest";
import type { IUser, IGuild } from "@/interfaces";
import type { IUserStats, IGuildStats } from "@/hooks/useAPI";
import { FiRefreshCw, FiUsers, FiShield, FiCalendar, FiBookOpen } from "react-icons/fi";
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

type ComparisonType = "players" | "guilds" | "characters";
const TYPE_ORDER: ComparisonType[] = ["players", "guilds", "characters"];
const TYPE_ICONS: Record<ComparisonType, IconType> = { players: FiUsers, guilds: FiShield, characters: FiBookOpen };
const TYPE_LABELS: Record<ComparisonType, string> = {
  players: "pages.comparator.tabPlayers",
  guilds: "pages.comparator.tabGuilds",
  characters: "pages.comparator.tabCharacters",
};

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
  // bbs accounts (not users): a player with several accounts appears once per account, each with its
  // own name/guild, so two accounts of the same player can be compared.
  const { accounts: users = [] } = useUserAccounts({ authenticated: false, limit: 200, search: userSearch || undefined });
  const { guilds = [] } = useGuilds(false);
  const { cycles = [] } = useCycles();


  const {
    charRadarMetrics, charTableMetrics,
    playerRadarMetrics, guildRadarMetrics, playerTableMetrics, guildTableMetrics,
    weeklyRadarMetrics, weeklyTableMetrics,
  } = useComparatorMetrics();


  const charsData = useMemo(() =>
    selectedCharacters.map((sc, i) => ({
      name: sc.character.name,
      stats: (sc.character.stats || {}) as unknown as Record<string, unknown>,
      color: ENTITY_COLORS[i % ENTITY_COLORS.length],
    })),
    [selectedCharacters]
  );

  // Resolve the cycle slug from the URL into its _id
  useEffect(() => {
    if (!cycles.length) return;
    const slug = searchParams.get("cycle_name");
    if (!slug || selectedCycleId) return;
    const resolved = cycleFromSlug(cycles, slug)?._id ?? slug;
    setSelectedCycleId(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles]);

  // Load from the URL once, when data first becomes available
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || (users.length === 0 && guilds.length === 0)) return;
    initializedRef.current = true;

    if (comparisonType === "players") {
      // players=<bbs_id>,<bbs_id>,...: bbs_id (unique per account) rather than bbs_name (not guaranteed
      // unique, especially across alts) to target the exact account.
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

  // characters=<id>,<id> ("Compare" link of the character page): loaded once
  const charactersInitRef = useRef(false);
  useEffect(() => {
    if (charactersInitRef.current) return;
    charactersInitRef.current = true;
    const ids = searchParams.get("characters")?.split(",").filter(Boolean).slice(0, 5) || [];
    if (comparisonType !== "characters" || ids.length === 0) return;
    Promise.all(ids.map((id) =>
      fetch(`${apiUrl}/api/characters/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((body) => (body?.data ? { id, character: body.data as SelectedCharacter["character"] } : null))
        .catch(() => null)
    )).then((loaded) => {
      const valid = loaded.filter((c): c is SelectedCharacter => c !== null);
      if (valid.length > 0) setSelectedCharacters(valid);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", comparisonType);
    if (comparisonType === "players" && selectedPlayers.length > 0)
      params.set("players", selectedPlayers.map((p) => p.id).join(","));
    else if (comparisonType === "guilds" && selectedGuilds.length > 0)
      params.set("guilds", selectedGuilds.map((g) => g.guild.name).join(","));
    else if (comparisonType === "characters" && selectedCharacters.length > 0)
      params.set("characters", selectedCharacters.map((c) => c.id).join(","));
    const cycleObj = selectedCycleId ? cycles.find(c => c._id === selectedCycleId) : undefined;
    if (cycleObj) params.set("cycle_name", cycleSlug(cycleObj.name, cycleObj.year));
    else if (selectedCycleId) params.set("cycle_name", selectedCycleId);
    setSearchParams(params);
  }, [comparisonType, selectedPlayers, selectedGuilds, selectedCharacters, selectedCycleId, cycles, setSearchParams]);

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

  // Compare automatically once at least 2 players/guilds are selected or the cycle changes
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

  // Derived chart data
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
  const hasResults = isPlayers ? hasPlayersStats : isGuilds ? hasGuildsStats : hasCharStats;


  const isWeekly = weeklyMode && isPlayers;
  const resultEntities = isWeekly ? weeklyPlayersData : isPlayers ? playersData : guildsData;
  const resultRadarMetrics = isWeekly ? weeklyRadarMetrics : isPlayers ? playerRadarMetrics : guildRadarMetrics;
  const resultTableMetrics = isWeekly ? weeklyTableMetrics : isPlayers ? playerTableMetrics : guildTableMetrics;

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
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={5} align="stretch">

            {/* Toolbar: comparison type, cycle, weekly mode */}
            <Flex
              bg="bg.card"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
              p={3}
              gap={3}
              align="center"
              wrap="wrap"
            >
              <Tabs
                index={TYPE_ORDER.indexOf(comparisonType)}
                onChange={(i) => handleSwitchType(TYPE_ORDER[i])}
                variant="soft-rounded"
                colorScheme="purple"
                size="sm"
              >
                <TabList gap={1} flexWrap="wrap">
                  {TYPE_ORDER.map((type) => {
                    const count = type === "players" ? selectedPlayers.length : type === "guilds" ? selectedGuilds.length : selectedCharacters.length;
                    return (
                      <Tab key={type} color="text.secondary" fontWeight="semibold" gap={2}>
                        <Icon as={TYPE_ICONS[type]} aria-hidden />
                        {t(TYPE_LABELS[type])}
                        {count > 0 && (
                          <Badge colorScheme="purple" variant="subtle" fontSize="2xs" borderRadius="full">{count}</Badge>
                        )}
                      </Tab>
                    );
                  })}
                </TabList>
              </Tabs>

              {!isCharacters && (
                <Box flex={1} minW="180px" maxW={{ md: "260px" }}>
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

              {isPlayers && selectedCycleId && maxWeeks > 0 && (
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant={weeklyMode ? "solid" : "outline"}
                    colorScheme={weeklyMode ? "purple" : "gray"}
                    leftIcon={<Icon as={FiCalendar} />}
                    onClick={() => setWeeklyMode((v) => !v)}
                    aria-pressed={weeklyMode}
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

              <Tooltip label={t("pages.comparator.buttonReset")} hasArrow>
                <IconButton
                  icon={<Icon as={FiRefreshCw} />}
                  aria-label={t("pages.comparator.buttonReset")}
                  size="sm"
                  variant="ghost"
                  ml="auto"
                  onClick={handleReset}
                />
              </Tooltip>
            </Flex>

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

            {isLoadingStats && (
              <PageLoader
                label={t("pages.comparator.loadingStats")}
                color="purple.400"
                height="200px"
              />
            )}

            {isCharacters && hasCharStats && (
              <>
                <ComparisonSummary entities={charsData} metrics={charTableMetrics} />
                <Grid
                  templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }}
                  gap={5}
                  alignItems="stretch"
                >
                  <ComparisonRadarChart
                    entities={charsData}
                    metrics={charRadarMetrics}
                    heading={t("components.comparatorCharts.radarHeadingCharacters")}
                  />
                  <ComparisonDataTable
                    entities={charsData}
                    metrics={charTableMetrics}
                    heading={t("components.comparatorCharts.tableHeadingCharacters")}
                  />
                </Grid>

                <CharacterAttributesTable selectedCharacters={selectedCharacters} />
              </>
            )}

            {!isLoadingStats && hasResults && !isCharacters && (
              <>
                {weeklyMode && isPlayers && (
                  <WeeklyModeBanner week={selectedWeek} cycle={selectedCycleObj} />
                )}
                <ComparisonSummary entities={resultEntities} metrics={resultTableMetrics} />
                <Grid
                  templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }}
                  gap={5}
                  alignItems="stretch"
                >
                  <ComparisonRadarChart
                    entities={resultEntities}
                    metrics={resultRadarMetrics}
                    heading={t(isPlayers
                      ? "components.comparatorCharts.radarHeadingPlayers"
                      : "components.comparatorCharts.radarHeadingGuilds"
                    )}
                  />
                  <ComparisonDataTable
                    entities={resultEntities}
                    metrics={resultTableMetrics}
                    heading={t(isPlayers
                      ? "components.comparatorCharts.tableHeadingPlayers"
                      : "components.comparatorCharts.tableHeadingGuilds"
                    )}
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
