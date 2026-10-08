import { Container, VStack, Box, useColorModeValue, useToast, HStack, Button, Text } from "@chakra-ui/react";
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
import { useCycles, useGuilds, usePodiumFetch } from "@/hooks/useAPI";
import { PodiumFilters } from "@/components/podium/PodiumFilters";
import { PodiumInfo } from "@/components/podium/PodiumInfo";
import { PodiumResults } from "@/components/podium/PodiumResults";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";
type CycleRankingType = PodiumRankingType;

interface FilterOverrides {
  page?: number;
  mode?: DisplayMode;
  rankingType?: CycleRankingType;
  cycleId?: string;
  rotationId?: string;
  guildName?: string;
  weekNumber?: string;
  limit?: number;
}

const PodiumPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { t } = useTranslation();
  const hasLoadedFromURL = useRef(false);
  // applyFilters réécrit l'URL avec new URLSearchParams(...) et ne connaît pas "capture" :
  // on le lit une seule fois au montage pour survivre à ces réécritures.
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
  const [selectedGuildName, setSelectedGuildName] = useState(
    searchParams.get("guild_name") || ""
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("limit") || "50")
  );

  const { cycles, isLoading: cyclesLoading } = useCycles();
  const { guilds } = useGuilds(false, true);
  const { fetchPodium, isLoading, error } = usePodiumFetch();
  const { currentUser, isLoggedIn } = useAuth();

  const filterBg = useColorModeValue("blue.50", "blue.900");
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

  // Applique les filtres : met à jour l'URL et charge le podium en une seule opération.
  // Les valeurs non fournies dans `overrides` sont lues depuis le state courant.
  const applyFilters = async (overrides: FilterOverrides = {}) => {
    const mode = overrides.mode ?? displayMode;
    const rankingType = overrides.rankingType ?? cycleRankingType;
    const cycleId = overrides.cycleId ?? selectedCycleId;
    const rotationId = 'rotationId' in overrides ? (overrides.rotationId ?? '') : selectedRotationId;
    const guildName = overrides.guildName ?? selectedGuildName;
    const weekNumber = 'weekNumber' in overrides ? (overrides.weekNumber ?? '') : selectedWeekNumber;
    const page = overrides.page ?? 1;
    const limit = overrides.limit ?? itemsPerPage;

    const params = new URLSearchParams();
    if (mode !== "cycle") params.set("mode", mode);
    if (mode === "cycle" && rankingType !== "average") params.set("ranking_type", rankingType);
    const cycleObj = cycleId ? cycles.find(c => c._id === cycleId) : undefined;
    if (cycleId) params.set("cycle_name", cycleObj ? cycleSlug(cycleObj.name, cycleObj.year) : cycleId);
    const rotationPos = rotationId && cycleObj
      ? cycleObj.rotations.find(r => r.rotation_id === rotationId)?.position
      : undefined;
    if (rotationPos !== undefined) params.set("rotation", rotationPos.toString());
    if (weekNumber) params.set("week_number", weekNumber);
    if (guildName) params.set("guild_name", guildName);
    if (limit !== 50) params.set("limit", limit.toString());
    if (page !== 1) params.set("page", page.toString());
    setSearchParams(params);

    const data = await fetchPodium(mode, cycleObj?.name || "", {
      cycleYear: cycleObj?.year, rankingType, rotationId, weekNumber, guildName, page, limit,
    });

    if (data) {
      setPodiumData(data);
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

  // Chargement initial depuis l'URL
  useEffect(() => {
    if (hasLoadedFromURL.current) return;

    const currentPage = parseInt(searchParams.get("page") || "1");
    const currentMode = (searchParams.get("mode") as DisplayMode) || "cycle";
    const currentRankingType = (searchParams.get("ranking_type") as CycleRankingType) || "average";
    const currentCycleSlug = searchParams.get("cycle_name") || "";
    const currentRotationPos = searchParams.get("rotation") || "";
    const currentGuildName = searchParams.get("guild_name") || "";
    const currentWeekNumber = searchParams.get("week_number") || "";

    // Résolution slug → _id
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

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);

    let rotationId = selectedRotationId;
    let weekNumber = selectedWeekNumber;

    if (mode === "rotation" && !selectedRotationId && (selectedCycle?.rotations?.length ?? 0) > 0) {
      rotationId = selectedCycle!.rotations[0].rotation_id;
      setSelectedRotationId(rotationId);
    } else if (mode === "weekly" || mode === "misses") {
      rotationId = "";
      setSelectedRotationId("");
    }

    if (mode === "weekly" && !selectedWeekNumber) {
      weekNumber = "1";
      setSelectedWeekNumber("1");
    } else if (mode !== "weekly") {
      weekNumber = "";
      setSelectedWeekNumber("");
    }

    if (selectedCycleId) {
      applyFilters({ mode, rotationId, weekNumber });
    }
  };

  const handleCycleRankingTypeChange = (rankingType: CycleRankingType) => {
    setCycleRankingType(rankingType);
    if (displayMode === "cycle") applyFilters({ rankingType, rotationId: "", weekNumber: "" });
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
    setSelectedGuildName("");
    setSearchParams({});
    setPodiumData(null);
  };

  const selectedCycle = cycles.find((c) => c._id === selectedCycleId);
  const availableWeeks = selectedCycle
    ? Math.floor(selectedCycle.rotations.length / 2)
    : 0;

  // Rendu minimal (sans hero/filtres) utilisé par le bot Discord pour capturer
  // une image du podium à envoyer automatiquement dans un salon.
  const isCapture = isCaptureRef.current;
  if (isCapture) {
    // L'id "podium-capture" n'apparaît qu'une fois les données chargées : c'est le
    // signal attendu par le bot (Playwright) pour ne pas screenshoter le skeleton.
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
          </VStack>
        ) : null}
      </Box>
    );
  }

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
            {/* Raccourcis */}
            <HStack spacing={2} flexWrap="wrap">
              <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mr={1}>
                Raccourcis :
              </Text>
              <Button
                size="xs"
                variant="outline"
                colorScheme="blue"
                borderRadius="full"
                onClick={selectDefaultCycle}
              >
                Cycle en cours
              </Button>
              {isLoggedIn && currentUser?.guilde_id && (() => {
                const userGuild = guilds.find(g => g._id === currentUser.guilde_id);
                if (!userGuild) return null;
                const isActive = selectedGuildName === userGuild.name;
                return (
                  <Button
                    size="xs"
                    variant={isActive ? "solid" : "outline"}
                    colorScheme="purple"
                    borderRadius="full"
                    onClick={() => {
                      const next = isActive ? "" : userGuild.name;
                      setSelectedGuildName(next);
                      applyFilters({ guildName: next });
                    }}
                  >
                    Ma guilde
                  </Button>
                );
              })()}
            </HStack>

            <PodiumFilters
              displayMode={displayMode}
              cycleRankingType={cycleRankingType}
              selectedCycleId={selectedCycleId}
              selectedRotationId={selectedRotationId}
              selectedWeekNumber={selectedWeekNumber}
              selectedGuildName={selectedGuildName}
              itemsPerPage={itemsPerPage}
              cycles={cycles}
              guilds={guilds}
              selectedCycle={selectedCycle}
              availableWeeks={availableWeeks}
              onModeChange={handleModeChange}
              onCycleRankingTypeChange={handleCycleRankingTypeChange}
              onCycleChange={handleCycleChange}
              onRotationChange={handleRotationChange}
              onWeekChange={handleWeekChange}
              onGuildChange={handleGuildChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onReset={resetFilters}
              filterBg={filterBg}
            />

            {podiumData && (
              <PodiumInfo
                displayMode={displayMode}
                podiumData={podiumData}
                selectedCycle={selectedCycle}
                filterBg={filterBg}
              />
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
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default PodiumPage;
