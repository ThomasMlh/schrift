import {
  Container,
  VStack,
  Text,
  Box,
  HStack,
  Button,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
  useColorMode,
  SimpleGrid,
  Spinner,
  Center,
  Badge,
  Icon,
  Flex,
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
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

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

  const handleSwitchType = (newType: "players" | "guilds") => {
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

  const COMPARISON_TYPES = [
    {
      id: "players" as const,
      icon: FiUsers,
      label: t("pages.comparator.tabPlayers"),
      description: t("pages.comparator.navPlayersDesc"),
      accentColor: isDark ? "blue.300" : "blue.500",
      glowColor: "rgba(49,130,206,0.15)",
      gradient: "linear(90deg, blue.500, blue.300)",
      colorScheme: "blue",
      selectedCount: selectedPlayers.length,
    },
    {
      id: "guilds" as const,
      icon: FiShield,
      label: t("pages.comparator.tabGuilds"),
      description: t("pages.comparator.navGuildsDesc"),
      accentColor: isDark ? "purple.300" : "purple.500",
      glowColor: "rgba(159,122,234,0.15)",
      gradient: "linear(90deg, purple.500, purple.300)",
      colorScheme: "purple",
      selectedCount: selectedGuilds.length,
    },
  ];

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

            {/* Type nav cards */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              {COMPARISON_TYPES.map((type) => {
                const isActive = comparisonType === type.id;
                return (
                  <Box
                    key={type.id}
                    onClick={() => handleSwitchType(type.id)}
                    cursor="pointer"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={isActive
                      ? (isDark ? "whiteAlpha.300" : "gray.300")
                      : (isDark ? "whiteAlpha.100" : "gray.200")
                    }
                    bg={isActive
                      ? (isDark ? "rgba(255,255,255,0.06)" : "white")
                      : (isDark ? "rgba(255,255,255,0.02)" : "gray.50")
                    }
                    boxShadow={isActive ? `0 0 20px ${type.glowColor}, 0 4px 12px rgba(0,0,0,0.15)` : "none"}
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: isDark ? "whiteAlpha.300" : "gray.300",
                      boxShadow: `0 0 16px ${type.glowColor}`,
                      transform: "translateY(-2px)",
                    }}
                    p={4}
                    position="relative"
                    overflow="hidden"
                  >
                    {isActive && (
                      <Box
                        position="absolute" top={0} left={0} right={0} h="2px"
                        bgGradient={type.gradient}
                      />
                    )}
                    <HStack spacing={4} align="center">
                      <Box
                        p={2.5}
                        borderRadius="lg"
                        bg={isActive
                          ? (type.id === "guilds"
                            ? (isDark ? "purple.900" : "purple.50")
                            : (isDark ? "blue.900" : "blue.50"))
                          : (isDark ? "whiteAlpha.100" : "gray.100")
                        }
                        flexShrink={0}
                        display="flex" alignItems="center" justifyContent="center"
                      >
                        <Icon
                          as={type.icon}
                          color={isActive ? type.accentColor : (isDark ? "gray.400" : "gray.500")}
                          boxSize={5}
                        />
                      </Box>
                      <VStack spacing={0.5} align="start" flex={1}>
                        <HStack spacing={2}>
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={isActive ? type.accentColor : (isDark ? "gray.300" : "gray.600")}
                          >
                            {type.label}
                          </Text>
                          {isActive && type.selectedCount > 0 && (
                            <Badge colorScheme={type.colorScheme} variant="subtle" fontSize="2xs" borderRadius="full">
                              {type.selectedCount} sélectionné{type.selectedCount > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color={mutedText} noOfLines={1}>
                          {type.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Config bar */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={4}
            >
              <Flex gap={4} align="flex-end" wrap="wrap">
                <Box flex="1" minW="200px">
                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText} mb={2}>
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
                </Box>
                <HStack spacing={2} flexShrink={0}>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleReset}
                    leftIcon={<Icon as={FiRefreshCw} />}
                    color={mutedText}
                  >
                    {t("pages.comparator.buttonReset")}
                  </Button>
                  <Button
                    colorScheme={comparisonType === "players" ? "blue" : "purple"}
                    size="md"
                    onClick={comparisonType === "players" ? loadPlayersStats : loadGuildsStats}
                    isDisabled={
                      comparisonType === "players"
                        ? selectedPlayers.length < 2
                        : selectedGuilds.length < 2
                    }
                    isLoading={isLoadingStats}
                    leftIcon={<Icon as={FiBarChart2} />}
                  >
                    {t("pages.comparator.buttonCompare")}{" "}
                    {comparisonType === "players" ? selectedPlayers.length : selectedGuilds.length}{" "}
                    {comparisonType === "players"
                      ? (selectedPlayers.length > 1 ? t("pages.comparator.wordPlayers") : t("pages.comparator.wordPlayer"))
                      : (selectedGuilds.length > 1 ? t("pages.comparator.wordGuilds") : t("pages.comparator.wordGuild"))}
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {/* Selector */}
            {comparisonType === "players" ? (
              <MultiPlayerSelector
                selectedPlayers={selectedPlayers}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
                availableUsers={users}
                maxPlayers={5}
                entityColors={entityColors}
              />
            ) : (
              <MultiGuildSelector
                selectedGuilds={selectedGuilds}
                onAddGuild={handleAddGuild}
                onRemoveGuild={handleRemoveGuild}
                availableGuilds={guilds}
                maxGuilds={5}
                entityColors={entityColors}
              />
            )}

            {/* Min 2 alert */}
            {!isLoadingStats && comparisonType === "players" && selectedPlayers.length < 2 && (
              <Alert status="info" borderRadius="xl" fontSize="sm" py={2}>
                <AlertIcon />
                {t("pages.comparator.alertMin2Players")}
              </Alert>
            )}
            {!isLoadingStats && comparisonType === "guilds" && selectedGuilds.length < 2 && (
              <Alert status="info" borderRadius="xl" fontSize="sm" py={2}>
                <AlertIcon />
                {t("pages.comparator.alertMin2Guilds")}
              </Alert>
            )}

            {/* Loading */}
            {isLoadingStats && (
              <Center py={12}>
                <VStack spacing={4}>
                  <Spinner
                    size="xl"
                    color={comparisonType === "players" ? "blue.500" : "purple.500"}
                    thickness="4px"
                  />
                  <Text color={mutedText} fontSize="sm">{t("pages.comparator.loadingStats")}</Text>
                </VStack>
              </Center>
            )}

            {/* Results */}
            {!isLoadingStats && hasPlayersStats && comparisonType === "players" && (
              <VStack spacing={5} align="stretch">
                <PlayerComparisonRadar playersData={playersData} />
                <PlayerComparisonTable playersData={playersData} />
              </VStack>
            )}
            {!isLoadingStats && hasGuildsStats && comparisonType === "guilds" && (
              <VStack spacing={5} align="stretch">
                <GuildComparisonRadar guildsData={guildsData} />
                <GuildComparisonTable guildsData={guildsData} />
              </VStack>
            )}

          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ComparatorPage;
