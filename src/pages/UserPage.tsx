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
import { useCycles, useUser, useUserByBBSName, useUserStats, useGuild, useUserAchievements, useAlbumSettings } from "@/hooks/useAPI";
import { UserStatsStrip } from "@/components/user/UserStatsStrip";
import { UserStatsOverview } from "@/components/user/UserStatsOverview";
import { UserPerformances } from "@/components/user/UserPerformances";
import { UserTemporalEvolution } from "@/components/user/UserTemporalEvolution";
import { UserRecentTrend } from "@/components/user/UserRecentTrend";
import { UserRivals } from "@/components/user/UserRivals";
import { UserGuildContribution } from "@/components/user/UserGuildContribution";
import { UserPositionPerformance } from "@/components/user/UserPositionPerformance";
import { BanDetailsCard } from "@/components/user/BanDetailsCard";
import { FiBarChart2, FiActivity, FiClock, FiHexagon, FiGrid } from "react-icons/fi";
import { UserKillerRecords } from "@/components/user/UserKillerRecords";
import { UserAchievements } from "@/components/achievements/UserAchievements";
import { UserAlbum } from "@/components/user/UserAlbum";
import { AlbumNudge } from "@/components/user/AlbumNudge";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { UserAccountSwitcher } from "@/components/user/UserAccountSwitcher";
import { FollowButton } from "@/components/user/FollowButton";
import { findTopAchievement } from "@/components/achievements/achievementCatalog";

