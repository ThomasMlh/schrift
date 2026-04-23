import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  SimpleGrid,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorModeValue,
  Flex
} from "@chakra-ui/react";
import { formatRoleName } from "@/utils/user";
import { SEOHead } from "@/components/SEOHead";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { useCycles, useUser, useUserStats, useGuild } from "@/hooks/useAPI";
import { StatCard } from "@/components/user/StatCard";
import { UserStatsOverview } from "@/components/user/UserStatsOverview";
import { UserPerformances } from "@/components/user/UserPerformances";
import { UserTopRotations } from "@/components/user/UserTopRotations";
import { UserTemporalEvolution } from "@/components/user/UserTemporalEvolution";
import { UserRecentTrend } from "@/components/user/UserRecentTrend";
import { UserRivals } from "@/components/user/UserRivals";
import { UserGuildContribution } from "@/components/user/UserGuildContribution";
import { UserPositionPerformance } from "@/components/user/UserPositionPerformance";
import { BanDetailsCard } from "@/components/user/BanDetailsCard";
import { FiBarChart2, FiTrendingUp, FiAward, FiActivity, FiClock } from "react-icons/fi";
import { getDiscordBannerUrl } from "@/utils/discord";
import { useAuth } from "@/providers/AuthProvider";

const UserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const { isAdmin, currentUser } = useAuth();

  // Mapping des onglets
  const TAB_MAP: Record<string, number> = {
    "vue-ensemble": 0,
    "tendance": 1,
    "performances": 2,
    "top-rotations": 3,
    "evolution": 4
  };
  const TAB_NAMES = ["vue-ensemble", "tendance", "performances", "top-rotations", "evolution"];

  // Déterminer l'onglet actif depuis l'URL
  const tabParam = searchParams.get("tab");
  const tabIndex = tabParam && TAB_MAP[tabParam] !== undefined ? TAB_MAP[tabParam] : 0;

  // Handler pour changer d'onglet
  const handleTabChange = (index: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (index === 0) {
      // Retirer le paramètre tab pour l'onglet par défaut
      newParams.delete("tab");
    } else {
      newParams.set("tab", TAB_NAMES[index]);
    }
    setSearchParams(newParams);
  };

  // Utilisation des hooks
  const {
    user: userData,
    isLoading: userLoading,
    error: userError
  } = useUser(userId);
  const { guildName, isLoading: guildLoading } = useGuild(userData?.guilde_id);
  const { cycles } = useCycles({ limit: 100, page: 1 });
  const { stats, isLoading: statsLoading } = useUserStats(
    userId,
    selectedCycle
  );
  // Stats sans filtre de cycle — uniquement pour l'évolution temporelle globale
  const { stats: globalStats } = useUserStats(userId);

  // Sélectionner le cycle le plus récent par défaut
  useEffect(() => {
    if (cycles.length > 0 && !selectedCycle) {
      const sorted = [...cycles].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
      if (sorted[0]?._id) {
        setSelectedCycle(sorted[0]._id);
      }
    }
  }, [cycles]);

  // Enrichir l'utilisateur avec l'avatar et le nom de guilde
  const user = userData
    ? {
        ...userData,
        guild_name: guildName,
      }
    : null;

  const bannerUrl = user?.discord_id && user?.banner ? getDiscordBannerUrl(user.discord_id, user.banner) : null;
  const loading = userLoading || guildLoading;
  const error = userError
    ? "Erreur lors du chargement du profil utilisateur"
    : null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "chef":
        return "purple";
      case "sous-chef":
        return "blue";
      case "membre":
        return "green";
      default:
        return "gray";
    }
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const gradientBg = useColorModeValue(
    "linear(to-br, blue.50, purple.50)",
    "linear(to-br, gray.800, purple.900)"
  );
  const tabBg = useColorModeValue("white", "gray.800");

  // Styles communs pour les onglets
  const tabStyles = {
    fontWeight: "semibold",
    fontSize: "md",
    px: 6,
    py: 3,
    borderRadius: "lg",
    border: "2px solid",
    borderColor: "gray.300",
    bg: "gray.100",
    color: "gray.700",
    _dark: {
      borderColor: "gray.500",
      bg: "gray.700",
      color: "gray.200"
    },
    _selected: {
      bg: "blue.600",
      color: "white",
      borderColor: "blue.600",
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)",
      _dark: {
        bg: "blue.600",
        color: "white",
        borderColor: "blue.600"
      }
    },
    _hover: {
      borderColor: "blue.400",
      bg: "blue.50",
      color: "blue.700",
      transform: "translateY(-2px)",
      _dark: {
        bg: "gray.600",
        color: "white"
      }
    },
    transition: "all 0.2s"
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement du profil...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Utilisateur introuvable
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={`${user.bbs_name || user.global_name} - Profil Joueur`}
        description={`Profil de ${user.bbs_name || user.global_name}${user.guild_name ? ` - Guilde ${user.guild_name}` : ""}`}
        url={`https://bbs-schrift.fr/joueur/${userId}`}
        noIndex={true}
      />
      <Container maxW="container.xl" py={8}>
        {/* Header avec profil utilisateur */}
        <Card
          bgGradient={gradientBg}
          {...(bannerUrl && {
            backgroundImage: `url('${bannerUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          })}
          borderRadius="2xl"
          boxShadow="2xl"
          mb={6}
          overflow="hidden"
          position="relative"
        >
          {/* Overlay sombre pour la lisibilité (uniquement si bannière) */}
          {bannerUrl && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.600"
              zIndex={0}
            />
          )}
          {!bannerUrl && (
            <Box
              position="absolute"
              top={0}
              right={0}
              width="300px"
              height="300px"
              opacity={0.1}
            />
          )}
          <CardBody py={8}>
            <VStack 
              spacing={4} 
              align="center" 
              position="relative" 
              zIndex={1}
              {...(bannerUrl && {
                sx: {
                  "& *": {
                    color: "white !important"
                  }
                }
              })}
            >
              <UserDisplay
                user={user}
                avatarSize="2xl"
                direction="column"
                textSize="2xl"
                spacing={4}
                asLink={false}
              />

              <VStack spacing={2} textAlign="center">
                {user.guilde_id ? (
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={getRoleBadgeColor(user.role || "membre")}
                      variant="solid"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                      textTransform="uppercase"
                    >
                      {formatRoleName(user.role)} {user.guild_name}
                    </Badge>
                  </HStack>
                ) : (
                  <Text fontSize="md" color={bannerUrl ? "whiteAlpha.800" : "gray.500"}>
                    Aucune guilde
                  </Text>
                )}
                {user.is_banned && (
                  <Badge
                    colorScheme="red"
                    variant="solid"
                    px={4}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    textTransform="uppercase"
                  >
                    🚫 Banni
                  </Badge>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Détails du bannissement - visible uniquement par les admins */}
        {isAdmin && user.is_banned && <BanDetailsCard user={user} />}

        {/* Filtre de cycle */}
        <Card mb={6} bg={cardBg} borderRadius="xl" boxShadow="lg">
          <CardBody>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              align={{ base: "stretch", md: "center" }}
            >
              <HStack spacing={3} flex="1">
                <Icon as={FiBarChart2} boxSize={5} color="blue.500" />
                <Text fontWeight="semibold" fontSize="lg">
                  Filtrer par cycle:
                </Text>
              </HStack>
              <Box maxW={{ base: "full", md: "300px" }}>
                <CycleSelect
                  cycles={cycles}
                  value={selectedCycle}
                  onChange={setSelectedCycle}
                  placeholder="Tous les cycles"
                  allowDeselect={true}
                  valueKey="_id"
                  size="md"
                />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {statsLoading ? (
          <Center mt={5}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text>Chargement des statistiques...</Text>
            </VStack>
          </Center>
        ) : stats && stats.totalScores > 0 ? (
          <VStack spacing={6}>
            {/* Statistiques principales */}
            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 4 }}
              spacing={6}
              w="full"
            >
              <StatCard
                icon="🎯"
                label="Total Scores"
                value={stats.totalScores}
                helpText="Participations"
                borderColor="blue.500"
                valueColor="blue.500"
              />
              <StatCard
                icon="📈"
                label="Score Moyen"
                value={`${(Math.round(stats.averageScore) / 1000000).toFixed(1)}M`}
                helpText="Par rotation"
                borderColor="purple.500"
                valueColor="purple.500"
              />
              <StatCard
                icon="💰"
                label="Points Totaux"
                value={`${(stats.totalPoints / 1000000000).toFixed(1)}B`}
                helpText="Cumulés"
                borderColor="green.500"
                valueColor="green.500"
              />
              <StatCard
                icon="🏆"
                label="Meilleur Score"
                value={stats.bestScore.score.toLocaleString()}
                helpText="Record personnel"
                borderColor="orange.500"
                valueColor="orange.500"
              />
            </SimpleGrid>

            {/* Onglets pour les différentes visualisations */}
            <Card w="full" bg={tabBg} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <Tabs colorScheme="blue" variant="enclosed" index={tabIndex} onChange={handleTabChange}>
                  <TabList mb={6} flexWrap="wrap" justifyContent={{ base: "center", md: "flex-start" }} flexDirection={{ base: "column", md: "row" }} gap={2} borderBottom="none">
                    <Tab {...tabStyles}>
                      <Icon as={FiBarChart2} mr={2} />
                      Vue d'ensemble
                    </Tab>
                    <Tab {...tabStyles} isDisabled={!selectedCycle || !stats.recentTrend}>
                      <Icon as={FiTrendingUp} mr={2} />
                      Tendance
                    </Tab>
                    <Tab {...tabStyles}>
                      <Icon as={FiActivity} mr={2} />
                      Performances
                    </Tab>
                    <Tab {...tabStyles}>
                      <Icon as={FiAward} mr={2} />
                      Top Rotations
                    </Tab>
                    <Tab {...tabStyles} isDisabled={!globalStats?.temporalEvolution || globalStats.temporalEvolution.length < 2}>
                      <Icon as={FiClock} mr={2} />
                      Évolution
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Vue d'ensemble */}
                    <TabPanel p={0}>
                      <VStack spacing={6} align="stretch">
                        <UserStatsOverview
                          stats={stats}
                          guildName={user?.guild_name}
                          hasGuild={!!user?.guilde_id}
                        />

                        {/* Rivaux */}
                        {stats.rivals && stats.rivals.length > 0 && user && (
                          <UserRivals 
                            rivals={stats.rivals} 
                            currentUser={user}
                            currentUserRank={stats.ranking?.global || null}
                            currentUserAverage={stats.averageScore}
                            loggedInUserId={currentUser?._id}
                          />
                        )}

                        {/* Contribution à la guilde */}
                        {globalStats?.guildContribution && globalStats.guildContribution.byCycle.length > 0 && (
                          <UserGuildContribution
                            guildContribution={globalStats.guildContribution}
                            guildName={user?.guild_name}
                            temporalEvolution={globalStats.temporalEvolution}
                          />
                        )}

                        {/* Performance par période du cycle */}
                        {globalStats?.performanceByQuartile && globalStats.performanceByQuartile.length >= 2 && (
                          <UserPositionPerformance
                            performanceByQuartile={globalStats.performanceByQuartile}
                          />
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Tendance récente */}
                    <TabPanel p={0}>
                      {stats.recentTrend && selectedCycle ? (
                        <UserRecentTrend recentTrend={stats.recentTrend} />
                      ) : (
                        <Box textAlign="center" py={10}>
                          <Text fontSize="lg" color="gray.500">
                            📊 Sélectionnez un cycle pour voir votre tendance récente
                          </Text>
                        </Box>
                      )}
                    </TabPanel>

                    {/* Graphique de performances */}
                    <TabPanel p={0}>
                      <UserPerformances stats={stats} />
                    </TabPanel>

                    {/* Top Rotations détaillées */}
                    <TabPanel p={0}>
                      <UserTopRotations stats={stats} />
                    </TabPanel>

                    {/* Évolution temporelle */}
                    <TabPanel p={0}>
                      <UserTemporalEvolution temporalEvolution={globalStats?.temporalEvolution ?? []} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        ) : (
          <Center mt={8}>
            <Card bg={cardBg} borderRadius="xl" boxShadow="lg" maxW="md">
              <CardBody textAlign="center" py={10}>
                <Icon as={FiBarChart2} boxSize={16} color="gray.400" mb={4} />
                <Text
                  fontSize="xl"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={2}
                >
                  Aucune statistique disponible
                </Text>
                <Text fontSize="md" color="gray.500">
                  Ce joueur n'a pas encore de scores enregistrés
                </Text>
              </CardBody>
            </Card>
          </Center>
        )}
      </Container>
    </>
  );
};

export default UserPage;
