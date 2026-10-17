import {
  Container,
  VStack,
  Box,
  Flex,
  HStack,
  Text,
  Icon,
  SimpleGrid,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiUsers, FiGrid, FiActivity, FiBarChart2, FiAward, FiTarget, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import { StatCard } from "../components/ui/StatCard";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { GuildOrgChart } from "../components/GuildOrgChart";
import { useGuilds, useAllGuildsMemberCounts, useGuildMembers, useGuildStats, useCycles, useGuildRankings } from "@/hooks/useAPI";
import { formatScore } from "@/utils/format";
import { GuildTopMembers } from "@/components/guild/GuildTopMembers";
import { GuildScoreDistribution } from "@/components/guild/GuildScoreDistribution";
import { GuildEvolution } from "@/components/guild/GuildEvolution";
import { GuildGoals } from "@/components/guild/GuildGoals";
import { GuildLogo } from "@/components/guild/GuildLogo";
import { GuildWeeklyRanking } from "@/components/guild/GuildWeeklyRanking";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { CycleSelect } from "@/components/ui/CycleSelect";
import type { IGuild } from "../interfaces";
import { useTranslation } from "react-i18next";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";

const TAB_KEYS = ["overview", "members", "stats"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const GuildesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { guilds } = useGuilds(true);
  const [selectedGuild, setSelectedGuild] = useState<IGuild | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [selectedWeeklyWeek, setSelectedWeeklyWeek] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = searchParams.get("tab");
    return TAB_KEYS.includes(tab as TabKey) ? (tab as TabKey) : "overview";
  });
  const { t } = useTranslation();


  // Select the guild from the URL (by name), defaulting to the first one
  useEffect(() => {
    if (guilds.length > 0 && !selectedGuild) {
      const urlGuildName = searchParams.get("guild_name");
      const target = urlGuildName ? guilds.find((g) => g.name === urlGuildName) : null;
      setSelectedGuild(target ?? guilds[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guilds, selectedGuild]);

  const { cycles, isLoading: isLoadingCycles } = useCycles();
  const { currentCycle } = useCurrentRotation(cycles, isLoadingCycles);

  // Resolve the cycle slug from the URL into its MongoDB _id (takes precedence over currentCycle)
  useEffect(() => {
    if (!cycles.length) return;
    const slug = searchParams.get("cycle_name");
    if (!slug || selectedCycleId) return;
    const resolved = cycleFromSlug(cycles, slug)?._id ?? slug;
    setSelectedCycleId(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles]);

  useEffect(() => {
    if (currentCycle?._id && !selectedCycleId && !searchParams.get("cycle_name")) {
      setSelectedCycleId(currentCycle._id);
    }
  }, [currentCycle, selectedCycleId, searchParams]);

  // Keep the guild (by name) and cycle (by slug) in sync in the URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedGuild?.name) {
      newParams.set("guild_name", selectedGuild.name);
    } else {
      newParams.delete("guild_name");
    }
    const cycleObj = cycles.find(c => c._id === selectedCycleId);
    if (cycleObj) {
      newParams.set("cycle_name", cycleSlug(cycleObj.name, cycleObj.year));
    } else if (selectedCycleId) {
      newParams.set("cycle_name", selectedCycleId);
    } else {
      newParams.delete("cycle_name");
    }
    if (activeTab !== "overview") {
      newParams.set("tab", activeTab);
    } else {
      newParams.delete("tab");
    }
    setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuild, selectedCycleId, activeTab]);

  const { memberCounts: guildMemberCounts, isLoading } = useAllGuildsMemberCounts(true);
  const { members, isLoading: isLoadingMembers } = useGuildMembers(selectedGuild?._id, true);
  const totalMembers = Object.values(guildMemberCounts ?? {}).reduce((acc, n) => acc + n, 0);

  const { stats: guildStats, isLoading: isLoadingStats } = useGuildStats(selectedGuild?._id, selectedCycleId || undefined);
  const { rankings } = useGuildRankings(selectedCycleId || undefined);
  const currentGuildRank = selectedGuild ? rankings.find(r => r._id === selectedGuild._id) : null;

  const selectedCycleObj = cycles.find((c) => c._id === selectedCycleId);
  const leaderNames = members
    .filter((m) => m.role === "chef" || m.role === "sous-chef")
    .sort((a, b) => (a.role === "chef" ? -1 : 0) - (b.role === "chef" ? -1 : 0))
    .map((m) => m.bbs_name || m.global_name || m.username)
    .filter(Boolean)
    .join(" · ");
  const maxWeeks = selectedCycleObj ? Math.floor(selectedCycleObj.rotations.length / 2) : 0;


  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Guildes Schrift BBS",
    "description": "Découvrez l'organisation des guildes Schrift pour Bleach Brave Souls",
    "url": "https://bbs-schrift.fr/guildes"
  };

  return (
    <>
      <SEOHead
        title={t("pages.guilds.seoTitle")}
        description={t("pages.guilds.seoDescription")}
        keywords="Bleach Brave Souls, BBS, guildes, Schrift, organisation, membres"
        url="https://bbs-schrift.fr/guildes"
        structuredData={structuredData}
      />

      <Box w="100%">
        <HeroSection
          title={t("pages.guilds.heroTitle")}
          description={t("pages.guilds.heroDescription")}
          size="lg"
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">

            <Box>
              <Flex justify="space-between" align="baseline" mb={3} gap={3} wrap="wrap">
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.muted">
                  {t("pages.guilds.pickGuild")}
                </Text>
                <Text fontSize="sm" color="text.muted">
                  {t("pages.guilds.summary", { guilds: guilds.length, members: isLoading ? "…" : totalMembers })}
                </Text>
              </Flex>
              {/* Inner padding: horizontal scrolling would otherwise clip the selected guild's outline and its hover lift */}
              <Box
                overflowX="auto"
                mx={{ base: -4, md: -1 }}
                px={{ base: 4, md: 1 }}
                mt={-1}
                pt={1.5}
                pb={2}
              >
                <HStack spacing={3} minW="max-content" role="tablist" aria-label={t("pages.guilds.pickGuild")}>
                  {guilds.map((guild) => {
                    const isSelected = selectedGuild?._id === guild._id;
                    return (
                      <Box
                        key={guild._id}
                        as="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setSelectedGuild(guild)}
                        display="flex"
                        alignItems="center"
                        gap={3}
                        minW="150px"
                        px={4}
                        py={3}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={isSelected ? "purple.400" : "border.subtle"}
                        bg={isSelected ? "rgba(159, 122, 234, 0.12)" : "bg.card"}
                        boxShadow={isSelected ? "0 0 0 1px var(--chakra-colors-purple-400)" : undefined}
                        transition="border-color 0.15s, transform 0.15s"
                        _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
                        textAlign="left"
                      >
                        <GuildLogo guild={guild} size="36px" />
                        <Box minW={0}>
                          <Text fontWeight="bold" color={isSelected ? "purple.300" : "text.strong"} noOfLines={1}>
                            Schrift {guild.name}
                          </Text>
                          <Text fontSize="xs" color="text.muted">
                            {guildMemberCounts?.[guild._id] ?? 0} {t("pages.guilds.memberPlural")}
                          </Text>
                        </Box>
                      </Box>
                    );
                  })}
                </HStack>
              </Box>
            </Box>

            {selectedGuild && (
              <>
                <Flex
                  bg="bg.card"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  borderRadius="2xl"
                  boxShadow="md"
                  p={{ base: 4, md: 6 }}
                  gap={5}
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "stretch", md: "center" }}
                  justify="space-between"
                >
                  <HStack spacing={4} minW={0}>
                    <GuildLogo guild={selectedGuild} size="64px" />
                    <Box minW={0}>
                      <HStack spacing={3} wrap="wrap">
                        <Text
                          as="h2"
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="extrabold"
                          letterSpacing="tight"
                          lineHeight="short"
                          bgGradient="linear(to-r, purple.300, blue.400)"
                          bgClip="text"
                        >
                          Schrift {selectedGuild.name}
                        </Text>
                        {currentGuildRank && rankings.length > 0 && (
                          <Badge
                            colorScheme={currentGuildRank.rank === 1 ? "yellow" : "purple"}
                            variant="subtle"
                            borderRadius="full"
                            fontSize="xs"
                            px={2.5}
                            py={0.5}
                          >
                            #{currentGuildRank.rank} / {rankings.length}
                          </Badge>
                        )}
                      </HStack>
                      <HStack spacing={4} mt={1} fontSize="sm" color="text.muted" wrap="wrap">
                        <HStack spacing={1.5}>
                          <Icon as={FiUsers} boxSize={3.5} aria-hidden />
                          <Text>{guildMemberCounts?.[selectedGuild._id] ?? 0} {t("pages.guilds.memberPlural")}</Text>
                        </HStack>
                        {leaderNames && (
                          <HStack spacing={1.5} minW={0}>
                            <Icon as={FaCrown} boxSize={3.5} color="purple.400" aria-hidden />
                            <Text noOfLines={1}>{leaderNames}</Text>
                          </HStack>
                        )}
                      </HStack>
                    </Box>
                  </HStack>

                  <Box w={{ base: "100%", md: "220px" }} flexShrink={0}>
                    <Text fontSize="xs" color="text.muted" mb={1}>{t("pages.guilds.cycleLabel")}</Text>
                    <CycleSelect
                      cycles={cycles}
                      value={selectedCycleId}
                      onChange={setSelectedCycleId}
                      allowDeselect
                      size="sm"
                      showActiveBadge
                    />
                  </Box>
                </Flex>

                <Tabs
                  index={TAB_KEYS.indexOf(activeTab)}
                  onChange={(index) => setActiveTab(TAB_KEYS[index])}
                  variant="soft-rounded"
                  colorScheme="purple"
                  size="sm"
                  isLazy
                >
                  <TabList gap={1} flexWrap="wrap">
                    <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                      <Icon as={FiGrid} aria-hidden />{t("pages.guilds.tabOverview")}
                    </Tab>
                    <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                      <Icon as={FiUsers} aria-hidden />{t("pages.guilds.tabMembers")}
                    </Tab>
                    <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                      <Icon as={FiActivity} aria-hidden />{t("pages.guilds.tabStats")}
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={0} pt={5}>
                      <VStack spacing={4} align="stretch">
                        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={3}>
                          {[
                            { label: t("pages.guilds.statAvgScore"), icon: FiBarChart2, gradient: "linear(to-br, orange.400, red.400)", value: guildStats ? formatScore(guildStats.averageScore) : null },
                            { label: t("pages.guilds.statBestScore"), icon: FiAward, gradient: "linear(to-br, yellow.400, orange.400)", value: guildStats ? formatScore(guildStats.bestScore) : null },
                            { label: t("pages.guilds.statTotalParticipations"), icon: FiTarget, gradient: "linear(to-br, blue.400, purple.500)", value: guildStats ? guildStats.totalScores.toLocaleString("fr-FR") : null },
                            { label: t("pages.guilds.statTotalPoints"), icon: FiTrendingUp, gradient: "linear(to-br, purple.500, pink.400)", value: guildStats ? formatScore(guildStats.totalPoints) : null },
                            {
                              label: t("pages.guilds.statClearRate"),
                              icon: FiCheckCircle, gradient: "linear(to-br, green.400, teal.400)",
                              value: guildStats ? `${guildStats.clearRate}%` : null,
                              tooltip: t("pages.guilds.statClearRateTooltip"),
                            },
                          ].map(({ label, icon, gradient, value, tooltip }) => (
                            <StatCard key={label} label={label} icon={icon} gradient={gradient} value={value} tooltip={tooltip} isLoading={isLoadingStats} />
                          ))}
                        </SimpleGrid>

                        <GuildGoals guildId={selectedGuild._id} cycleId={selectedCycleId || undefined} />

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                          <GuildTopMembers guildId={selectedGuild._id} cycleId={selectedCycleId || undefined} />
                          <GuildScoreDistribution guildId={selectedGuild._id} cycleId={selectedCycleId || undefined} />
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>

                    <TabPanel px={0} pt={5}>
                      <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" px={4} minH="400px">
                        {isLoadingMembers ? (
                          <Flex justify="center" align="center" h="400px">
                            <Text fontSize="md" color="text.muted" fontWeight="medium">
                              {t("pages.guilds.loading")}
                            </Text>
                          </Flex>
                        ) : (
                          <GuildOrgChart members={members} />
                        )}
                      </Box>
                    </TabPanel>

                    <TabPanel px={0} pt={5}>
                      <VStack spacing={4} align="stretch">
                        <GuildEvolution guildId={selectedGuild._id} />
                        {selectedCycleObj && maxWeeks > 0 && (
                          <GuildWeeklyRanking
                            guildName={selectedGuild.name}
                            cycleName={selectedCycleObj.name}
                            cycleId={selectedCycleObj._id ?? ""}
                            maxWeeks={maxWeeks}
                            weekNumber={selectedWeeklyWeek}
                            onWeekChange={setSelectedWeeklyWeek}
                          />
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default GuildesPage;
