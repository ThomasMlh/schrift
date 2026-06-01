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
} from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { MultiPlayerSelector } from "@/components/comparator/MultiPlayerSelector";
import { MultiGuildSelector } from "@/components/comparator/MultiGuildSelector";
import { ComparisonRadarChart } from "@/components/comparator/ComparisonRadarChart";
import { ComparisonDataTable } from "@/components/comparator/ComparisonDataTable";
import type { RadarMetricDef } from "@/components/comparator/ComparisonRadarChart";
import type { TableMetricDef } from "@/components/comparator/ComparisonDataTable";
import { useUsers, useCycles, useGuilds, fetchUserStats, fetchGuildStats } from "@/hooks/useAPI";
import type { IUser, IGuild } from "@/interfaces";
import type { IUserStats, IGuildStats } from "@/hooks/useAPI";
import { FiRefreshCw, FiBarChart2, FiUsers, FiShield } from "react-icons/fi";
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

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "N/A";
  return num.toLocaleString("fr-FR");
};

const formatScore = (score: number | undefined | null): string => {
  if (score === undefined || score === null) return "N/A";
  if (score >= 1_000_000_000) return `${(score / 1_000_000_000).toFixed(2)}B`;
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(2)}M`;
  return formatNumber(score);
};

const ComparatorPage: React.FC = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const [comparisonType, setComparisonType] = useState<"players" | "guilds">(
    (searchParams.get("type") as "players" | "guilds") || "players"
  );
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [playersStats, setPlayersStats] = useState<Map<string, IUserStats | null>>(new Map());
  const [selectedGuilds, setSelectedGuilds] = useState<SelectedGuild[]>([]);
  const [guildsStats, setGuildsStats] = useState<Map<string, IGuildStats | null>>(new Map());
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    searchParams.get("cycle_id") || ""
  );
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const { users = [] } = useUsers({ authenticated: false, limit: 1000 });
  const { guilds = [] } = useGuilds(false);
  const { cycles = [] } = useCycles();

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const playerAccentBg = isDark ? "rgba(49,130,206,0.08)" : "blue.50";
  const guildAccentBg = isDark ? "rgba(159,122,234,0.08)" : "purple.50";

  // Radar metrics
  const playerRadarMetrics = useMemo<RadarMetricDef[]>(() => [
    { key: "averageScore", label: t("components.comparatorCharts.radarAvg"), getRawValue: (s) => s?.averageScore || 0 },
    { key: "bestScore", label: t("components.comparatorCharts.radarBest"), getRawValue: (s) => s?.bestScore?.score || 0 },
    { key: "totalScores", label: t("components.comparatorCharts.radarParticipation"), getRawValue: (s) => s?.totalScores || 0 },
    { key: "regularity", label: t("components.comparatorCharts.radarRegularity"), getRawValue: (s) => typeof s?.missRate === "number" ? 100 - s.missRate : 0, absolute: true },
    { key: "totalPoints", label: t("components.comparatorCharts.radarTotalPoints"), getRawValue: (s) => s?.totalPoints || 0 },
  ], [t]);

  const guildRadarMetrics = useMemo<RadarMetricDef[]>(() => [
    { key: "averageScore", label: t("components.comparatorCharts.radarAvg"), getRawValue: (s) => s?.averageScore || 0 },
    { key: "bestScore", label: t("components.comparatorCharts.radarBest"), getRawValue: (s) => s?.bestScore || 0 },
    { key: "totalMembers", label: t("components.comparatorCharts.radarMembers"), getRawValue: (s) => s?.totalMembers || 0 },
    { key: "totalScores", label: t("components.comparatorCharts.radarParticipation"), getRawValue: (s) => s?.totalScores || 0 },
    { key: "totalPoints", label: t("components.comparatorCharts.radarTotalPoints"), getRawValue: (s) => s?.totalPoints || 0 },
  ], [t]);

  // Table metrics
  const playerTableMetrics = useMemo<TableMetricDef[]>(() => [
    { label: t("components.comparatorCharts.metricAvgScore"), icon: "📊", getDisplayValue: (s) => formatScore(s?.averageScore), getRawValue: (s) => s?.averageScore || 0 },
    { label: t("components.comparatorCharts.metricBestScore"), icon: "🏆", getDisplayValue: (s) => formatNumber(s?.bestScore?.score), getRawValue: (s) => s?.bestScore?.score || 0 },
    { label: t("components.comparatorCharts.metricWorstScore"), icon: "📉", getDisplayValue: (s) => formatNumber(s?.worstScore?.score), getRawValue: (s) => s?.worstScore?.score || 0 },
    { label: t("components.comparatorCharts.metricParticipations"), icon: "🎯", getDisplayValue: (s) => formatNumber(s?.totalScores), getRawValue: (s) => s?.totalScores || 0 },
    { label: t("components.comparatorCharts.metricTotalPoints"), icon: "💰", getDisplayValue: (s) => formatScore(s?.totalPoints), getRawValue: (s) => s?.totalPoints || 0 },
    { label: t("components.comparatorCharts.metricMissRate"), icon: "⚠️", getDisplayValue: (s) => typeof s?.missRate === "number" ? `${s.missRate}%` : "N/A", getRawValue: (s) => s?.missRate || 0, inverse: true },
  ], [t]);

  const guildTableMetrics = useMemo<TableMetricDef[]>(() => [
    { label: t("components.comparatorCharts.metricMemberCount"), icon: "👥", getDisplayValue: (s) => formatNumber(s?.totalMembers), getRawValue: (s) => s?.totalMembers || 0 },
    { label: t("components.comparatorCharts.metricAvgScore"), icon: "📊", getDisplayValue: (s) => formatScore(s?.averageScore), getRawValue: (s) => s?.averageScore || 0 },
    { label: t("components.comparatorCharts.metricBestScore"), icon: "🏆", getDisplayValue: (s) => formatNumber(s?.bestScore), getRawValue: (s) => s?.bestScore || 0 },
    { label: t("components.comparatorCharts.metricTotalParticipations"), icon: "🎯", getDisplayValue: (s) => formatNumber(s?.totalScores), getRawValue: (s) => s?.totalScores || 0 },
    { label: t("components.comparatorCharts.metricTotalPoints"), icon: "💰", getDisplayValue: (s) => formatScore(s?.totalPoints), getRawValue: (s) => s?.totalPoints || 0 },
  ], [t]);

  // Load from URL on mount
  useEffect(() => {
    if (comparisonType === "players") {
      const ids = searchParams.get("players")?.split(",") || [];
      const valid: SelectedPlayer[] = [];
      ids.forEach((id) => {
        const user = users.find((u) => u._id === id);
        if (user) valid.push({ id, user });
      });
      if (valid.length > 0) setSelectedPlayers(valid);
    } else {
      const ids = searchParams.get("guilds")?.split(",") || [];
      const valid: SelectedGuild[] = [];
      ids.forEach((id) => {
        const guild = guilds.find((g) => g._id === id);
        if (guild) valid.push({ id, guild });
      });
      if (valid.length > 0) setSelectedGuilds(valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, guilds, comparisonType]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", comparisonType);
    if (comparisonType === "players" && selectedPlayers.length > 0)
      params.set("players", selectedPlayers.map((p) => p.id).join(","));
    else if (comparisonType === "guilds" && selectedGuilds.length > 0)
      params.set("guilds", selectedGuilds.map((g) => g.id).join(","));
    if (selectedCycleId) params.set("cycle_id", selectedCycleId);
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonType, selectedPlayers, selectedGuilds, selectedCycleId]);

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

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    setPlayersStats(new Map());
    setGuildsStats(new Map());
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setSelectedGuilds([]);
    setSelectedCycleId("");
    setPlayersStats(new Map());
    setGuildsStats(new Map());
    setSearchParams(new URLSearchParams({ type: comparisonType }));
  };

  const handleSwitchType = (type: "players" | "guilds") => {
    setComparisonType(type);
    setSearchParams(new URLSearchParams({ type }));
  };

  // Derived data for charts
  const playersData = selectedPlayers.map((p, i) => ({
    name: p.user.bbs_name || p.user.global_name || "Joueur",
    stats: playersStats.get(p.id) || null,
    color: ENTITY_COLORS[i % ENTITY_COLORS.length],
  }));

  const guildsData = selectedGuilds.map((g, i) => ({
    name: g.guild.name,
    stats: guildsStats.get(g.id) || null,
    color: ENTITY_COLORS[i % ENTITY_COLORS.length],
  }));

  const hasPlayersStats = playersStats.size > 0 && Array.from(playersStats.values()).some((s) => s !== null);
  const hasGuildsStats = guildsStats.size > 0 && Array.from(guildsStats.values()).some((s) => s !== null);

  const isPlayers = comparisonType === "players";
  const selectedCount = isPlayers ? selectedPlayers.length : selectedGuilds.length;
  const canCompare = selectedCount >= 2;
  const hasResults = isPlayers ? hasPlayersStats : hasGuildsStats;

  const compareWord = isPlayers
    ? selectedCount > 1 ? t("pages.comparator.wordPlayers") : t("pages.comparator.wordPlayer")
    : selectedCount > 1 ? t("pages.comparator.wordGuilds") : t("pages.comparator.wordGuild");

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
                    variant={!isPlayers ? "solid" : "outline"}
                    colorScheme={!isPlayers ? "purple" : "gray"}
                    leftIcon={<Icon as={FiShield} />}
                    onClick={() => handleSwitchType("guilds")}
                  >
                    {t("pages.comparator.tabGuilds")}
                    {selectedGuilds.length > 0 && (
                      <Badge ml={2} colorScheme="purple" variant={!isPlayers ? "solid" : "outline"} fontSize="2xs" borderRadius="full">
                        {selectedGuilds.length}
                      </Badge>
                    )}
                  </Button>
                </ButtonGroup>

                {/* Cycle select */}
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
              />
            ) : (
              <MultiGuildSelector
                selectedGuilds={selectedGuilds}
                onAddGuild={handleAddGuild}
                onRemoveGuild={handleRemoveGuild}
                availableGuilds={guilds}
                maxGuilds={5}
                entityColors={ENTITY_COLORS}
              />
            )}

            {/* Min 2 alert */}
            {!isLoadingStats && selectedCount < 2 && (
              <Alert status="info" borderRadius="xl" fontSize="sm" py={2}>
                <AlertIcon />
                {isPlayers
                  ? t("pages.comparator.alertMin2Players")
                  : t("pages.comparator.alertMin2Guilds")}
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

            {/* Results – side-by-side on xl+ */}
            {!isLoadingStats && hasResults && (
              <Grid
                templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }}
                gap={5}
                alignItems="stretch"
              >
                <ComparisonRadarChart
                  entities={isPlayers ? playersData : guildsData}
                  metrics={isPlayers ? playerRadarMetrics : guildRadarMetrics}
                  heading={t(isPlayers
                    ? "components.comparatorCharts.radarHeadingPlayers"
                    : "components.comparatorCharts.radarHeadingGuilds"
                  )}
                  accentBg={isPlayers ? playerAccentBg : guildAccentBg}
                />
                <ComparisonDataTable
                  entities={isPlayers ? playersData : guildsData}
                  metrics={isPlayers ? playerTableMetrics : guildTableMetrics}
                  heading={t(isPlayers
                    ? "components.comparatorCharts.tableHeadingPlayers"
                    : "components.comparatorCharts.tableHeadingGuilds"
                  )}
                  accentBg={isPlayers ? playerAccentBg : guildAccentBg}
                />
              </Grid>
            )}

          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ComparatorPage;
