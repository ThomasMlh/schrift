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
  useColorModeValue,
  useColorMode,
  Badge,
  Icon,
  Flex,
  Grid,
  Text,
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
import type { RadarMetricDef } from "@/components/comparator/ComparisonRadarChart";
import type { TableMetricDef } from "@/components/comparator/ComparisonDataTable";
import { useUsers, useCycles, useGuilds, fetchUserStats, fetchGuildStats } from "@/hooks/useAPI";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";
import { formatScore, formatNumber } from "@/utils/format";
import type { IUser, IGuild } from "@/interfaces";
import type { IUserStats, IGuildStats } from "@/hooks/useAPI";
import { FiRefreshCw, FiBarChart2, FiUsers, FiShield, FiCalendar, FiBookOpen } from "react-icons/fi";
import { AffinityIcon } from "@/components/ui/AffinityIcon";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { KillerIcon } from "@/components/ui/KillerIcon";
import { useTranslation } from "react-i18next";

interface SelectedPlayer {
  id: string;
  user: IUser;
}

interface SelectedGuild {
  id: string;
  guild: IGuild;
}

const ENTITY_COLORS = [
  "#3182CE",
  "#38A169",
  "#DD6B20",
  "#9F7AEA",
  "#E53E3E",
];

const parseStatValue = (val?: string): number => {
  if (!val) return 0;
  return parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
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
  const { users = [] } = useUsers({ authenticated: false, limit: 100, search: userSearch || undefined });
  const { guilds = [] } = useGuilds(false);
  const { cycles = [] } = useCycles();

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const playerAccentBg = isDark ? "rgba(49,130,206,0.08)" : "blue.50";
  const guildAccentBg = isDark ? "rgba(159,122,234,0.08)" : "purple.50";

  // Character radar & table metrics (computed from selected chars directly)
  const charRadarMetrics = useMemo<RadarMetricDef[]>(() => [
    { key: "atk", label: t("components.comparatorCharts.radarCharAtk"), getRawValue: (s) => parseStatValue(s.atk as string) },
    { key: "def", label: t("components.comparatorCharts.radarCharDef"), getRawValue: (s) => parseStatValue(s.def as string) },
    { key: "end", label: t("components.comparatorCharts.radarCharEnd"), getRawValue: (s) => parseStatValue(s.end as string) },
    { key: "cct", label: t("components.comparatorCharts.radarCharCct"), getRawValue: (s) => parseStatValue(s.cct as string) },
    { key: "pre", label: t("components.comparatorCharts.radarCharPre"), getRawValue: (s) => parseStatValue(s.pre as string) },
  ], [t]);

  const charTableMetrics = useMemo<TableMetricDef[]>(() => [
    { label: t("components.comparatorCharts.radarCharAtk"), icon: "⚔️", getDisplayValue: (s) => formatNumber(parseStatValue(s.atk as string)), getRawValue: (s) => parseStatValue(s.atk as string) },
    { label: t("components.comparatorCharts.radarCharDef"), icon: "🛡️", getDisplayValue: (s) => formatNumber(parseStatValue(s.def as string)), getRawValue: (s) => parseStatValue(s.def as string) },
    { label: t("components.comparatorCharts.radarCharEnd"), icon: "❤️", getDisplayValue: (s) => formatNumber(parseStatValue(s.end as string)), getRawValue: (s) => parseStatValue(s.end as string) },
    { label: t("components.comparatorCharts.radarCharCct"), icon: "💥", getDisplayValue: (s) => formatNumber(parseStatValue(s.cct as string)), getRawValue: (s) => parseStatValue(s.cct as string) },
    { label: t("components.comparatorCharts.radarCharPre"), icon: "🎯", getDisplayValue: (s) => formatNumber(parseStatValue(s.pre as string)), getRawValue: (s) => parseStatValue(s.pre as string) },
  ], [t]);

  const charsData = useMemo(() =>
    selectedCharacters.map((sc, i) => ({
      name: sc.character.name,
      stats: (sc.character.stats || {}) as unknown as Record<string, unknown>,
      color: ENTITY_COLORS[i % ENTITY_COLORS.length],
    })),
    [selectedCharacters]
  );

  // Radar metrics
  const playerRadarMetrics = useMemo<RadarMetricDef[]>(() => {
    const P = (s: Record<string, unknown>) => s as unknown as IUserStats;
    return [
      { key: "averageScore", label: t("components.comparatorCharts.radarAvg"), getRawValue: (s) => P(s)?.averageScore || 0 },
      { key: "bestScore", label: t("components.comparatorCharts.radarBest"), getRawValue: (s) => P(s)?.bestScore?.score || 0 },
      { key: "totalScores", label: t("components.comparatorCharts.radarParticipation"), getRawValue: (s) => P(s)?.totalScores || 0 },
      { key: "regularity", label: t("components.comparatorCharts.radarRegularity"), getRawValue: (s) => typeof P(s)?.missRate === "number" ? 100 - P(s).missRate! : 0, absolute: true },
      { key: "totalPoints", label: t("components.comparatorCharts.radarTotalPoints"), getRawValue: (s) => P(s)?.totalPoints || 0 },
    ];
  }, [t]);

  const guildRadarMetrics = useMemo<RadarMetricDef[]>(() => {
    const G = (s: Record<string, unknown>) => s as unknown as IGuildStats;
    return [
      { key: "averageScore", label: t("components.comparatorCharts.radarAvg"), getRawValue: (s) => G(s)?.averageScore || 0 },
      { key: "bestScore", label: t("components.comparatorCharts.radarBest"), getRawValue: (s) => G(s)?.bestScore || 0 },
      { key: "totalMembers", label: t("components.comparatorCharts.radarMembers"), getRawValue: (s) => G(s)?.totalMembers || 0 },
      { key: "totalScores", label: t("components.comparatorCharts.radarParticipation"), getRawValue: (s) => G(s)?.totalScores || 0 },
      { key: "clearRate", label: t("components.comparatorCharts.metricClearRate"), getRawValue: (s) => G(s)?.clearRate || 0, absolute: true },
    ];
  }, [t]);

  // Table metrics
  const playerTableMetrics = useMemo<TableMetricDef[]>(() => {
    const P = (s: Record<string, unknown>) => s as unknown as IUserStats;
    return [
      { label: t("components.comparatorCharts.metricAvgScore"), icon: "📊", getDisplayValue: (s) => formatScore(P(s)?.averageScore), getRawValue: (s) => P(s)?.averageScore || 0 },
      { label: t("components.comparatorCharts.metricBestScore"), icon: "🏆", getDisplayValue: (s) => formatNumber(P(s)?.bestScore?.score), getRawValue: (s) => P(s)?.bestScore?.score || 0 },
      { label: t("components.comparatorCharts.metricWorstScore"), icon: "📉", getDisplayValue: (s) => formatNumber(P(s)?.worstScore?.score), getRawValue: (s) => P(s)?.worstScore?.score || 0 },
      { label: t("components.comparatorCharts.metricParticipations"), icon: "🎯", getDisplayValue: (s) => formatNumber(P(s)?.totalScores), getRawValue: (s) => P(s)?.totalScores || 0 },
      { label: t("components.comparatorCharts.metricTotalPoints"), icon: "💰", getDisplayValue: (s) => formatScore(P(s)?.totalPoints), getRawValue: (s) => P(s)?.totalPoints || 0 },
      { label: t("components.comparatorCharts.metricMissRate"), icon: "⚠️", getDisplayValue: (s) => typeof P(s)?.missRate === "number" ? `${P(s).missRate}%` : "N/A", getRawValue: (s) => P(s)?.missRate || 0, inverse: true },
    ];
  }, [t]);

  const guildTableMetrics = useMemo<TableMetricDef[]>(() => {
    const G = (s: Record<string, unknown>) => s as unknown as IGuildStats;
    return [
      { label: t("components.comparatorCharts.metricMemberCount"), icon: "👥", getDisplayValue: (s) => formatNumber(G(s)?.totalMembers), getRawValue: (s) => G(s)?.totalMembers || 0 },
      { label: t("components.comparatorCharts.metricAvgScore"), icon: "📊", getDisplayValue: (s) => formatScore(G(s)?.averageScore), getRawValue: (s) => G(s)?.averageScore || 0 },
      { label: t("components.comparatorCharts.metricBestScore"), icon: "🏆", getDisplayValue: (s) => formatNumber(G(s)?.bestScore), getRawValue: (s) => G(s)?.bestScore || 0 },
      { label: t("components.comparatorCharts.metricTotalParticipations"), icon: "🎯", getDisplayValue: (s) => formatNumber(G(s)?.totalScores), getRawValue: (s) => G(s)?.totalScores || 0 },
      { label: t("components.comparatorCharts.metricTotalPoints"), icon: "💰", getDisplayValue: (s) => formatScore(G(s)?.totalPoints), getRawValue: (s) => G(s)?.totalPoints || 0 },
      { label: t("components.comparatorCharts.metricClearRate"), icon: "✅", getDisplayValue: (s) => typeof G(s)?.clearRate === "number" ? `${G(s).clearRate}%` : "N/A", getRawValue: (s) => G(s)?.clearRate || 0 },
    ];
  }, [t]);

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
      const names = searchParams.get("players")?.split(",").filter(Boolean) || [];
      const valid: SelectedPlayer[] = [];
      names.forEach((name) => {
        const user = users.find((u) => u.bbs_name === name);
        if (user?._id) valid.push({ id: user._id, user });
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
      params.set("players", selectedPlayers.map((p) => p.user.bbs_name || p.id).join(","));
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
          map.set(p.id, await fetchUserStats(p.id, selectedCycleId));
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

  const weeklyRadarMetrics = useMemo<RadarMetricDef[]>(
    () => [
      {
        key: "weekTotal",
        label: t("components.comparatorCharts.weeklyTotal"),
        getRawValue: (s) => (s.weekTotal as number) || 0,
      },
      {
        key: "rotation1Score",
        label: t("components.comparatorCharts.weeklyRotation1"),
        getRawValue: (s) => (s.rotation1Score as number) || 0,
      },
      {
        key: "rotation2Score",
        label: t("components.comparatorCharts.weeklyRotation2"),
        getRawValue: (s) => (s.rotation2Score as number) || 0,
      },
    ],
    [t]
  );

  const weeklyTableMetrics = useMemo<TableMetricDef[]>(
    () => [
      {
        label: t("components.comparatorCharts.weeklyTotal"),
        icon: "📅",
        getDisplayValue: (s) => formatScore((s.weekTotal as number) || 0),
        getRawValue: (s) => (s.weekTotal as number) || 0,
      },
      {
        label: t("components.comparatorCharts.weeklyRotation1"),
        icon: "1️⃣",
        getDisplayValue: (s) => formatScore((s.rotation1Score as number) || 0),
        getRawValue: (s) => (s.rotation1Score as number) || 0,
      },
      {
        label: t("components.comparatorCharts.weeklyRotation2"),
        icon: "2️⃣",
        getDisplayValue: (s) => formatScore((s.rotation2Score as number) || 0),
        getRawValue: (s) => (s.rotation2Score as number) || 0,
      },
    ],
    [t]
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
          badge={{ text: t("pages.comparator.heroBadge"), icon: "⚔️" }}
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

                {/* Attributs qualitatifs */}
                <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={4}>
                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText} mb={4}>
                    {t("components.comparatorCharts.charAttributesHeading")}
                  </Text>
                  <Box overflowX="auto">
                    <Box display="grid" gridTemplateColumns={`140px repeat(${selectedCharacters.length}, 1fr)`} gap={2} minW="400px">
                      {/* Header row */}
                      <Box />
                      {selectedCharacters.map((sc, i) => (
                        <Box key={sc.id} textAlign="center">
                          <Box w={2} h={2} borderRadius="full" bg={ENTITY_COLORS[i % ENTITY_COLORS.length]} display="inline-block" mr={1} />
                          <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>{sc.character.name}</Text>
                        </Box>
                      ))}

                      {/* Affinity */}
                      <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricAffinity")}</Text>
                      {selectedCharacters.map((sc) => (
                        <Flex key={sc.id} justify="center" align="center" gap={1}>
                          {sc.character.affinity
                            ? <AffinityIcon affinity={sc.character.affinity} size="18px" />
                            : <Text fontSize="xs" color={mutedText}>—</Text>}
                        </Flex>
                      ))}

                      {/* Attack type */}
                      <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricAttackType")}</Text>
                      {selectedCharacters.map((sc) => (
                        <Flex key={sc.id} justify="center" align="center">
                          {sc.character.attack_type
                            ? <AttackTypeBadge attackType={sc.character.attack_type} size="18px" />
                            : <Text fontSize="xs" color={mutedText}>—</Text>}
                        </Flex>
                      ))}

                      {/* Killers */}
                      <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricKillers")}</Text>
                      {selectedCharacters.map((sc) => (
                        <Flex key={sc.id} justify="center" flexWrap="wrap" gap={1}>
                          {sc.character.killers?.length
                            ? sc.character.killers.map((k) => <KillerIcon key={k} killer={k} size="18px" />)
                            : <Text fontSize="xs" color={mutedText}>—</Text>}
                        </Flex>
                      ))}

                      {/* Categories */}
                      <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricCategories")}</Text>
                      {selectedCharacters.map((sc) => (
                        <Flex key={sc.id} justify="center" flexWrap="wrap" gap={1}>
                          {sc.character.categories?.length
                            ? sc.character.categories.map((cat) => (
                                <Badge key={cat} fontSize="2xs" borderRadius="full" colorScheme="gray">{cat}</Badge>
                              ))
                            : <Text fontSize="xs" color={mutedText}>—</Text>}
                        </Flex>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {/* Results – side-by-side on xl+ */}
            {!isLoadingStats && hasResults && !isCharacters && (
              <>
                {weeklyMode && isPlayers && (
                  <Box
                    bg={isDark ? "rgba(159,122,234,0.08)" : "purple.50"}
                    borderRadius="lg"
                    px={4}
                    py={2}
                    borderLeft="3px solid"
                    borderColor="purple.400"
                  >
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} color="purple.400" boxSize={4} />
                      <Text fontSize="sm" fontWeight="semibold" color="purple.600" _dark={{ color: "purple.300" }}>
                        Mode hebdomadaire — Semaine {selectedWeek}
                      </Text>
                      {selectedCycleObj && (() => {
                        const r1 = selectedCycleObj.rotations[(selectedWeek - 1) * 2];
                        const r2 = selectedCycleObj.rotations[(selectedWeek - 1) * 2 + 1];
                        return r1 ? (
                          <Text fontSize="xs" color="gray.500">
                            R{r1.position} {r1.killer}{r2 ? ` + R${r2.position} ${r2.killer}` : ""}
                          </Text>
                        ) : null;
                      })()}
                    </HStack>
                  </Box>
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
