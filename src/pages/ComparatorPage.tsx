import {
  Container,
  VStack,
  Text,
  Box,
  Card,
  CardBody,
  HStack,
  Button,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Spinner,
  Center,
  Badge,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { MultiPlayerSelector } from "@/components/comparator/MultiPlayerSelector";
import { PlayerComparisonRadar } from "@/components/comparator/PlayerComparisonRadar";
import { PlayerComparisonTable } from "@/components/comparator/PlayerComparisonTable";
import { MultiGuildSelector } from "@/components/comparator/MultiGuildSelector";
import { GuildComparisonRadar } from "@/components/comparator/GuildComparisonRadar";
import { GuildComparisonTable } from "@/components/comparator/GuildComparisonTable";
import { useUsers, useCycles, useGuilds, fetchUserStats, fetchGuildStats } from "@/hooks/useAPI";
import type { IUser, IGuild } from "@/interfaces";
import type { IUserStats, IGuildStats } from "@/hooks/useAPI";
import { FiRefreshCw, FiBarChart2, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";

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

  // Type de comparaison
  const [comparisonType, setComparisonType] = useState<"players" | "guilds">(
    (searchParams.get("type") as "players" | "guilds") || "players"
  );

  // États pour les joueurs
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [playersStats, setPlayersStats] = useState<Map<string, IUserStats | null>>(new Map());

  // États pour les guildes
  const [selectedGuilds, setSelectedGuilds] = useState<SelectedGuild[]>([]);
  const [guildsStats, setGuildsStats] = useState<Map<string, IGuildStats | null>>(new Map());

  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    searchParams.get("cycle_id") || ""
  );
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Hooks
  const { users = [] } = useUsers({ authenticated: false, limit: 1000 });
  const { guilds = [] } = useGuilds(false);
  const { cycles = [] } = useCycles();

  // Couleurs pour les entités
  const entityColors = [
    "#3182CE", // blue.500
    "#38A169", // green.500
    "#DD6B20", // orange.500
    "#9F7AEA", // purple.500
    "#E53E3E"  // red.500
  ];

  // UI Colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Charger depuis l'URL au montage
  useEffect(() => {
    if (comparisonType === "players") {
      const playerIds = searchParams.get("players")?.split(",") || [];
      const validPlayers: SelectedPlayer[] = [];
      playerIds.forEach((id) => {
        const user = users.find((u) => u._id === id);
        if (user) validPlayers.push({ id, user });
      });
      if (validPlayers.length > 0) setSelectedPlayers(validPlayers);
    } else {
      const guildIds = searchParams.get("guilds")?.split(",") || [];
      const validGuilds: SelectedGuild[] = [];
      guildIds.forEach((id) => {
        const guild = guilds.find((g) => g._id === id);
        if (guild) validGuilds.push({ id, guild });
      });
      if (validGuilds.length > 0) setSelectedGuilds(validGuilds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, guilds, comparisonType]);

  // Mettre à jour l'URL
  const updateURLParams = () => {
    const params = new URLSearchParams();
    params.set("type", comparisonType);

    if (comparisonType === "players" && selectedPlayers.length > 0) {
      params.set("players", selectedPlayers.map((p) => p.id).join(","));
    } else if (comparisonType === "guilds" && selectedGuilds.length > 0) {
      params.set("guilds", selectedGuilds.map((g) => g.id).join(","));
    }

    if (selectedCycleId) {
      params.set("cycle_id", selectedCycleId);
    }

    setSearchParams(params);
  };

  useEffect(() => {
    updateURLParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonType, selectedPlayers, selectedGuilds, selectedCycleId]);

  // Charger les stats des joueurs
  const loadPlayersStats = async () => {
    if (selectedPlayers.length < 2) {
      toast({
        title: t("pages.comparator.toastInsufficientTitle"),
        description: t("pages.comparator.toastMin2Players"),
        status: "warning",
        duration: 3000
      });
      return;
    }

    setIsLoadingStats(true);
    const newStatsMap = new Map<string, IUserStats | null>();

    try {
      await Promise.all(
        selectedPlayers.map(async (player) => {
          const stats = await fetchUserStats(player.id, selectedCycleId);
          newStatsMap.set(player.id, stats);
        })
      );

      setPlayersStats(newStatsMap);

      toast({
        title: t("pages.comparator.toastComparisonLoadedTitle"),
        description: `Stats de ${selectedPlayers.length} joueurs chargées avec succès`,
        status: "success",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("pages.comparator.toastErrorLoadingStats"),
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Charger les stats des guildes
  const loadGuildsStats = async () => {
    if (selectedGuilds.length < 2) {
      toast({
        title: t("pages.comparator.toastInsufficientTitle"),
        description: t("pages.comparator.toastMin2Guilds"),
        status: "warning",
        duration: 3000
      });
      return;
    }

    setIsLoadingStats(true);
    const newStatsMap = new Map<string, IGuildStats | null>();

    try {
      await Promise.all(
        selectedGuilds.map(async (guild) => {
          const stats = await fetchGuildStats(guild.id, selectedCycleId);
          newStatsMap.set(guild.id, stats);
        })
      );

      setGuildsStats(newStatsMap);

      toast({
        title: t("pages.comparator.toastComparisonLoadedTitle"),
        description: `Stats de ${selectedGuilds.length} guildes chargées avec succès`,
        status: "success",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("pages.comparator.toastErrorLoadingStats"),
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Handlers pour joueurs
  const handleAddPlayer = (userId: string, user: IUser) => {
    setSelectedPlayers([...selectedPlayers, { id: userId, user }]);
  };

  const handleRemovePlayer = (id: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== id));
    const newStats = new Map(playersStats);
    newStats.delete(id);
    setPlayersStats(newStats);
  };

  // Handlers pour guildes
  const handleAddGuild = (guildId: string, guild: IGuild) => {
    setSelectedGuilds([...selectedGuilds, { id: guildId, guild }]);
  };

  const handleRemoveGuild = (id: string) => {
    setSelectedGuilds(selectedGuilds.filter((g) => g.id !== id));
    const newStats = new Map(guildsStats);
    newStats.delete(id);
    setGuildsStats(newStats);
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

  const handleTabChange = (index: number) => {
    const newType = index === 0 ? "players" : "guilds";
    setComparisonType(newType);
    setSearchParams(new URLSearchParams({ type: newType }));
  };

  // Préparer les données pour les graphiques
  const playersData = selectedPlayers.map((player, index) => ({
    name: player.user.bbs_name || player.user.global_name || "Joueur",
    stats: playersStats.get(player.id) || null,
    color: entityColors[index % entityColors.length]
  }));

  const guildsData = selectedGuilds.map((guild, index) => ({
    name: guild.guild.name,
    stats: guildsStats.get(guild.id) || null,
    color: entityColors[index % entityColors.length]
  }));

  const hasPlayersStats = playersStats.size > 0 && Array.from(playersStats.values()).some(s => s !== null);
  const hasGuildsStats = guildsStats.size > 0 && Array.from(guildsStats.values()).some(s => s !== null);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Comparateur - Bleach Brave Souls | Schrift BBS",
    description: "Comparez les performances entre joueurs ou guildes dans Bleach Brave Souls.",
    url: "https://bbs-schrift.fr/comparateur"
  };

  return (
    <Box mb={"150px"}>
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

        <Container maxW="container.xl" py={8} >
          <VStack spacing={6} align="stretch">
            {/* Configuration générale */}
            <Card
              bg={bgColor}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Box
                bgGradient="linear(to-r, blue.500, purple.500)"
                p={4}
                color="white"
                borderTopRadius="xl"
              >
                <HStack spacing={2}>
                  <Icon as={FiBarChart2} boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold">
                    {t("pages.comparator.configHeading")}
                  </Text>
                </HStack>
              </Box>

              <CardBody>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {/* Sélecteur de cycle */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      {t("pages.comparator.cycleFilterLabel")}
                    </Text>
                    <CycleSelect
                      cycles={cycles}
                      value={selectedCycleId}
                      onChange={handleCycleChange}
                      placeholder={t("pages.comparator.cycleAllPlaceholder")}
                      allowDeselect={true}
                      size="md"
                    />
                    {selectedCycleId && (
                      <Badge mt={2} colorScheme="blue">
                        {t("pages.comparator.badgeCycleSelected")}
                      </Badge>
                    )}
                  </Box>

                  {/* Actions */}
                  <VStack align="stretch" justify="flex-end" spacing={3}>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      onClick={comparisonType === "players" ? loadPlayersStats : loadGuildsStats}
                      isDisabled={
                        comparisonType === "players" 
                          ? selectedPlayers.length < 2 
                          : selectedGuilds.length < 2
                      }
                      isLoading={isLoadingStats}
                      leftIcon={<Icon as={FiBarChart2} />}
                    >
                      Comparer {comparisonType === "players" ? selectedPlayers.length : selectedGuilds.length}{" "}
                      {comparisonType === "players" ? "joueur" : "guilde"}
                      {((comparisonType === "players" && selectedPlayers.length > 1) || 
                        (comparisonType === "guilds" && selectedGuilds.length > 1)) && "s"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      leftIcon={<Icon as={FiRefreshCw} />}
                    >
                      {t("pages.comparator.buttonReset")}
                    </Button>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Tabs pour joueurs vs guildes */}
            <Card bg={bgColor} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <Tabs
                  index={comparisonType === "players" ? 0 : 1}
                  onChange={handleTabChange}
                  colorScheme="blue"
                  variant="enclosed"
                >
                  <TabList>
                    <Tab fontSize="md" fontWeight="semibold">
                      <Icon as={FiUsers} mr={2} />
                      {t("pages.comparator.tabPlayers")}
                    </Tab>
                    <Tab fontSize="md" fontWeight="semibold">
                      <Icon as={FiUsers} mr={2} />
                      {t("pages.comparator.tabGuilds")}
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Tab Joueurs */}
                    <TabPanel p={0} pt={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Sélecteur de joueurs */}
                        <MultiPlayerSelector
                          selectedPlayers={selectedPlayers}
                          onAddPlayer={handleAddPlayer}
                          onRemovePlayer={handleRemovePlayer}
                          availableUsers={users}
                          maxPlayers={5}
                        />

                        {selectedPlayers.length < 2 && (
                          <Alert status="info" borderRadius="xl">
                            <AlertIcon />
                            {t("pages.comparator.alertMin2Players")}
                          </Alert>
                        )}

                        {isLoadingStats && (
                          <Center py={20}>
                            <VStack spacing={4}>
                              <Spinner size="xl" color="blue.500" thickness="4px" />
                              <Text>{t("pages.comparator.loadingStats")}</Text>
                            </VStack>
                          </Center>
                        )}

                        {!isLoadingStats && hasPlayersStats && (
                          <VStack spacing={6} align="stretch">
                            <PlayerComparisonRadar playersData={playersData} />
                            <PlayerComparisonTable playersData={playersData} />

                            <Alert status="success" borderRadius="xl" variant="subtle">
                              <AlertIcon />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{t("pages.comparator.comparisonSuccessTitle")}</Text>
                                <Text fontSize="sm">
                                  {selectedPlayers.length} joueur{selectedPlayers.length > 1 ? "s" : ""} comparé
                                  {selectedPlayers.length > 1 ? "s" : ""}{" "}
                                  {selectedCycleId ? t("pages.comparator.comparisonOnSelectedCycle") : t("pages.comparator.comparisonOnAllCycles")}
                                </Text>
                              </VStack>
                            </Alert>
                          </VStack>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Tab Guildes */}
                    <TabPanel p={0} pt={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Sélecteur de guildes */}
                        <MultiGuildSelector
                          selectedGuilds={selectedGuilds}
                          onAddGuild={handleAddGuild}
                          onRemoveGuild={handleRemoveGuild}
                          availableGuilds={guilds}
                          maxGuilds={5}
                        />

                        {selectedGuilds.length < 2 && (
                          <Alert status="info" borderRadius="xl">
                            <AlertIcon />
                            {t("pages.comparator.alertMin2Guilds")}
                          </Alert>
                        )}

                        {isLoadingStats && (
                          <Center py={20}>
                            <VStack spacing={4}>
                              <Spinner size="xl" color="purple.500" thickness="4px" />
                              <Text>{t("pages.comparator.loadingStats")}</Text>
                            </VStack>
                          </Center>
                        )}

                        {!isLoadingStats && hasGuildsStats && (
                          <VStack spacing={6} align="stretch">
                            <GuildComparisonRadar guildsData={guildsData} />
                            <GuildComparisonTable guildsData={guildsData} />

                            <Alert status="success" borderRadius="xl" variant="subtle">
                              <AlertIcon />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{t("pages.comparator.comparisonSuccessTitle")}</Text>
                                <Text fontSize="sm">
                                  {selectedGuilds.length} guilde{selectedGuilds.length > 1 ? "s" : ""} comparée
                                  {selectedGuilds.length > 1 ? "s" : ""}{" "}
                                  {selectedCycleId ? t("pages.comparator.comparisonOnSelectedCycle") : t("pages.comparator.comparisonOnAllCycles")}
                                </Text>
                              </VStack>
                            </Alert>
                          </VStack>
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ComparatorPage;
