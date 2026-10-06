import {
  Container,
  VStack,
  Box,
  Flex,
  HStack,
  useColorModeValue,
  Image,
  Text,
  Icon,
  SimpleGrid,
  Divider,
  Tooltip,
  Skeleton,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiUsers, FiGrid, FiChevronRight } from "react-icons/fi";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { GuildOrgChart } from "../components/GuildOrgChart";
import { useGuilds, useAllGuildsMemberCounts, useGuildMembers, useGuildStats, useCycles, useGuildRankings } from "@/hooks/useAPI";
import { formatScore } from "@/utils/format";
import { GuildTopMembers } from "@/components/guild/GuildTopMembers";
import { GuildScoreDistribution } from "@/components/guild/GuildScoreDistribution";
import { GuildEvolution } from "@/components/guild/GuildEvolution";
import { GuildGoals } from "@/components/guild/GuildGoals";
import { GuildWeeklyRanking } from "@/components/guild/GuildWeeklyRanking";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { CycleSelect } from "@/components/ui/CycleSelect";
import type { IGuild } from "../interfaces";
import { useTranslation } from "react-i18next";
import { cycleSlug, cycleFromSlug } from "@/utils/cycleHelpers";
import { bucketUrl } from "@/utils/apiRequest";

const GuildesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { guilds } = useGuilds(true);
  const [selectedGuild, setSelectedGuild] = useState<IGuild | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [selectedWeeklyWeek, setSelectedWeeklyWeek] = useState(1);
  const { t } = useTranslation();

  const sidebarBg = useColorModeValue("white", "rgba(26, 32, 44, 0.8)");
  const sidebarBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const panelBg = useColorModeValue("gray.50", "rgba(26, 32, 44, 0.4)");
  const panelHeaderBg = useColorModeValue("white", "rgba(26, 32, 44, 0.8)");
  const itemHoverBg = useColorModeValue("purple.50", "whiteAlpha.50");
  const itemActiveBg = useColorModeValue("purple.50", "rgba(159, 122, 234, 0.12)");
  const countColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const dividerColor = useColorModeValue("gray.100", "whiteAlpha.100");

  // Sélectionner la guilde depuis l'URL (par nom) ou par défaut la première
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

  // Résolution du slug cycle depuis l'URL → _id MongoDB (prioritaire sur currentCycle)
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

  // Sync guilde (par nom) et cycle (par slug) dans l'URL
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
    setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuild, selectedCycleId]);

  const { memberCounts: guildMemberCounts, isLoading } = useAllGuildsMemberCounts(true);
  const { members, isLoading: isLoadingMembers } = useGuildMembers(selectedGuild?._id, true);
  const totalMembers = Object.values(guildMemberCounts ?? {}).reduce((acc, n) => acc + n, 0);

  const { stats: guildStats, isLoading: isLoadingStats } = useGuildStats(selectedGuild?._id, selectedCycleId || undefined);
  const { rankings } = useGuildRankings(selectedCycleId || undefined);
  const currentGuildRank = selectedGuild ? rankings.find(r => r._id === selectedGuild._id) : null;

  const selectedCycleObj = cycles.find((c) => c._id === selectedCycleId);
  const maxWeeks = selectedCycleObj ? Math.floor(selectedCycleObj.rotations.length / 2) : 0;

  const statCardBg = useColorModeValue("white", "rgba(26, 32, 44, 0.7)");
  const statCardBorder = useColorModeValue("gray.100", "whiteAlpha.100");

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
          badge={{ text: t("pages.guilds.heroBadge"), icon: "⚔️" }}
          size="lg"
        />

        <Container maxW="container.xl" py={8}>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={5}
            align="stretch"
            minH="600px"
          >
            {/* ── Sidebar ── */}
            <Box
              w={{ base: "100%", md: "240px" }}
              flexShrink={0}
              bg={sidebarBg}
              borderRadius="xl"
              borderWidth={1}
              borderColor={sidebarBorder}
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Stats */}
              <Box px={5} py={4} borderBottomWidth={1} borderColor={dividerColor}>
                <HStack spacing={6}>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Icon as={FiGrid} boxSize={3} color={countColor} />
                      <Text fontSize="2xs" color={countColor} textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
                        {t("pages.guilds.statsGuilds")}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="2xl"
                      fontWeight="extrabold"
                      bgGradient="linear(to-r, purple.500, pink.400)"
                      bgClip="text"
                      lineHeight={1.2}
                    >
                      {guilds.length}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Icon as={FiUsers} boxSize={3} color={countColor} />
                      <Text fontSize="2xs" color={countColor} textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
                        {t("pages.guilds.statsMembers")}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="2xl"
                      fontWeight="extrabold"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      bgClip="text"
                      lineHeight={1.2}
                    >
                      {isLoading ? "..." : totalMembers}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Guild list — vertical on md+, horizontal scroll on mobile */}
              <Box
                overflowX={{ base: "auto", md: "hidden" }}
                overflowY={{ base: "hidden", md: "auto" }}
              >
                <Flex
                  direction={{ base: "row", md: "column" }}
                  w={{ base: "100%", md: "auto" }}
                  minW={{ base: "max-content", md: "auto" }}
                >
                  {guilds.map((guild) => {
                    const isSelected = selectedGuild?._id === guild._id;
                    return (
                      <Box
                        key={guild._id}
                        as="button"
                        onClick={() => setSelectedGuild(guild)}
                        px={4}
                        py={3}
                        borderBottomWidth={{ base: 0, md: "1px" }}
                        borderRightWidth={{ base: "1px", md: 0 }}
                        borderColor={dividerColor}
                        bg={isSelected ? itemActiveBg : "transparent"}
                        _hover={{ bg: isSelected ? itemActiveBg : itemHoverBg }}
                        transition="background 0.15s"
                        position="relative"
                        textAlign="left"
                        flex={{ base: 1, md: "none" }}
                        minW={{ base: "80px", md: "auto" }}
                        w={{ base: "auto", md: "100%" }}
                      >
                        {/* Active indicator */}
                        {isSelected && (
                          <Box
                            position="absolute"
                            left={{ base: 0, md: 0 }}
                            top={{ base: 0, md: 0 }}
                            bottom={{ base: 0, md: 0 }}
                            right={{ base: 0, md: "auto" }}
                            w={{ base: "100%", md: "3px" }}
                            h={{ base: "3px", md: "100%" }}
                            bgGradient="linear(to-b, purple.400, pink.400)"
                          />
                        )}

                        <HStack spacing={3} justify="space-between">
                          <HStack spacing={3}>
                            <Box w="32px" h="32px" flexShrink={0}>
                              {!imageErrors[guild._id] ? (
                                <Image
                                  src={`${bucketUrl}/guilds/${guild.name}.png`}
                                  alt={guild.name}
                                  w="32px"
                                  h="32px"
                                  objectFit="contain"
                                  onError={() =>
                                    setImageErrors((prev) => ({
                                      ...prev,
                                      [guild._id]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <Flex
                                  w="32px"
                                  h="32px"
                                  align="center"
                                  justify="center"
                                  bgGradient="linear(to-br, purple.500, pink.400)"
                                  borderRadius="md"
                                >
                                  <Text fontSize="xs" color="white" fontWeight="bold">
                                    {guild.name.charAt(0)}
                                  </Text>
                                </Flex>
                              )}
                            </Box>
                            <Text
                              fontSize="sm"
                              fontWeight={isSelected ? "bold" : "medium"}
                              color={isSelected ? "purple.300" : undefined}
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {guild.name}
                            </Text>
                          </HStack>

                          <Icon
                            as={FiChevronRight}
                            color="purple.400"
                            boxSize={4}
                            opacity={isSelected ? 1 : 0}
                            transition="opacity 0.15s"
                            display={{ base: "none", md: "block" }}
                          />
                        </HStack>
                      </Box>
                    );
                  })}
                </Flex>
              </Box>
            </Box>

            {/* ── Main panel ── */}
            <Box
              flex={1}
              bg={panelBg}
              borderRadius="xl"
              borderWidth={1}
              borderColor={sidebarBorder}
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Panel header */}
              {selectedGuild && (
                <Box
                  px={8}
                  py={4}
                  borderBottomWidth={1}
                  borderColor={dividerColor}
                  bg={panelHeaderBg}
                >
                  <HStack spacing={4}>
                    {!imageErrors[selectedGuild._id] && (
                      <Image
                        src={`${bucketUrl}/guilds/${selectedGuild.name}.png`}
                        alt={selectedGuild.name}
                        h="32px"
                        w="auto"
                        onError={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            [selectedGuild._id]: true,
                          }))
                        }
                      />
                    )}
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Text fontSize="md" fontWeight="bold">
                          Schrift {selectedGuild.name}
                        </Text>
                        {currentGuildRank && rankings.length > 0 && (
                          <Badge
                            colorScheme={currentGuildRank.rank === 1 ? "yellow" : "purple"}
                            variant="subtle"
                            borderRadius="full"
                            fontSize="2xs"
                            px={2}
                          >
                            #{currentGuildRank.rank} / {rankings.length}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color={countColor}>
                        {guildMemberCounts?.[selectedGuild._id] || 0}{" "}
                        {t("pages.guilds.memberPlural")}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {/* Org chart */}
              <Box px={4} minH="500px">
                {isLoadingMembers ? (
                  <Flex justify="center" align="center" h="400px">
                    <Text fontSize="md" color="gray.500" fontWeight="medium">
                      {t("pages.guilds.loading")}
                    </Text>
                  </Flex>
                ) : (
                  <GuildOrgChart members={members} />
                )}
              </Box>

              {/* Guild stats */}
              {selectedGuild && (
                <Box px={6} pb={8}>
                  <Divider mb={6} borderColor={dividerColor} />
                  <HStack justify="space-between" align="center" mb={4}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color={countColor}
                    >
                      {t("pages.guilds.statsSection")}
                    </Text>
                    <Box minW="180px">
                      <CycleSelect
                        cycles={cycles}
                        value={selectedCycleId}
                        onChange={setSelectedCycleId}
                        allowDeselect
                        size="sm"
                        showActiveBadge
                      />
                    </Box>
                  </HStack>
                  <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={3}>
                    {[
                      { label: t("pages.guilds.statAvgScore"), icon: "📊", value: guildStats ? formatScore(guildStats.averageScore) : null },
                      { label: t("pages.guilds.statBestScore"), icon: "🏆", value: guildStats ? formatScore(guildStats.bestScore) : null },
                      { label: t("pages.guilds.statTotalParticipations"), icon: "🎯", value: guildStats ? guildStats.totalScores.toLocaleString("fr-FR") : null },
                      { label: t("pages.guilds.statTotalPoints"), icon: "💰", value: guildStats ? formatScore(guildStats.totalPoints) : null },
                      {
                        label: t("pages.guilds.statClearRate"),
                        icon: "✅",
                        value: guildStats ? `${guildStats.clearRate}%` : null,
                        tooltip: t("pages.guilds.statClearRateTooltip"),
                      },
                    ].map(({ label, icon, value, tooltip }) => (
                      <Tooltip key={label} label={tooltip} isDisabled={!tooltip} hasArrow placement="top">
                        <Box
                          bg={statCardBg}
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor={statCardBorder}
                          p={4}
                          textAlign="center"
                          boxShadow="sm"
                          cursor={tooltip ? "default" : undefined}
                        >
                          <Text fontSize="lg" mb={1}>{icon}</Text>
                          <Skeleton isLoaded={!isLoadingStats} fadeDuration={0.4}>
                            <Text fontSize="xl" fontWeight="bold" lineHeight={1.2}>
                              {value ?? "—"}
                            </Text>
                          </Skeleton>
                          <Text fontSize="2xs" color={countColor} textTransform="uppercase" letterSpacing="wide" mt={1} fontWeight="semibold">
                            {label}
                          </Text>
                        </Box>
                      </Tooltip>
                    ))}
                  </SimpleGrid>

                  {/* Objectifs du cycle */}
                  <Box mt={2}>
                    <GuildGoals guildId={selectedGuild._id} cycleId={selectedCycleId || undefined} />
                  </Box>

                  {/* Top membres + Distribution */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mt={2}>
                    <GuildTopMembers
                      guildId={selectedGuild._id}
                      cycleId={selectedCycleId || undefined}
                    />
                    <GuildScoreDistribution
                      guildId={selectedGuild._id}
                      cycleId={selectedCycleId || undefined}
                    />
                  </SimpleGrid>

                  {/* Évolution */}
                  <Box mt={4}>
                    <GuildEvolution guildId={selectedGuild._id} />
                  </Box>

                  {/* Classement hebdomadaire */}
                  {selectedCycleObj && maxWeeks > 0 && (
                    <Box mt={4}>
                      <GuildWeeklyRanking
                        guildName={selectedGuild.name}
                        cycleName={selectedCycleObj.name}
                        cycleId={selectedCycleObj._id ?? ""}
                        maxWeeks={maxWeeks}
                        weekNumber={selectedWeeklyWeek}
                        onWeekChange={setSelectedWeeklyWeek}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default GuildesPage;
