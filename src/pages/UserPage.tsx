import { useParams, useSearchParams, Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  VStack,
  HStack,
  Text,
  Badge,
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
  Flex,
  Center,
  Skeleton,
  Button,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
import { formatRoleName } from "@/utils/user";
import { SEOHead } from "@/components/SEOHead";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { useCycles, useUser, useUserByBBSName, useUserStats, useGuild } from "@/hooks/useAPI";
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
import { UserTypeAnalysis } from "@/components/user/UserTypeAnalysis";
import { UserWeeklySection } from "@/components/user/UserWeeklySection";
import { FiBarChart2, FiTrendingUp, FiAward, FiActivity, FiClock, FiStar } from "react-icons/fi";
import { UserKillerRecords } from "@/components/user/UserKillerRecords";
import { getDiscordBannerUrl } from "@/utils/discord";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";

const UserPage = () => {
  const { bbs_name } = useParams<{ bbs_name: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // Désambiguïsation quand plusieurs comptes partagent le même bbs_name (ex: alts d'un même joueur) :
  // ?compte=<bbs_id> cible le compte exact, prioritaire sur la résolution par nom.
  const accountIdParam = searchParams.get("compte") || undefined;
  const { user: resolvedUser, matchedBbsId, isLoading: resolvingUser } = useUserByBBSName(bbs_name, accountIdParam);
  const userId = resolvedUser?._id;
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const { isAdmin, currentUser } = useAuth();
  const { t } = useTranslation();

  // Mapping des onglets
  const TAB_MAP: Record<string, number> = {
    "vue-ensemble": 0,
    "tendance": 1,
    "performances": 2,
    "top-rotations": 3,
    "evolution": 4,
    "records": 5
  };
  const TAB_NAMES = ["vue-ensemble", "tendance", "performances", "top-rotations", "evolution", "records"];

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
  // Le compte affiché n'est pas forcément le principal : si l'URL pointe vers le bbs_name d'un
  // alt, on veut montrer SA guilde/rôle/pseudo, pas ceux du miroir racine (compte principal).
  const viewedAccount = userData?.bbs_accounts?.find(a => a.bbs_id === matchedBbsId);
  const viewedGuildeId = viewedAccount?.guilde_id ?? userData?.guilde_id;
  const { guildName, isLoading: guildLoading } = useGuild(viewedGuildeId);
  const { cycles } = useCycles({ limit: 100, page: 1 });
  const { stats, isLoading: statsLoading } = useUserStats(
    userId,
    selectedCycle,
    matchedBbsId
  );
  // Stats sans filtre de cycle — uniquement pour l'évolution temporelle globale
  const { stats: globalStats } = useUserStats(userId, undefined, matchedBbsId);

  // Résolution du slug cycle depuis l'URL → _id (prioritaire sur le défaut)
  useEffect(() => {
    if (!cycles.length) return;
    const slug = searchParams.get("cycle_name");
    if (!slug || selectedCycle) return;
    const resolved = cycleFromSlug(cycles, slug)?._id ?? slug;
    setSelectedCycle(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles]);

  // Sélectionner le cycle le plus récent par défaut si rien dans l'URL
  useEffect(() => {
    if (cycles.length > 0 && !selectedCycle && !searchParams.get("cycle_name")) {
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
  }, [cycles, selectedCycle, searchParams]);

  // Sync cycle sélectionné dans l'URL (par slug)
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    const cycleObj = cycles.find(c => c._id === selectedCycle);
    if (cycleObj) {
      newParams.set("cycle_name", cycleSlug(cycleObj.name, cycleObj.year));
    } else if (selectedCycle) {
      newParams.set("cycle_name", selectedCycle);
    } else {
      newParams.delete("cycle_name");
    }
    setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycle]);

  // Enrichir l'utilisateur avec l'avatar et le nom de guilde, en affichant les infos du compte
  // consulté (bbs_name/guilde/rôle) plutôt que celles du compte principal si c'est un alt.
  const user = userData
    ? {
        ...userData,
        bbs_id: viewedAccount?.bbs_id ?? userData.bbs_id,
        bbs_name: viewedAccount?.bbs_name ?? userData.bbs_name,
        guilde_id: viewedGuildeId,
        role: viewedAccount?.role ?? userData.role,
        guild_name: guildName,
      }
    : null;

  const bannerUrl = user?.discord_id && user?.banner ? getDiscordBannerUrl(user.discord_id, user.banner) : null;
  const loading = resolvingUser || userLoading || guildLoading;
  const error = userError
    ? t("pages.user.errorLoadingProfile")
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
  const mutedText = useColorModeValue("gray.500", "gray.400");

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
    return <PageLoader label={t("pages.user.loadingProfile")} />;
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
          {t("pages.user.userNotFound")}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={t("pages.user.seoTitle", { name: user.bbs_name || user.global_name })}
        description={user.guild_name
          ? t("pages.user.seoDescriptionWithGuild", { name: user.bbs_name || user.global_name, guild: user.guild_name })
          : t("pages.user.seoDescriptionNoGuild", { name: user.bbs_name || user.global_name })}
        url={`https://bbs-schrift.fr/joueur/${bbs_name}`}
        noIndex={true}
      />
      <Container maxW="container.xl" py={8}>
        <Breadcrumbs items={[
          { label: t("nav.home"), to: "/" },
          { label: t("nav.players"), to: "/joueurs" },
          { label: user.bbs_name || user.global_name },
        ]} />

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
                    {t("pages.user.noGuild")}
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
                    {t("pages.user.badgeBanned")}
                  </Badge>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Sélecteur de compte bbs — un même joueur peut avoir plusieurs comptes (alts), chacun
            avec ses propres stats/classement indépendants. bbs_name n'étant pas garanti unique
            (deux comptes peuvent avoir le même pseudo), chaque lien porte ?compte=<bbs_id> pour
            cibler le compte exact sans ambiguïté ; la surbrillance se base aussi sur le bbs_id résolu. */}
        {userData?.bbs_accounts && userData.bbs_accounts.length > 1 && (() => {
          const nameCounts = new Map<string, number>();
          userData.bbs_accounts.forEach((a) => {
            const key = a.bbs_name || a.bbs_id;
            nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
          });

          return (
            <Card mb={6} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <CardBody py={4}>
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold" color={mutedText}>
                    {t("pages.user.accountsLabel")}
                  </Text>
                  <Wrap spacing={2}>
                    {userData.bbs_accounts.map((account) => {
                      const isActive = account.bbs_id === matchedBbsId;
                      const nameKey = account.bbs_name || account.bbs_id;
                      const isDuplicateName = (nameCounts.get(nameKey) || 0) > 1;

                      const linkParams = new URLSearchParams(searchParams);
                      linkParams.set("compte", account.bbs_id);
                      const to = `/joueur/${encodeURIComponent(nameKey)}?${linkParams.toString()}`;

                      return (
                        <WrapItem key={account.bbs_id}>
                          <Button
                            as={RouterLink}
                            to={to}
                            size="sm"
                            borderRadius="full"
                            colorScheme={isActive ? "blue" : "gray"}
                            variant={isActive ? "solid" : "outline"}
                            _hover={{ textDecoration: "none", color: "white" }}
                          >
                            {account.bbs_name || account.bbs_id}
                            {isDuplicateName && (
                              <Text as="span" fontSize="2xs" opacity={0.7} ml={1}>
                                ({account.bbs_id})
                              </Text>
                            )}
                            {account.is_primary && !isActive && (
                              <Badge ml={2} colorScheme={"purple"} fontSize="2xs">
                                {t("pages.user.accountPrimary")}
                              </Badge>
                            )}
                          </Button>
                        </WrapItem>
                      );
                    })}
                  </Wrap>
                </VStack>
              </CardBody>
            </Card>
          );
        })()}

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
                  {t("pages.user.cycleFilterLabel")}
                </Text>
              </HStack>
              <Box maxW={{ base: "full", md: "300px" }}>
                <CycleSelect
                  cycles={cycles}
                  value={selectedCycle}
                  onChange={setSelectedCycle}
                  placeholder={t("pages.user.cycleAllPlaceholder")}
                  allowDeselect={true}
                  valueKey="_id"
                  size="md"
                />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {statsLoading ? (
          <VStack spacing={6}>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} w="full">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} h="100px" borderRadius="xl" />
              ))}
            </SimpleGrid>
            <Skeleton h="200px" w="full" borderRadius="xl" />
          </VStack>
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
                label={t("pages.user.statTotalScoresLabel")}
                value={stats.totalScores}
                helpText={t("pages.user.statTotalScoresHelp")}
                borderColor="blue.500"
                valueColor="blue.500"
              />
              <StatCard
                icon="📈"
                label={t("pages.user.statAverageScoreLabel")}
                value={`${(Math.round(stats.averageScore) / 1000000).toFixed(1)}M`}
                helpText={t("pages.user.statAverageScoreHelp")}
                borderColor="purple.500"
                valueColor="purple.500"
              />
              <StatCard
                icon="💰"
                label={t("pages.user.statTotalPointsLabel")}
                value={`${(stats.totalPoints / 1000000000).toFixed(1)}B`}
                helpText={t("pages.user.statTotalPointsHelp")}
                borderColor="green.500"
                valueColor="green.500"
              />
              <StatCard
                icon="🏆"
                label={t("pages.user.statBestScoreLabel")}
                value={stats.bestScore.score.toLocaleString()}
                helpText={t("pages.user.statBestScoreHelp")}
                borderColor="orange.500"
                valueColor="orange.500"
              />
            </SimpleGrid>

            {/* Semaine en cours */}
            {selectedCycle && (() => {
              const cycleObj = cycles.find((c) => c._id === selectedCycle);
              return cycleObj ? (
                <UserWeeklySection
                  cycle={cycleObj}
                  cycleId={selectedCycle}
                  allRotations={stats.allRotations}
                />
              ) : null;
            })()}

            {/* Onglets pour les différentes visualisations */}
            <Card w="full" bg={tabBg} borderRadius="xl" boxShadow="lg">
              <CardBody>
                <Tabs colorScheme="blue" variant="enclosed" index={tabIndex} onChange={handleTabChange}>
                  <TabList mb={6} flexWrap="wrap" justifyContent={{ base: "center", md: "flex-start" }} flexDirection={{ base: "column", md: "row" }} gap={2} borderBottom="none">
                    <Tab {...tabStyles}>
                      <Icon as={FiBarChart2} mr={2} />
                      {t("pages.user.tabOverview")}
                    </Tab>
                    <Tab {...tabStyles} isDisabled={!selectedCycle || !stats.recentTrend}>
                      <Icon as={FiTrendingUp} mr={2} />
                      {t("pages.user.tabTrend")}
                    </Tab>
                    <Tab {...tabStyles}>
                      <Icon as={FiActivity} mr={2} />
                      {t("pages.user.tabPerformances")}
                    </Tab>
                    <Tab {...tabStyles}>
                      <Icon as={FiAward} mr={2} />
                      {t("pages.user.tabTopRotations")}
                    </Tab>
                    <Tab {...tabStyles} isDisabled={!globalStats?.temporalEvolution || globalStats.temporalEvolution.length < 2}>
                      <Icon as={FiClock} mr={2} />
                      {t("pages.user.tabEvolution")}
                    </Tab>
                    <Tab {...tabStyles}>
                      <Icon as={FiStar} mr={2} />
                      {t("pages.user.tabRecords")}
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

                        {/* Contribution à la guilde */}
                        {globalStats?.guildContribution && globalStats.guildContribution.byCycle.length > 0 && (
                          <UserGuildContribution
                            historicalContribution={globalStats.guildContribution}
                            cycleContribution={selectedCycle ? (stats?.guildContribution ?? null) : undefined}
                            cycleContributionLoading={!!selectedCycle && statsLoading}
                            hasSelectedCycle={!!selectedCycle}
                            selectedCycleId={selectedCycle}
                            selectedCycleName={cycles.find((c) => c._id === selectedCycle)?.name}
                            guildName={user?.guild_name}
                            temporalEvolution={globalStats.temporalEvolution}
                          />
                        )}

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

                        {/* Performance par période du cycle */}
                        {globalStats?.performanceByQuartile && globalStats.performanceByQuartile.length >= 2 && (
                          <UserPositionPerformance
                            performanceByQuartile={globalStats.performanceByQuartile}
                          />
                        )}

                        {/* Performance par type d'attaque / altération */}
                        {(stats.performanceByAttack || stats.performanceByAlteration) && (
                          <UserTypeAnalysis stats={stats} />
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
                            {t("pages.user.trendSelectCycleHint")}
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

                    {/* Records personnels par killer */}
                    <TabPanel p={0}>
                      <UserKillerRecords userId={userId} bbsId={matchedBbsId} />
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
                  {t("pages.user.noStatsTitle")}
                </Text>
                <Text fontSize="md" color="gray.500">
                  {t("pages.user.noStatsDescription")}
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
