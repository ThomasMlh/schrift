import { Container, VStack, Box, useColorModeValue, useToast } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import type {
  IPodiumResponse,
  IPodiumWeeklyResponse,
  IPodiumMissesResponse,
} from "../interfaces";
import { SEOHead } from "@/components/SEOHead";
import { useCycles, useGuilds, usePodiumFetch } from "@/hooks/useAPI";
import { PodiumFilters } from "@/components/podium/PodiumFilters";
import { PodiumInfo } from "@/components/podium/PodiumInfo";
import { PodiumResults } from "@/components/podium/PodiumResults";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";

const PodiumPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const hasLoadedFromURL = useRef(false);

  // États
  const [podiumData, setPodiumData] = useState<
    IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse | null
  >(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    (searchParams.get("mode") as DisplayMode) || "cycle"
  );
  const [selectedCycleId, setSelectedCycleId] = useState(
    searchParams.get("cycle_id") || ""
  );
  const [selectedRotationId, setSelectedRotationId] = useState(
    searchParams.get("rotation_id") || ""
  );
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(
    searchParams.get("week_number") || ""
  );
  const [selectedGuildName, setSelectedGuildName] = useState(
    searchParams.get("guild_name") || ""
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("limit") || "50")
  );

  // Hooks
  const { cycles, isLoading: cyclesLoading } = useCycles();
  const { guilds } = useGuilds();
  const { fetchPodium, isLoading, error } = usePodiumFetch();

  // UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const filterBg = useColorModeValue("blue.50", "blue.900");

  // Structured Data
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
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://bbs-schrift.fr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Podium",
          "item": "https://bbs-schrift.fr/podium"
        }
      ]
    },
    "about": {
      "@type": "Game",
      "name": "Bleach Brave Souls"
    }
  };

  // Fonction pour mettre à jour l'URL
  const updateURLParams = (
    mode: DisplayMode = displayMode,
    cycleId = "",
    rotationId = "",
    guildName = "",
    weekNumber = "",
    limit = itemsPerPage,
    page = 1
  ) => {
    const params = new URLSearchParams();
    if (mode && mode !== "cycle") params.set("mode", mode);
    if (cycleId) params.set("cycle_id", cycleId);
    if (rotationId) params.set("rotation_id", rotationId);
    if (weekNumber) params.set("week_number", weekNumber);
    if (guildName) params.set("guild_name", guildName);
    if (limit !== 50) params.set("limit", limit.toString());
    if (page !== 1) params.set("page", page.toString());
    setSearchParams(params);
  };

  // Fonction pour charger le podium
  const loadPodium = async (
    page = 1,
    mode: DisplayMode = displayMode,
    cycleId = "",
    rotationId = "",
    guildName = "",
    weekNumber = "",
    limit = itemsPerPage
  ) => {
    // Trouver le cycle pour obtenir son nom
    const cycle = cycles.find(c => c._id === cycleId);
    const cycleName = cycle?.name || "";
    
    const data = await fetchPodium(mode, cycleName, {
      rotationId,
      weekNumber,
      guildName,
      page,
      limit,
    });

    if (data) {
      setPodiumData(data);
    } else if (error) {
      toast({
        title: "Erreur",
        description: error,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Sélectionner le cycle par défaut
  const selectDefaultCycle = () => {
    if (cycles.length > 0) {
      const now = new Date();
      let cycleToSelect = cycles[0];

      for (const cycle of cycles) {
        if (cycle.rotations && cycle.rotations.length > 0) {
          const firstRotation = cycle.rotations[0];
          const lastRotation = cycle.rotations[cycle.rotations.length - 1];

          if (firstRotation.start_date && lastRotation.end_date) {
            const startDate = new Date(firstRotation.start_date);
            const endDate = new Date(lastRotation.end_date);

            if (now >= startDate && now <= endDate) {
              cycleToSelect = cycle;
              break;
            }
          }
        }
      }

      setSelectedCycleId(cycleToSelect._id || "");
      loadPodium(1, displayMode, cycleToSelect._id || "", "", "", "");
      updateURLParams(
        displayMode,
        cycleToSelect._id || "",
        "",
        "",
        "",
        itemsPerPage,
        1
      );
    }
  };

  // Chargement initial depuis l'URL
  useEffect(() => {
    // Ne charger qu'une seule fois au montage si l'URL contient un cycle_id
    if (hasLoadedFromURL.current) return;
    
    const currentPage = parseInt(searchParams.get("page") || "1");
    const currentMode = (searchParams.get("mode") as DisplayMode) || "cycle";
    const currentCycleId = searchParams.get("cycle_id") || "";
    const currentRotationId = searchParams.get("rotation_id") || "";
    const currentGuildName = searchParams.get("guild_name") || "";
    const currentWeekNumber = searchParams.get("week_number") || "";

    setDisplayMode(currentMode);
    setSelectedCycleId(currentCycleId);
    setSelectedRotationId(currentRotationId);
    setSelectedGuildName(currentGuildName);
    setSelectedWeekNumber(currentWeekNumber);

    // Attendre que les cycles soient chargés avant de charger le podium
    if (currentCycleId && !cyclesLoading && cycles.length > 0) {
      loadPodium(
        currentPage,
        currentMode,
        currentCycleId,
        currentRotationId,
        currentGuildName,
        currentWeekNumber
      );
      hasLoadedFromURL.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, cyclesLoading]); // Ajouter cycles et cyclesLoading comme dépendances

  // Sélectionner le cycle par défaut
  useEffect(() => {
    if (!cyclesLoading && cycles.length > 0 && !selectedCycleId) {
      selectDefaultCycle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, cyclesLoading]);

  // Handlers
  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    
    let rotationIdToUse = selectedRotationId;
    let weekNumberToUse = selectedWeekNumber;
    
    if (mode === "rotation" && !selectedRotationId && selectedCycle && selectedCycle.rotations && selectedCycle.rotations.length > 0) {
      // Sélectionner la première rotation par défaut
      rotationIdToUse = selectedCycle.rotations[0].rotation_id;
      setSelectedRotationId(rotationIdToUse);
    } else if (mode === "weekly" || mode === "misses") {
      rotationIdToUse = "";
      setSelectedRotationId("");
    }
    
    if (mode === "weekly" && !selectedWeekNumber) {
      // Sélectionner la semaine 1 par défaut
      weekNumberToUse = "1";
      setSelectedWeekNumber("1");
    } else if (mode !== "weekly") {
      weekNumberToUse = "";
      setSelectedWeekNumber("");
    }
    
    if (selectedCycleId) {
      loadPodium(1, mode, selectedCycleId, rotationIdToUse, selectedGuildName, weekNumberToUse);
      updateURLParams(mode, selectedCycleId, rotationIdToUse, selectedGuildName, weekNumberToUse, itemsPerPage, 1);
    }
  };

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    setSelectedRotationId("");
    setSelectedWeekNumber("");
    loadPodium(1, displayMode, cycleId, "", selectedGuildName, "");
    updateURLParams(displayMode, cycleId, "", selectedGuildName, "", itemsPerPage, 1);
  };

  const handleRotationChange = (rotationId: string) => {
    setSelectedRotationId(rotationId);
    setDisplayMode("rotation");
    loadPodium(1, "rotation", selectedCycleId, rotationId, selectedGuildName, "");
    updateURLParams("rotation", selectedCycleId, rotationId, selectedGuildName, "", itemsPerPage, 1);
  };

  const handleWeekChange = (weekNumber: string) => {
    setSelectedWeekNumber(weekNumber);
    loadPodium(1, "weekly", selectedCycleId, "", selectedGuildName, weekNumber);
    updateURLParams("weekly", selectedCycleId, "", selectedGuildName, weekNumber, itemsPerPage, 1);
  };

  const handleGuildChange = (guildName: string) => {
    setSelectedGuildName(guildName);
    loadPodium(1, displayMode, selectedCycleId, selectedRotationId, guildName, selectedWeekNumber);
    updateURLParams(displayMode, selectedCycleId, selectedRotationId, guildName, selectedWeekNumber, itemsPerPage, 1);
  };

  const handlePageChange = (page: number) => {
    loadPodium(page, displayMode, selectedCycleId, selectedRotationId, selectedGuildName, selectedWeekNumber);
    updateURLParams(displayMode, selectedCycleId, selectedRotationId, selectedGuildName, selectedWeekNumber, itemsPerPage, page);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    loadPodium(1, displayMode, selectedCycleId, selectedRotationId, selectedGuildName, selectedWeekNumber, newLimit);
    updateURLParams(displayMode, selectedCycleId, selectedRotationId, selectedGuildName, selectedWeekNumber, newLimit, 1);
  };

  const resetFilters = () => {
    setDisplayMode("cycle");
    setSelectedCycleId("");
    setSelectedRotationId("");
    setSelectedWeekNumber("");
    setSelectedGuildName("");
    setSearchParams({});
    setPodiumData(null);
  };

  // Cycle sélectionné et semaines disponibles
  const selectedCycle = cycles.find((c) => c._id === selectedCycleId);
  const availableWeeks = selectedCycle
    ? Math.floor(selectedCycle.rotations.length / 2)
    : 0;

  return (
    <>
      <SEOHead
        title="Schrift BBS - Podium des Joueurs - Bleach Brave Souls"
        description="Découvrez tous les joueurs de Bleach Brave Souls. Consultez leurs statistiques, classements et informations de guilde."
        keywords="joueurs, classements, statistiques"
        url="https://bbs-schrift.fr/joueurs"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title="Podium des Joueurs"
          description={
            displayMode === "rotation"
              ? "Classement des scores individuels pour une rotation"
              : displayMode === "weekly"
              ? "Classement par semaine (2 rotations)"
              : displayMode === "misses"
              ? "Classement des miss (scores négatifs)"
              : "Classement des moyennes par cycle"
          }
          badge={{ text: "Classement", icon: "🏆" }}
        />

        <Container maxW="container.xl" py={8}>
          <Box
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            p={{ base: 4, md: 6 }}
            w={{ base: "100%", md: "90%" }}
            mx="auto"
          >
            <VStack spacing={6} align="stretch">
              {/* Filtres */}
              <PodiumFilters
                displayMode={displayMode}
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
                onCycleChange={handleCycleChange}
                onRotationChange={handleRotationChange}
                onWeekChange={handleWeekChange}
                onGuildChange={handleGuildChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onReset={resetFilters}
                filterBg={filterBg}
              />

              {/* Informations contextuelles */}
              {podiumData && (
                <PodiumInfo
                  displayMode={displayMode}
                  podiumData={podiumData}
                  selectedCycle={selectedCycle}
                  filterBg={filterBg}
                />
              )}

              {/* Résultats */}
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
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default PodiumPage;