const UserPage = () => {
  const { bbs_name } = useParams<{ bbs_name: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // Disambiguation when several accounts share a bbs_name (e.g. alts of the same player):
  // ?compte=<bbs_id> targets the exact account and takes precedence over name resolution.
  const accountIdParam = searchParams.get("compte") || undefined;
  const { user: resolvedUser, matchedBbsId, isLoading: resolvingUser } = useUserByBBSName(bbs_name, accountIdParam);
  const userId = resolvedUser?._id;
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const { isAdmin, currentUser, managedGuildIds } = useAuth();
  const { leadersCanEdit: leadersCanEditAlbums } = useAlbumSettings();
  const { t } = useTranslation();

  // Tabs: URL key -> index. Legacy keys (tendance, top-rotations, records) map to the tab that now
  // holds their section.
  const TAB_NAMES = ["vue-ensemble", "performances", "evolution", "succes", "album"];
  const TAB_MAP: Record<string, number> = {
    "vue-ensemble": 0,
    "tendance": 0,
    "performances": 1,
    "top-rotations": 1,
    "records": 1,
    "evolution": 2,
    "succes": 3,
    "album": 4,
  };

  const tabParam = searchParams.get("tab");
  const tabIndex = tabParam && TAB_MAP[tabParam] !== undefined ? TAB_MAP[tabParam] : 0;

  const handleTabChange = (index: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (index === 0) {
      // The default tab has no tab parameter
      newParams.delete("tab");
    } else {
      newParams.set("tab", TAB_NAMES[index]);
    }
    setSearchParams(newParams);
  };

  const {
    user: userData,
    isLoading: userLoading,
    error: userError
  } = useUser(userId);
  // The viewed account is not necessarily the main one: when the URL targets an alt's bbs_name, show
  // ITS guild/role/name, not the root mirror (main account).
  const viewedAccount = userData?.bbs_accounts?.find(a => a.bbs_id === matchedBbsId);
  const viewedGuildeId = viewedAccount?.guilde_id ?? userData?.guilde_id;
  const { guildName, isLoading: guildLoading } = useGuild(viewedGuildeId);
  const { cycles } = useCycles({ limit: 100, page: 1 });
  const { stats, isLoading: statsLoading } = useUserStats(
    userId,
    selectedCycle,
    matchedBbsId
  );
  // Rarest achievement of the viewed account, shown next to the name
  const { accounts: achievementAccounts } = useUserAchievements(userId);
  const topAchievement = findTopAchievement(achievementAccounts, matchedBbsId);
  // Stats without a cycle filter, only for the overall evolution
  const { stats: globalStats } = useUserStats(userId, undefined, matchedBbsId);

  // Resolve the cycle slug from the URL into its _id (takes precedence over the default)
  useEffect(() => {
    if (!cycles.length) return;
    const slug = searchParams.get("cycle_name");
    if (!slug || selectedCycle) return;
    const resolved = cycleFromSlug(cycles, slug)?._id ?? slug;
    setSelectedCycle(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles]);

  // Default to the most recent cycle when the URL has none
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

  // Keep the selected cycle in sync in the URL (by slug)
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

  // Enrich the user with the avatar and guild name, showing the viewed account's details
  // (bbs_name/guild/role) rather than the main account's when it is an alt.
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
  // The account owner (logged in through Discord), an admin, or a leader of the account's guild when
  // admins allow it can fill the album
  const canEditAlbum = isAdmin
    || (!!currentUser?._id && currentUser._id === userId)
    || (leadersCanEditAlbums && !!user?.guilde_id && managedGuildIds.includes(String(user.guilde_id)));


  const hasContribution = Boolean(globalStats?.guildContribution && globalStats.guildContribution.byCycle.length > 0);
  const hasPositions = Boolean(globalStats?.performanceByQuartile && globalStats.performanceByQuartile.length >= 2);

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
          followControl={<FollowButton bbsId={matchedBbsId ?? user.bbs_id ?? undefined} size="md" />}
          stats={(statsLoading || (stats && stats.totalScores > 0)) ? (
            <UserStatsStrip
              isLoading={statsLoading}
              items={stats ? [
                { label: t("pages.user.statTotalScoresLabel"), value: stats.totalScores.toLocaleString("fr-FR"), help: t("pages.user.statTotalScoresHelp") },
                { label: t("pages.user.statAverageScoreLabel"), value: `${(Math.round(stats.averageScore) / 1000000).toFixed(1)}M`, help: t("pages.user.statAverageScoreHelp") },
                { label: t("pages.user.statTotalPointsLabel"), value: `${(stats.totalPoints / 1000000000).toFixed(1)}B`, help: t("pages.user.statTotalPointsHelp") },
                { label: t("pages.user.statBestScoreLabel"), value: stats.bestScore.score.toLocaleString("fr-FR"), help: t("pages.user.statBestScoreHelp"), accent: true },
              ] : []}
            />
          ) : undefined}
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

        {/* Ban details, admins only */}
        {isAdmin && user.is_banned && <BanDetailsCard user={user} />}

        {currentUser?._id === userId && stats && stats.totalScores > 0 && tabIndex !== TAB_MAP.album && (
          <AlbumNudge bbsId={user.bbs_id ?? undefined} onOpen={() => handleTabChange(TAB_MAP.album)} />
        )}

        {statsLoading ? (
          <VStack spacing={6}>
            <Skeleton h="200px" w="full" borderRadius="xl" />
          </VStack>
        ) : stats && stats.totalScores > 0 ? (
          <VStack spacing={6}>
            <Tabs
              w="full"
              variant="line"
              colorScheme="purple"
              size="md"
              index={tabIndex}
              onChange={handleTabChange}
              isLazy
            >
              <TabList gap={1} mb={5} overflowX="auto" overflowY="hidden" borderColor="border.subtle" sx={{ scrollbarWidth: "none" }}>
                <Tab color="text.secondary" fontWeight="semibold" gap={2} whiteSpace="nowrap" _selected={{ color: "accent", borderColor: "accent" }}>
                  <Icon as={FiBarChart2} aria-hidden />{t("pages.user.tabOverview")}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2} whiteSpace="nowrap" _selected={{ color: "accent", borderColor: "accent" }}>
                  <Icon as={FiActivity} aria-hidden />{t("pages.user.tabPerformances")}
                </Tab>
                <Tab
                  color="text.secondary"
                  fontWeight="semibold"
                  gap={2}
                  whiteSpace="nowrap"
                  _selected={{ color: "accent", borderColor: "accent" }}
                  isDisabled={!globalStats?.temporalEvolution || globalStats.temporalEvolution.length < 2}
                >
                  <Icon as={FiClock} aria-hidden />{t("pages.user.tabEvolution")}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2} whiteSpace="nowrap" _selected={{ color: "accent", borderColor: "accent" }}>
                  <Icon as={FiHexagon} aria-hidden />{t("pages.user.tabAchievements")}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2} whiteSpace="nowrap" _selected={{ color: "accent", borderColor: "accent" }}>
                  <Icon as={FiGrid} aria-hidden />{t("pages.user.tabAlbum")}
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <UserStatsOverview
                      stats={stats}
                      guildName={user?.guild_name}
                      hasGuild={!!user?.guilde_id}
                    />

                    {/* Recent trend (selected cycle only) */}
                    {stats.recentTrend && selectedCycle && (
                      <UserRecentTrend recentTrend={stats.recentTrend} />
                    )}

                    {(hasContribution || hasPositions) && (
                    <SimpleGrid columns={{ base: 1, xl: hasContribution && hasPositions ? 2 : 1 }} spacing={6}>
                    {hasContribution && globalStats?.guildContribution && (
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
                    {/* Performance by cycle period */}
                    {hasPositions && globalStats?.performanceByQuartile && (
                      <UserPositionPerformance
                        performanceByQuartile={globalStats.performanceByQuartile}
                      />
                    )}
                    </SimpleGrid>
                    )}

                    {stats.rivals && stats.rivals.length > 0 && user && (
                      <UserRivals
                        rivals={stats.rivals}
                        currentUser={user}
                        currentUserRank={stats.ranking?.global || null}
                        currentUserAverage={stats.averageScore}
                        loggedInUserId={currentUser?._id}
                      />
                    )}


                  </VStack>
                </TabPanel>

                {/* Performances: chart, top rotations, records per killer */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <UserPerformances stats={stats} />
                    <UserKillerRecords userId={userId} bbsId={matchedBbsId} />
                  </VStack>
                </TabPanel>

                <TabPanel p={0}>
                  <UserTemporalEvolution temporalEvolution={globalStats?.temporalEvolution ?? []} bbsId={matchedBbsId ?? user.bbs_id ?? undefined} />
                </TabPanel>

                <TabPanel p={0}>
                  <UserAchievements userId={userId} bbsId={matchedBbsId} />
                </TabPanel>

                <TabPanel p={0}>
                  <UserAlbum key={user.bbs_id} bbsId={user.bbs_id ?? undefined} canEdit={canEditAlbum} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        ) : (
          <VStack spacing={8} align="stretch">
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
            {/* Without scores there are no tabs: the album stays available below the notice */}
            <UserAlbum key={user.bbs_id} bbsId={user.bbs_id ?? undefined} canEdit={canEditAlbum} />
          </VStack>
        )}
      </Container>
    </>
  );
};

export default UserPage;
