import { Container, VStack, Box, useToast, Button, Icon } from "@chakra-ui/react";
import { FiClock, FiShield, FiStar } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import type {
  IPodiumResponse,
  IPodiumWeeklyResponse,
  IPodiumMissesResponse,
  PodiumRankingType,
} from "../interfaces";
import { SEOHead } from "@/components/SEOHead";
import { useCycles, useFollowing, useGuilds, usePodiumFetch, usePodiumMonths } from "@/hooks/useAPI";
import { PodiumFilters } from "@/components/podium/PodiumFilters";
import { PodiumInfo } from "@/components/podium/PodiumInfo";
import { PodiumResults } from "@/components/podium/PodiumResults";
import { MonthlyGuildRanking } from "@/components/podium/MonthlyGuildRanking";
import { MonthlyHallOfFame } from "@/components/podium/MonthlyHallOfFame";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";

type DisplayMode = "cycle" | "rotation" | "weekly" | "monthly" | "misses";
type CycleRankingType = PodiumRankingType;

interface FilterOverrides {
  page?: number;
  mode?: DisplayMode;
  rankingType?: CycleRankingType;
  cycleId?: string;
  rotationId?: string;
  guildName?: string;
  weekNumber?: string;
  month?: string;
  followedOnly?: boolean;
  limit?: number;
}

const PodiumPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { t } = useTranslation();
  const hasLoadedFromURL = useRef(false);
  // applyFilters rewrites the URL with new URLSearchParams(...) and does not know about "capture":
  // read it once on mount so it survives these rewrites.
  const isCaptureRef = useRef(searchParams.get("capture") === "1");

  const [podiumData, setPodiumData] = useState<
    IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse | null
  >(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    (searchParams.get("mode") as DisplayMode) || "cycle"
  );
  const [cycleRankingType, setCycleRankingType] = useState<CycleRankingType>(
    (searchParams.get("ranking_type") as CycleRankingType) || "average"
  );
  const [selectedCycleId, setSelectedCycleId] = useState(
    searchParams.get("cycle_name") || ""
  );
  const [selectedRotationId, setSelectedRotationId] = useState("");
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(
    searchParams.get("week_number") || ""
  );
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || "");
  const [followedOnly, setFollowedOnly] = useState(searchParams.get("suivis") === "1");
  const [selectedGuildName, setSelectedGuildName] = useState(
    searchParams.get("guild_name") || ""
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("limit") || "50")
  );

  const { cycles, isLoading: cyclesLoading } = useCycles();
  const { guilds } = useGuilds(false, true);
  const { months } = usePodiumMonths();
  const { followedIds } = useFollowing();
  const followedKey = followedIds.join(",");
  const { fetchPodium, isLoading, error } = usePodiumFetch();
  const { currentUser, isLoggedIn } = useAuth();

  const filterBg = "bg.subtle";
  const captureBg = "bg.card";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Podium des joueurs - Bleach Brave Souls | Schrift BBS",
    "description": "Classement des meilleurs joueurs de Bleach Brave Souls par cycle et rotation.",
    "url": "https://bbs-schrift.fr/podium",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Classement des meilleurs joueurs",
      "description": "Top joueurs et scores de Guild Quest"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://bbs-schrift.fr" },
        { "@type": "ListItem", "position": 2, "name": "Podium", "item": "https://bbs-schrift.fr/podium" }
      ]
    },
    "about": { "@type": "Game", "name": "Bleach Brave Souls" }
  };

  // Applies the filters: updates the URL and loads the podium in a single step.
  // Values missing from `overrides` are read from the current state.
  const applyFilters = async (overrides: FilterOverrides = {}) => {
    const mode = overrides.mode ?? displayMode;
    const rankingType = overrides.rankingType ?? cycleRankingType;
    const cycleId = overrides.cycleId ?? selectedCycleId;
    const rotationId = 'rotationId' in overrides ? (overrides.rotationId ?? '') : selectedRotationId;
    const guildName = overrides.guildName ?? selectedGuildName;
    const weekNumber = 'weekNumber' in overrides ? (overrides.weekNumber ?? '') : selectedWeekNumber;
    const month = overrides.month ?? selectedMonth;
    const onlyFollowed = overrides.followedOnly ?? followedOnly;
    const page = overrides.page ?? 1;
    const limit = overrides.limit ?? itemsPerPage;

    const params = new URLSearchParams();
    if (mode !== "cycle") params.set("mode", mode);
    if ((mode === "cycle" || mode === "monthly") && rankingType !== "average") params.set("ranking_type", rankingType);
    if (mode === "monthly" && month) params.set("month", month);
    const cycleObj = cycleId ? cycles.find(c => c._id === cycleId) : undefined;
    if (cycleId) params.set("cycle_name", cycleObj ? cycleSlug(cycleObj.name, cycleObj.year) : cycleId);
    const rotationPos = rotationId && cycleObj
      ? cycleObj.rotations.find(r => r.rotation_id === rotationId)?.position
      : undefined;
    if (rotationPos !== undefined) params.set("rotation", rotationPos.toString());
    if (weekNumber) params.set("week_number", weekNumber);
    if (guildName) params.set("guild_name", guildName);
    if (onlyFollowed) params.set("suivis", "1");
    if (limit !== 50) params.set("limit", limit.toString());
    if (page !== 1) params.set("page", page.toString());
    setSearchParams(params);

    const data = await fetchPodium(mode, cycleObj?.name || "", {
      cycleYear: cycleObj?.year, rankingType, rotationId, weekNumber, month, guildName, page, limit,
      bbsIds: onlyFollowed ? followedIds : undefined,
    });

    if (data) {
      setPodiumData(data);
      // Without a month the API picks the current one: reflect it in the selector
      if (mode === "monthly" && "filters" in data && data.filters && "month" in data.filters && data.filters.month) {
        setSelectedMonth(data.filters.month);
      }
    } else if (error) {
      toast({ title: t("common.error"), description: error, status: "error", duration: 3000 });
    }
  };

  const selectDefaultCycle = () => {
    if (cycles.length === 0) return;
    const now = new Date();
    let cycleToSelect = cycles[0];

    for (const cycle of cycles) {
      if (cycle.rotations?.length > 0) {
        const first = cycle.rotations[0];
        const last = cycle.rotations[cycle.rotations.length - 1];
        if (first.start_date && last.end_date) {
          const start = new Date(first.start_date);
          const end = new Date(last.end_date);
          if (now >= start && now <= end) { cycleToSelect = cycle; break; }
        }
      }
    }

    const cycleId = cycleToSelect._id || "";
    setSelectedCycleId(cycleId);
    applyFilters({ cycleId, rotationId: "", weekNumber: "" });
  };

  // Initial load from the URL
  useEffect(() => {
    if (hasLoadedFromURL.current) return;

    const currentPage = parseInt(searchParams.get("page") || "1");
    const currentMode = (searchParams.get("mode") as DisplayMode) || "cycle";
    const currentRankingType = (searchParams.get("ranking_type") as CycleRankingType) || "average";
    const currentCycleSlug = searchParams.get("cycle_name") || "";
    const currentRotationPos = searchParams.get("rotation") || "";
    const currentGuildName = searchParams.get("guild_name") || "";
    const currentWeekNumber = searchParams.get("week_number") || "";

    // Resolve the slug into its _id
    const resolvedCycleId = currentCycleSlug && cycles.length > 0
      ? (cycleFromSlug(cycles, currentCycleSlug)?._id ?? currentCycleSlug)
      : currentCycleSlug;
    const resolvedCycle = resolvedCycleId ? cycles.find(c => c._id === resolvedCycleId) : undefined;
    const currentRotationId = currentRotationPos && resolvedCycle
      ? (resolvedCycle.rotations.find(r => r.position === parseInt(currentRotationPos))?.rotation_id ?? "")
      : "";

    setDisplayMode(currentMode);
    setCycleRankingType(currentRankingType);
    setSelectedCycleId(resolvedCycleId);
    setSelectedRotationId(currentRotationId);
    setSelectedGuildName(currentGuildName);
    setSelectedWeekNumber(currentWeekNumber);

    if (resolvedCycleId && !cyclesLoading && cycles.length > 0) {
      applyFilters({
        page: currentPage,
        mode: currentMode,
        rankingType: currentRankingType,
        cycleId: resolvedCycleId,
        rotationId: currentRotationId,
        guildName: currentGuildName,
        weekNumber: currentWeekNumber,
      });
      hasLoadedFromURL.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, cyclesLoading]);

  useEffect(() => {
    if (!cyclesLoading && cycles.length > 0 && !selectedCycleId) {
      selectDefaultCycle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, cyclesLoading]);


  // The followed list loads after the page: reload once it is known
  useEffect(() => {
    if (followedOnly && hasLoadedFromURL.current) applyFilters({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedKey]);

  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);

    let rotationId = selectedRotationId;
    let weekNumber = selectedWeekNumber;

    if (mode === "rotation" && !selectedRotationId && (selectedCycle?.rotations?.length ?? 0) > 0) {
      rotationId = selectedCycle!.rotations[0].rotation_id;
      setSelectedRotationId(rotationId);
    } else if (mode === "weekly" || mode === "monthly" || mode === "misses") {
      rotationId = "";
      setSelectedRotationId("");
    }

    let rankingType = cycleRankingType;
    if (mode === "monthly" && rankingType === "progression") {
      rankingType = "average";
      setCycleRankingType(rankingType);
    }

    if (mode === "weekly" && !selectedWeekNumber) {
      weekNumber = "1";
      setSelectedWeekNumber("1");
    } else if (mode !== "weekly") {
      weekNumber = "";
      setSelectedWeekNumber("");
    }

    if (selectedCycleId || mode === "monthly") {
      applyFilters({ mode, rankingType, rotationId, weekNumber });
    }
  };

  const handleCycleRankingTypeChange = (rankingType: CycleRankingType) => {
    setCycleRankingType(rankingType);
    if (displayMode === "cycle" || displayMode === "monthly") applyFilters({ rankingType, rotationId: "", weekNumber: "" });
  };

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    setSelectedRotationId("");
    setSelectedWeekNumber("");
    applyFilters({ cycleId, rotationId: "", weekNumber: "" });
  };

  const handleRotationChange = (rotationId: string) => {
    setSelectedRotationId(rotationId);
    setDisplayMode("rotation");
    applyFilters({ mode: "rotation", rotationId });
  };

  const handleWeekChange = (weekNumber: string) => {
    setSelectedWeekNumber(weekNumber);
    applyFilters({ mode: "weekly", rotationId: "", weekNumber });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    applyFilters({ month });
  };

  const handleGuildChange = (guildName: string) => {
    setSelectedGuildName(guildName);
    applyFilters({ guildName });
  };

  const handlePageChange = (page: number) => {
    applyFilters({ page });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    applyFilters({ limit: newLimit });
  };

  const resetFilters = () => {
    setDisplayMode("cycle");
    setCycleRankingType("average");
    setSelectedCycleId("");
    setSelectedRotationId("");
    setSelectedWeekNumber("");
    setSelectedMonth("");
    setSelectedGuildName("");
    setFollowedOnly(false);
    setSearchParams({});
    setPodiumData(null);
  };

  const selectedCycle = cycles.find((c) => c._id === selectedCycleId);
  const availableWeeks = selectedCycle
    ? Math.floor(selectedCycle.rotations.length / 2)
    : 0;

  // Minimal render (no hero or filters) used by the Discord bot to capture a podium image that is
  // posted automatically in a channel.
  const isCapture = isCaptureRef.current;
  if (isCapture) {
    // The "podium-capture" id only appears once data is loaded: it is the signal the bot (Playwright)
    // waits for so it does not screenshot the skeleton.
    return (
      <Box w="1100px">
        {podiumData ? (
          <VStack id="podium-capture" spacing={5} align="stretch" bg={captureBg} p={6}>
            <PodiumInfo
              displayMode={displayMode}
              podiumData={podiumData}
              selectedCycle={selectedCycle}
              filterBg={filterBg}
            />
            <PodiumResults
              displayMode={displayMode}
              isLoading={isLoading}
              podiumData={podiumData}
              selectedCycleId={selectedCycleId}
              selectedWeekNumber={selectedWeekNumber}
              selectedGuildName={selectedGuildName}
              onPageChange={handlePageChange}
            />

            {displayMode === "monthly" && (
              <MonthlyHallOfFame
                onSelectMonth={(month) => {
                  handleMonthChange(month);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </VStack>
        ) : null}
      </Box>
    );
  }

  const userGuild = isLoggedIn && currentUser?.guilde_id
    ? guilds.find((g) => g._id === currentUser.guilde_id)
    : undefined;
  const isMyGuildActive = Boolean(userGuild && selectedGuildName === userGuild.name);

  return (
    <>
      <SEOHead
        title={t("pages.podium.seoTitle")}
        description={t("pages.podium.seoDescription")}
        keywords="joueurs, classements, statistiques"
        url="https://bbs-schrift.fr/joueurs"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title={t("pages.podium.heroTitle")}
          description={
            displayMode === "rotation"
              ? t("pages.podium.heroDescriptionRotation")
              : displayMode === "weekly"
              ? t("pages.podium.heroDescriptionWeekly")
              : displayMode === "monthly"
              ? t("pages.podium.heroDescriptionMonthly")
              : displayMode === "misses"
              ? t("pages.podium.heroDescriptionMisses")
              : cycleRankingType === "max"
              ? t("pages.podium.heroDescriptionMax")
              : cycleRankingType === "progression"
              ? t("pages.podium.heroDescriptionProgression")
              : t("pages.podium.heroDescriptionAverage")
          }
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={5} align="stretch">
            <PodiumFilters
              displayMode={displayMode}
              cycleRankingType={cycleRankingType}
              selectedCycleId={selectedCycleId}
              selectedRotationId={selectedRotationId}
              selectedWeekNumber={selectedWeekNumber}
              selectedMonth={selectedMonth}
              selectedGuildName={selectedGuildName}
              itemsPerPage={itemsPerPage}
              cycles={cycles}
              guilds={guilds}
              selectedCycle={selectedCycle}
              availableWeeks={availableWeeks}
              months={months}
              onModeChange={handleModeChange}
              onCycleRankingTypeChange={handleCycleRankingTypeChange}
              onCycleChange={handleCycleChange}
              onRotationChange={handleRotationChange}
              onWeekChange={handleWeekChange}
              onMonthChange={handleMonthChange}
              onGuildChange={handleGuildChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onReset={resetFilters}
              shortcuts={
                <>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="purple"
                    borderRadius="full"
                    leftIcon={<Icon as={FiClock} />}
                    onClick={selectDefaultCycle}
                  >
                    {t("components.podiumFilters.shortcutCurrentCycle")}
                  </Button>
                  {isLoggedIn && followedIds.length > 0 && displayMode !== "misses" && (
                    <Button
                      size="xs"
                      variant={followedOnly ? "solid" : "outline"}
                      colorScheme="yellow"
                      borderRadius="full"
                      leftIcon={<Icon as={FiStar} />}
                      aria-pressed={followedOnly}
                      onClick={() => {
                        setFollowedOnly(!followedOnly);
                        applyFilters({ followedOnly: !followedOnly });
                      }}
                    >
                      {t("components.podiumFilters.shortcutFollowed")}
                    </Button>
                  )}
                  {userGuild && (
                    <Button
                      size="xs"
                      variant={isMyGuildActive ? "solid" : "outline"}
                      colorScheme="purple"
                      borderRadius="full"
                      leftIcon={<Icon as={FiShield} />}
                      aria-pressed={isMyGuildActive}
                      onClick={() => {
                        const next = isMyGuildActive ? "" : userGuild.name;
                        setSelectedGuildName(next);
                        applyFilters({ guildName: next });
                      }}
                    >
                      {t("components.podiumFilters.shortcutMyGuild")}
                    </Button>
                  )}
                </>
              }
            />

            {podiumData && (
              <PodiumInfo
                displayMode={displayMode}
                podiumData={podiumData}
                selectedCycle={selectedCycle}
                filterBg={filterBg}
              />
            )}

            {displayMode === "monthly" && selectedMonth && !selectedGuildName && (
              <MonthlyGuildRanking month={selectedMonth} />
            )}

            <PodiumResults
              displayMode={displayMode}
              isLoading={isLoading}
              podiumData={podiumData}
              selectedCycleId={selectedCycleId}
              selectedWeekNumber={selectedWeekNumber}
              selectedGuildName={selectedGuildName}
              onPageChange={handlePageChange}
            />

            {displayMode === "monthly" && (
              <MonthlyHallOfFame
                onSelectMonth={(month) => {
                  handleMonthChange(month);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default PodiumPage;
