import {
  Container,
  VStack,
  Text,
  Flex,
  Select,
  Button,
  Box,
  Badge,
  HStack,
  Spinner,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination as PaginationComponent } from "../components/ui/Pagination";
import { HeroSection } from "../components/HeroSection";
import type { ICycleRotation, IPodiumResponse } from "../interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { SEOHead } from "@/components/SEOHead";
import PlayerCard from "@/components/ui/PlayerCard";
import CustomLink from "@/components/ui/CustomLink";
import { ScoreLegend } from "@/components/ui/ScoreLegend";
import { useCycles, useGuilds } from "@/hooks/useAPI";

const PodiumPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const toast = useToast();

  // États
  const [podiumData, setPodiumData] = useState<IPodiumResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Utilisation de useSWR pour les cycles et guildes (cache automatique)
  const { cycles, isLoading: cyclesLoading } = useCycles();
  const { guilds } = useGuilds();

  // Filtres
  const [selectedCycleName, setSelectedCycleName] = useState(
    searchParams.get("cycle_name") || ""
  );
  const [selectedRotationId, setSelectedRotationId] = useState(
    searchParams.get("rotation_id") || ""
  );
  const [selectedGuildName, setSelectedGuildName] = useState(
    searchParams.get("guild_name") || ""
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("limit") || "50")
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Podium des joueurs - Bleach Brave Souls | Schrift BBS",
    description:
      "Classement des meilleurs joueurs de Bleach Brave Souls par cycle et rotation.",
    url: "https://bbs-schrift.fr/podium"
  };

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const filterBg = useColorModeValue("blue.50", "blue.900");
  // Fonction pour mettre à jour l'URL avec les filtres actuels
  const updateURLParams = (
    cycleName = "",
    rotationId = "",
    guildName = "",
    limit = itemsPerPage,
    page = 1
  ) => {
    const params = new URLSearchParams();

    if (cycleName) params.set("cycle_name", cycleName);
    if (rotationId) params.set("rotation_id", rotationId);
    if (guildName) params.set("guild_name", guildName);
    if (limit !== 50) params.set("limit", limit.toString());
    if (page !== 1) params.set("page", page.toString());

    setSearchParams(params);
  };

  // Fonction pour charger le podium
  const loadPodium = async (
    page = 1,
    cycleName = "",
    rotationId = "",
    guildName = "",
    limit = itemsPerPage
  ) => {
    if (!cycleName) {
      setPodiumData(null);
      return;
    }

    setIsLoading(true);
    try {
      let url = `${apiUrl}/api/users/podium/full?cycle_name=${encodeURIComponent(
        cycleName
      )}&page=${page}&limit=${limit}`;

      if (rotationId && rotationId.trim() !== "") {
        url += `&rotation_id=${encodeURIComponent(rotationId)}`;
      }

      if (guildName && guildName.trim() !== "") {
        url += `&guild_name=${encodeURIComponent(guildName.trim())}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data: IPodiumResponse = await response.json();
        setPodiumData(data);
      } else {
        const errorData = await response.json();
        setPodiumData(null);
        toast({
          title: "Erreur",
          description: errorData.message || "Impossible de charger le podium",
          status: "error",
          duration: 3000
        });
      }
    } catch {
      setPodiumData(null);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du podium",
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les données de référence et sélectionner le cycle par défaut
  const selectDefaultCycle = () => {
    if (cycles.length > 0) {
      const now = new Date();
      let cycleToSelect = cycles[0]; // Par défaut, le premier cycle de l'API

      // Chercher le cycle en cours (celui dont les rotations incluent la date actuelle)
      for (const cycle of cycles) {
        if (cycle.rotations && cycle.rotations.length > 0) {
          const firstRotation = cycle.rotations[0];
          const lastRotation = cycle.rotations[cycle.rotations.length - 1];

          if (firstRotation.start_date && lastRotation.end_date) {
            const startDate = new Date(firstRotation.start_date);
            const endDate = new Date(lastRotation.end_date);

            // Vérifier si la date actuelle est comprise entre start_date et end_date
            if (now >= startDate && now <= endDate) {
              cycleToSelect = cycle;
              break;
            }
          }
        }
      }

      setSelectedCycleName(cycleToSelect.name);
      loadPodium(1, cycleToSelect.name, "", "");
      updateURLParams(cycleToSelect.name, "", "", itemsPerPage, 1);
    }
  };

  // Chargement initial
  useEffect(() => {
    const currentPage = parseInt(searchParams.get("page") || "1");
    const currentCycleName = searchParams.get("cycle_name") || "";
    const currentRotationId = searchParams.get("rotation_id") || "";
    const currentGuildName = searchParams.get("guild_name") || "";

    setSelectedCycleName(currentCycleName);
    setSelectedRotationId(currentRotationId);
    setSelectedGuildName(currentGuildName);

    if (currentCycleName) {
      // Si un cycle est dans l'URL, charger le podium avec ces paramètres
      loadPodium(
        currentPage,
        currentCycleName,
        currentRotationId,
        currentGuildName
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sélectionner le cycle par défaut lorsque les cycles sont chargés
  useEffect(() => {
    if (!cyclesLoading && cycles.length > 0 && !selectedCycleName) {
      selectDefaultCycle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, cyclesLoading]);

  // Gestionnaires d'événements
  const handleCycleChange = (cycleName: string) => {
    setSelectedCycleName(cycleName);
    setSelectedRotationId(""); // Reset rotation when cycle changes
    loadPodium(1, cycleName, "", selectedGuildName);
    updateURLParams(cycleName, "", selectedGuildName, itemsPerPage, 1);
  };

  const handleRotationChange = (rotationId: string) => {
    setSelectedRotationId(rotationId);
    loadPodium(1, selectedCycleName, rotationId, selectedGuildName);
    updateURLParams(
      selectedCycleName,
      rotationId,
      selectedGuildName,
      itemsPerPage,
      1
    );
  };

  const handleGuildChange = (guildName: string) => {
    setSelectedGuildName(guildName);
    loadPodium(1, selectedCycleName, selectedRotationId, guildName);
    updateURLParams(
      selectedCycleName,
      selectedRotationId,
      guildName,
      itemsPerPage,
      1
    );
  };

  const handlePageChange = (page: number) => {
    loadPodium(page, selectedCycleName, selectedRotationId, selectedGuildName);
    updateURLParams(
      selectedCycleName,
      selectedRotationId,
      selectedGuildName,
      itemsPerPage,
      page
    );
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    loadPodium(
      1,
      selectedCycleName,
      selectedRotationId,
      selectedGuildName,
      newLimit
    );
    updateURLParams(
      selectedCycleName,
      selectedRotationId,
      selectedGuildName,
      newLimit,
      1
    );
  };

  const resetFilters = () => {
    setSelectedCycleName("");
    setSelectedRotationId("");
    setSelectedGuildName("");
    setSearchParams({});
    setPodiumData(null);
  };

  // Obtenir le cycle sélectionné
  const selectedCycle = cycles.find((c) => c.name === selectedCycleName);

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
            selectedRotationId
              ? "Classement des scores individuels pour une rotation"
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
              {/* Contrôles de filtrage */}
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
                    {/* Filtre par cycle */}
                    <Select
                      placeholder="Sélectionner un cycle"
                      value={selectedCycleName}
                      onChange={(e) => handleCycleChange(e.target.value)}
                      maxW="200px"
                    >
                      {cycles.map((cycle) => (
                        <option key={cycle._id} value={cycle.name}>
                          {cycle.name}
                        </option>
                      ))}
                    </Select>
                    {/* Filtre par rotation */}
                    {selectedCycle && (
                      <Select
                        placeholder="Sélectionner une rotation"
                        value={selectedRotationId}
                        onChange={(e) => handleRotationChange(e.target.value)}
                        maxW="300px"
                      >
                        {selectedCycle.rotations.map((rotation: ICycleRotation) => (
                          <option
                            key={rotation.rotation_id}
                            value={rotation.rotation_id}
                          >
                            #{rotation.position} - {rotation.killer} (
                            {rotation.attack})
                          </option>
                        ))}
                      </Select>
                    )}
                    {/* Filtre par guilde */}
                    <Select
                      placeholder="Toutes les guildes"
                      value={selectedGuildName}
                      onChange={(e) => handleGuildChange(e.target.value)}
                      maxW="200px"
                    >
                      {guilds.map((guild) => (
                        <option key={guild._id} value={guild.name}>
                          {guild.name}
                        </option>
                      ))}
                    </Select>
                    {/* Éléments par page */}
                    <Select
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(parseInt(e.target.value))
                      }
                      maxW="120px"
                    >
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </Select>
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      minW="120px"
                    >
                      Réinitialiser
                    </Button>
                    <ScoreLegend />
                  </Flex>
                </Flex>
              </VStack>
              {/* Filtres actifs */}
              {(selectedCycleName || selectedGuildName) && (
                <Box p={3} bg={filterBg} borderRadius="md">
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontSize="sm" fontWeight="medium">
                      Filtres actifs:
                    </Text>
                    {selectedCycleName && (
                      <Badge colorScheme="blue">
                        Cycle: {selectedCycleName}
                      </Badge>
                    )}
                    {selectedGuildName && (
                      <Badge colorScheme="orange">
                        Guilde: {selectedGuildName}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )}
              {/* Informations sur la rotation */}
              {podiumData?.meta?.rotationInfo && (
                <Box p={4} bg={filterBg} borderRadius="md">
                  <VStack spacing={2}>
                    <Box
                      fontSize="lg"
                      fontWeight="bold"
                      flexWrap="wrap"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <CustomLink
                        to={`/cycle/${selectedCycle?._id}/rotation/${podiumData.meta.rotationInfo.position}`}
                        text={podiumData.meta.rotationInfo.killer}
                        textSize="md"
                      />
                      <AttackTypeBadge
                        attackType={podiumData.meta.rotationInfo.attack}
                      />
                    </Box>
                    <Text fontSize="sm">
                      {podiumData.meta.rotationInfo.start_date} →{" "}
                      {podiumData.meta.rotationInfo.end_date}
                    </Text>
                    <Text fontSize="md" fontWeight="bold">
                      Score moyen:{" "}
                      {podiumData.meta.averageScore?.toLocaleString("fr-FR")}
                    </Text>
                    <Text fontSize="sm">
                      {podiumData.meta.totalPlayers} joueur(s) au total
                    </Text>
                  </VStack>
                </Box>
              )}
              {/* Informations sur les résultats */}
              {podiumData?.pagination && (
                <Text fontSize="sm" color="gray.600">
                  Page {podiumData.pagination.currentPage} sur{" "}
                  {podiumData.pagination.totalPages} - Affichage de{" "}
                  {podiumData.pagination.itemsOnPage} joueur(s)
                </Text>
              )}
              {/* Podium */}
              {isLoading ? (
                <Flex justify="center" align="center" py={8}>
                  <VStack spacing={3}>
                    <Spinner size="lg" />
                    <Text>Chargement du podium...</Text>
                  </VStack>
                </Flex>
              ) : podiumData?.data && podiumData.data.length > 0 ? (
                <>
                  {/* Affichage mobile : toujours en colonne unique */}
                  <Box display={{ base: "block", lg: "none" }}>
                    <VStack spacing={3} align="stretch">
                      {podiumData.data.map((player) =>
                        PlayerCard(player, true, false)
                      )}
                    </VStack>
                  </Box>
                  {/* Affichage desktop */}
                  <Box display={{ base: "none", lg: "block" }}>
                    {podiumData.data.length >= 10 ? (
                      // 2 colonnes pour 10+ joueurs
                      <HStack spacing={4} align="start">
                        <VStack spacing={3} align="stretch" flex={1}>
                          {podiumData.data
                            .slice(0, Math.ceil(podiumData.data.length / 2))
                            .map((player) => PlayerCard(player, false, true))}
                        </VStack>
                        <VStack spacing={3} align="stretch" flex={1}>
                          {podiumData.data
                            .slice(Math.ceil(podiumData.data.length / 2))
                            .map((player) => PlayerCard(player, false, true))}
                        </VStack>
                      </HStack>
                    ) : (
                      // Colonne unique pour moins de 10 joueurs
                      <VStack spacing={3} align="stretch">
                        {podiumData.data.map((player) =>
                          PlayerCard(player, false, true)
                        )}
                      </VStack>
                    )}
                  </Box>
                </>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text>
                    {selectedCycleName
                      ? "Aucun score trouvé pour ce cycle"
                      : "Veuillez sélectionner un cycle"}
                  </Text>
                </Alert>
              )}
              {/* Stats supplémentaires */}
              {podiumData && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  {podiumData.meta.totalPlayers} joueur
                  {podiumData.meta.totalPlayers > 1 ? "s" : ""} au total
                </Text>
              )}
              {/* Pagination */}
              {podiumData?.pagination && (
                <PaginationComponent
                  currentPage={podiumData.pagination.currentPage}
                  totalPages={podiumData.pagination.totalPages}
                  hasPrevPage={podiumData.pagination.hasPrevPage}
                  hasNextPage={podiumData.pagination.hasNextPage}
                  onPageChange={handlePageChange}
                  totalCount={podiumData.pagination.totalCount}
                  itemsOnPage={podiumData.pagination.itemsOnPage}
                />
              )}
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default PodiumPage;
