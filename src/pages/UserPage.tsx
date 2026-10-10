import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Center,
  Skeleton,
} from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
import { SEOHead } from "@/components/SEOHead";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { useCycles, useUser, useUserByBBSName, useUserStats, useGuild, useUserAchievements } from "@/hooks/useAPI";
import { StatCard } from "@/components/ui/StatCard";
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
import { FiBarChart2, FiTrendingUp, FiAward, FiActivity, FiClock, FiHexagon, FiTarget } from "react-icons/fi";
import { UserKillerRecords } from "@/components/user/UserKillerRecords";
import { UserAchievements } from "@/components/achievements/UserAchievements";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { UserAccountSwitcher } from "@/components/user/UserAccountSwitcher";
import { findTopAchievement } from "@/components/achievements/achievementCatalog";

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

  // Onglets : clé d'URL → index. Les anciennes clés (tendance, top-rotations, records)
  // renvoient vers l'onglet qui contient désormais leur section.
  const TAB_NAMES = ["vue-ensemble", "performances", "evolution", "succes"];
  const TAB_MAP: Record<string, number> = {
    "vue-ensemble": 0,
    "tendance": 0,
    "performances": 1,
    "top-rotations": 1,
    "records": 1,
    "evolution": 2,
    "succes": 3,
  };

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
  // Succès le plus rare du compte consulté, affiché à côté du pseudo
  const { accounts: achievementAccounts } = useUserAchievements(userId);
  const topAchievement = findTopAchievement(achievementAccounts, matchedBbsId);
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

  const loading = resolvingUser || userLoading || guildLoading;
  const error = userError
    ? t("pages.user.errorLoadingProfile")
    : null;


  const cardBg = "bg.card";


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

        <UserProfileHeader
          user={user}
          topAchievement={topAchievement}
          accountSwitcher={
            userData?.bbs_accounts && userData.bbs_accounts.length > 1 ? (
              <UserAccountSwitcher accounts={userData.bbs_accounts} activeBbsId={matchedBbsId} />
            ) : undefined
          }
          cycleControl={
            <>
              <Text fontSize="xs" color="text.muted" mb={1}>
                {t("pages.user.cycleFilterLabel")}
              </Text>
              <CycleSelect
                cycles={cycles}
                value={selectedCycle}
                onChange={setSelectedCycle}
                placeholder={t("pages.user.cycleAllPlaceholder")}
                allowDeselect={true}
                valueKey="_id"
                size="md"
              />
            </>
          }
        />

        {/* Détails du bannissement - visible uniquement par les admins */}
        {isAdmin && user.is_banned && <BanDetailsCard user={user} />}

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
              columns={{ base: 2, lg: 4 }}
              spacing={4}
              w="full"
            >
              <StatCard
                icon={FiTarget}
                gradient="linear(to-br, blue.400, purple.500)"
                label={t("pages.user.statTotalScoresLabel")}
                value={stats.totalScores.toLocaleString("fr-FR")}
                tooltip={t("pages.user.statTotalScoresHelp")}
              />
              <StatCard
                icon={FiBarChart2}
                gradient="linear(to-br, orange.400, red.400)"
                label={t("pages.user.statAverageScoreLabel")}
                value={`${(Math.round(stats.averageScore) / 1000000).toFixed(1)}M`}
                tooltip={t("pages.user.statAverageScoreHelp")}
              />
              <StatCard
                icon={FiTrendingUp}
                gradient="linear(to-br, purple.500, pink.400)"
                label={t("pages.user.statTotalPointsLabel")}
                value={`${(stats.totalPoints / 1000000000).toFixed(1)}B`}
                tooltip={t("pages.user.statTotalPointsHelp")}
              />
              <StatCard
                icon={FiAward}
                gradient="linear(to-br, yellow.400, orange.400)"
                label={t("pages.user.statBestScoreLabel")}
                value={stats.bestScore.score.toLocaleString("fr-FR")}
                tooltip={t("pages.user.statBestScoreHelp")}
              />
            </SimpleGrid>

            {/* Onglets */}
            <Tabs
              w="full"
              variant="soft-rounded"
              colorScheme="purple"
              size="sm"
              index={tabIndex}
              onChange={handleTabChange}
              isLazy
            >
              <TabList gap={1} flexWrap="wrap" mb={5}>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiBarChart2} aria-hidden />{t("pages.user.tabOverview")}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiActivity} aria-hidden />{t("pages.user.tabPerformances")}
                </Tab>
                <Tab
                  color="text.secondary"
                  fontWeight="semibold"
                  gap={2}
                  isDisabled={!globalStats?.temporalEvolution || globalStats.temporalEvolution.length < 2}
                >
                  <Icon as={FiClock} aria-hidden />{t("pages.user.tabEvolution")}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiHexagon} aria-hidden />{t("pages.user.tabAchievements")}
                </Tab>
              </TabList>

              <TabPanels>
                {/* Aperçu */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <UserStatsOverview
                      stats={stats}
                      guildName={user?.guild_name}
                      hasGuild={!!user?.guilde_id}
                    />

                    {/* Tendance récente (cycle choisi uniquement) */}
                    {stats.recentTrend && selectedCycle && (
                      <UserRecentTrend recentTrend={stats.recentTrend} />
                    )}

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

                {/* Performances : graphique, top rotations, records par killer */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <UserPerformances stats={stats} />
                    <UserTopRotations stats={stats} />
                    <UserKillerRecords userId={userId} bbsId={matchedBbsId} />
                  </VStack>
                </TabPanel>

                {/* Évolution sur les cycles */}
                <TabPanel p={0}>
                  <UserTemporalEvolution temporalEvolution={globalStats?.temporalEvolution ?? []} />
                </TabPanel>

                {/* Succès du compte */}
                <TabPanel p={0}>
                  <UserAchievements userId={userId} bbsId={matchedBbsId} />
                </TabPanel>
              </TabPanels>
            </Tabs>
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
