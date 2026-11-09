import { useMemo, useState } from "react";
import { Link as RouterLink, useParams, useSearchParams } from "react-router-dom";
import {
  Alert, AlertIcon, Avatar, Badge, Box, Button, Container, Flex, Grid, HStack, SimpleGrid, Skeleton, Text, VStack,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

import { AlterationImage } from "@/components/ui/AlterationImage";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { BuildDetailModal } from "@/components/ui/BuildDetailModal";
import { SEOHead } from "@/components/SEOHead";
import { RotationEvolutionChart } from "@/components/rotation/RotationEvolutionChart";
import { GuildFilter, RotationRankingTable, RotationRecordsTable, TablePager } from "@/components/rotation/RotationTables";
import {
  useBuilds, useCycles, useGuilds, useRotationHistory, useRotationRanking, useRotationRecords, useRotations,
} from "@/hooks/useAPI";
import { useNow } from "@/hooks/useNow";
import { bucketUrl } from "@/utils/apiRequest";
import { formatCountdown } from "@/utils/countdown";
import { formatRealDate } from "@/utils/rotationDates";
import {
  ALL_CYCLES, defaultPassage, matchesRotationSlug, rotationPassages, rotationUrl, type RotationPassage,
} from "@/utils/rotationPassages";
import type { IBuild, ICycleRotation } from "@/interfaces";

const PAGE_SIZE = 20;

const Card = ({ children, ...props }: React.ComponentProps<typeof Box>) => (
  <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" {...props}>{children}</Box>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted">{children}</Text>
);

const Stat = ({ label, value, detail, highlight }: { label: string; value: string; detail?: string; highlight?: boolean }) => (
  <Box
    bg="bg.subtle"
    borderRadius="xl"
    px={3}
    py={2.5}
    minW={0}
    bgGradient={highlight ? "linear(135deg, rgba(124, 92, 255, 0.18), transparent 70%)" : undefined}
  >
    <SectionTitle>{label}</SectionTitle>
    <Text fontSize="lg" fontWeight="extrabold" color="text.strong" noOfLines={1} sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
    {detail && <Text fontSize="xs" color="text.muted" noOfLines={1}>{detail}</Text>}
  </Box>
);

// Position of the rotation in a cycle, or its state when it is running or still to come
const PassageBadge = ({ passage }: { passage?: RotationPassage }) => {
  const { t } = useTranslation();
  if (!passage) return null;
  if (passage.state === "current") return <Badge colorScheme="green" fontSize="2xs">{t("pages.rotation.current")}</Badge>;
  if (passage.state === "upcoming") return <Badge colorScheme="gray" fontSize="2xs">{t("pages.rotation.upcoming")}</Badge>;
  return <Badge colorScheme="purple" variant="subtle" fontSize="2xs">#{passage.rotation.position}</Badge>;
};

// Rotation next to the shown one in its cycle, with its attack color
const NeighbourButton = ({ rotation, passage, side }: { rotation: ICycleRotation; passage: RotationPassage; side: "previous" | "next" }) => {
  const { t } = useTranslation();
  return (
    <Button
      as={RouterLink}
      to={rotationUrl(rotation, passage.cycle)}
      size="sm"
      variant="outline"
      fontSize="xs"
      iconSpacing={1}
      leftIcon={side === "previous" ? <ChevronLeftIcon boxSize={4} /> : undefined}
      rightIcon={side === "next" ? <ChevronRightIcon boxSize={4} /> : undefined}
    >
      <HStack spacing={1.5} align="center">
        <Text as="span">#{rotation.position} {t(`factions.${rotation.killer}`, rotation.killer)}</Text>
        <AttackTypeBadge attackType={rotation.attack} size="10px" />
      </HStack>
    </Button>
  );
};

const BuildsPanel = ({ rotationId }: { rotationId: string }) => {
  const { t } = useTranslation();
  const { builds, isLoading } = useBuilds({ rotation_id: rotationId, isValid: true, sort: "score", limit: 4 });
  const [selected, setSelected] = useState<IBuild | null>(null);
  return (
    <Card p={4}>
      <Flex justify="space-between" align="center" mb={3}>
        <SectionTitle>{t("pages.rotation.builds")}</SectionTitle>
        <Button as={RouterLink} to={`/guides/rotations-builds?rotation=${rotationId}`} size="xs" variant="link" colorScheme="purple">
          {t("pages.rotation.seeAll")}
        </Button>
      </Flex>
      {isLoading ? <Skeleton h="120px" borderRadius="lg" /> : builds.length === 0 ? (
        <Text fontSize="sm" color="text.muted">{t("pages.rotation.noBuild")}</Text>
      ) : (
        <VStack align="stretch" spacing={2}>
          {builds.map((build) => (
            <HStack
              key={build._id}
              as="button"
              type="button"
              onClick={() => setSelected(build)}
              bg="bg.subtle"
              borderRadius="xl"
              px={2.5}
              py={2}
              spacing={3}
              textAlign="left"
              _hover={{ bg: "bg.hover" }}
            >
              <HStack spacing={-2} flexShrink={0}>
                {build.team.map((member, i) => (
                  <Avatar
                    key={i}
                    size="sm"
                    src={member.character?._id ? `${bucketUrl}/characters/thumb/${member.character._id}.png` : undefined}
                    name={member.character?.name ?? "?"}
                    borderWidth="2px"
                    borderColor="bg.card"
                  />
                ))}
              </HStack>
              <Box minW={0} flex={1}>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{build.team.map((m) => m.character?.name).filter(Boolean).join(" · ")}</Text>
                {build.user && <Text fontSize="xs" color="text.muted" noOfLines={1}>{build.user.bbs_name || build.user.global_name}</Text>}
              </Box>
              {build.score ? (
                <Text fontSize="sm" fontWeight="bold" flexShrink={0}>{`${(build.score / 1_000_000).toFixed(1)} M`}</Text>
              ) : null}
            </HStack>
          ))}
        </VStack>
      )}
      <BuildDetailModal isOpen={!!selected} onClose={() => setSelected(null)} build={selected} />
    </Card>
  );
};

const RotationPage = () => {
  const { killer: killerParam = "", attack: attackParam = "" } = useParams<{ killer: string; attack: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const now = useNow();
  const language = i18n.language;

  const { rotations, isLoading: rotationsLoading } = useRotations();
  const { cycles, isLoading: cyclesLoading } = useCycles({ limit: 100 });
  const { guilds } = useGuilds(false, true);
  const rotation = rotations.find((r) => matchesRotationSlug(r, killerParam, attackParam)) ?? null;
  const id = rotation?._id ?? "";
  const { history } = useRotationHistory(id || undefined);

  const passages = useMemo(() => rotationPassages(cycles, id, now), [cycles, id, now]);
  const cycleParam = searchParams.get("cycle");
  const showAll = cycleParam === ALL_CYCLES;
  const passage = showAll ? null : passages.find((p) => p.slug === cycleParam) ?? defaultPassage(passages);
  const cycleId = passage?.cycle._id;

  const [guildId, setGuildId] = useState("");
  const [page, setPage] = useState(1);
  const ranking = useRotationRanking(id, passage && passage.state !== "upcoming" ? cycleId : undefined, guildId || undefined, page, PAGE_SIZE);
  const records = useRotationRecords(id, guildId || undefined, page, PAGE_SIZE, showAll);
  const pagination = showAll ? records.pagination : ranking.pagination;

  const selectCycle = (value: string) => {
    setPage(1);
    setSearchParams(value ? { cycle: value } : {}, { replace: true });
  };
  const selectGuild = (value: string) => {
    setPage(1);
    setGuildId(value);
  };
  const guildName = (guild?: string) => guilds.find((g) => g._id === guild)?.name;

  if (rotationsLoading || cyclesLoading) {
    return (
      <Container maxW="container.xl" py={6}>
        <VStack align="stretch" spacing={4}>
          <Skeleton h="16px" w="260px" />
          <Skeleton h="110px" borderRadius="2xl" />
          <Skeleton h="420px" borderRadius="2xl" />
        </VStack>
      </Container>
    );
  }

  if (!rotation) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg"><AlertIcon />{t("pages.rotation.notFound")}</Alert>
      </Container>
    );
  }

  const killer = t(`factions.${rotation.killer}`, rotation.killer);
  const title = `${killer} · ${t(`attackTypes.${rotation.attack}`, rotation.attack)} · ${rotation.alteration}`;
  const played = history?.per_cycle.filter((c) => c.count > 0) ?? [];
  const record = history?.absolute_record ?? null;
  const current = passages.find((p) => p.state === "current");
  const upcoming = [...passages].reverse().find((p) => p.state === "upcoming");
  const firstPlayed = passages[passages.length - 1];

  return (
    <>
      <SEOHead title={`${title} - Schrift BBS`} description={t("pages.rotation.seoDescription", { rotation: title })} noIndex />
      <Container maxW="container.xl" py={5}>
        <VStack align="stretch" spacing={4}>
          <Breadcrumbs items={[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.cycles"), to: "/cycles" },
            { label: title },
          ]} />

          <Card as={Grid} templateColumns={{ base: "1fr", lg: "1.1fr 2fr" }} gap={5} alignItems="center" px={{ base: 4, md: 5 }} py={4}>
            <Box>
              <Text as="h1" fontSize="2xl" fontWeight="extrabold" color="text.strong">{killer}</Text>
              <HStack spacing={4} mt={2} flexWrap="wrap">
                <HStack spacing={1.5}>
                  <AttackTypeBadge attackType={rotation.attack} size="16px" />
                  <Text fontSize="sm" fontWeight="semibold">{t(`attackTypes.${rotation.attack}`, rotation.attack)}</Text>
                </HStack>
                <AlterationImage alteration={rotation.alteration} size="20px" showLabel />
              </HStack>
            </Box>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2.5}>
              <Stat
                label={t("pages.rotation.statPassages")}
                value={t("pages.rotation.statPlayed", { count: played.length })}
                detail={firstPlayed ? t("pages.rotation.statSince", { date: formatRealDate(firstPlayed.start, language).replace(/ \d+.*$/, "") }) : undefined}
              />
              <Stat
                label={t("pages.rotation.statRecord")}
                value={record ? record.score.toLocaleString(language.startsWith("en") ? "en-GB" : "fr-FR") : "—"}
                detail={record ? [record.bbs_name, [record.cycle_name, record.cycle_year].filter(Boolean).join(" ")].filter(Boolean).join(" · ") : undefined}
              />
              <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
                {current ? (
                  <Stat
                    highlight
                    label={t("pages.rotation.statCurrent")}
                    value={t("pages.rotation.endsIn", { time: formatCountdown(current.end.getTime() - now.getTime(), language) })}
                    detail={`${current.cycle.name} · ${current.cycle.year} · #${current.rotation.position}`}
                  />
                ) : (
                  <Stat
                    highlight
                    label={t("pages.rotation.statNext")}
                    value={upcoming ? t("pages.rotation.startsIn", { time: formatCountdown(upcoming.start.getTime() - now.getTime(), language) }) : "—"}
                    detail={upcoming ? `${formatRealDate(upcoming.start, language)} · ${upcoming.cycle.name} · #${upcoming.rotation.position}` : t("pages.rotation.noUpcoming")}
                  />
                )}
              </Box>
            </SimpleGrid>
          </Card>


          <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 360px" }} gap={4} alignItems="start">
            <Card overflow="hidden">
              <Flex
                justify="space-between"
                align="center"
                gap={3}
                wrap={{ base: "wrap", md: "nowrap" }}
                px={4}
                py={3}
                borderBottomWidth="1px"
                borderColor="border.subtle"
              >
                <Flex align="center" gap={3} wrap="wrap" flex={{ base: "1 1 100%", md: "1 1 0" }} minW={0}>
                  <CycleSelect
                    cycles={passages.map((p) => p.cycle)}
                    value={showAll ? ALL_CYCLES : passage?.cycle._id ?? ""}
                    onChange={(value) => selectCycle(value === ALL_CYCLES ? ALL_CYCLES : passages.find((p) => p.cycle._id === value)?.slug ?? "")}
                    leadingOptions={[{ value: ALL_CYCLES, label: t("pages.rotation.allCycles") }]}
                    renderBadge={(cycle) => <PassageBadge passage={passages.find((p) => p.cycle._id === cycle._id)} />}
                    allowDeselect={false}
                    size="sm"
                    w={{ base: "100%", sm: "280px" }}
                  />
                  <Text fontSize="sm" color="text.muted" minW={0}>
                    {showAll ? t("pages.rotation.recordsSubtitle") : passage ? (
                      <>
                        {`${formatRealDate(passage.start, language)} → ${formatRealDate(passage.end, language)}`}
                        {(() => {
                          const stats = history?.per_cycle.find((c) => c.cycle_id === passage.cycle._id);
                          return stats && stats.count > 0
                            ? ` · ${t("pages.rotation.participants", { count: stats.count })} · ${t("pages.rotation.average", { value: `${((stats.average ?? 0) / 1_000_000).toFixed(1)} M` })}`
                            : "";
                        })()}
                      </>
                    ) : t("pages.rotation.noPassage")}
                  </Text>
                </Flex>
                {passage && !showAll && (
                  <Grid templateColumns={{ base: "1fr 1fr", md: "auto auto" }} gap={2} flexShrink={0} w={{ base: "100%", md: "auto" }}>
                    {passage.previous && <NeighbourButton rotation={passage.previous} passage={passage} side="previous" />}
                    {passage.next && <NeighbourButton rotation={passage.next} passage={passage} side="next" />}
                  </Grid>
                )}
              </Flex>

              {passage?.state === "upcoming" && !showAll ? (
                <Text textAlign="center" color="text.muted" py={12} px={4}>
                  {t("pages.rotation.notPlayedYet", { time: formatCountdown(passage.start.getTime() - now.getTime(), language) })}
                </Text>
              ) : (
                <>
                  <Flex justify="space-between" align="center" gap={3} wrap="wrap" px={4} py={3}>
                    <SectionTitle>{showAll ? t("pages.rotation.records") : t("pages.rotation.ranking")}</SectionTitle>
                    <GuildFilter guilds={guilds} value={guildId} onChange={selectGuild} />
                  </Flex>
                  {showAll
                    ? <RotationRecordsTable records={records.records} isLoading={records.isLoading} />
                    : <RotationRankingTable scores={ranking.scores} isLoading={ranking.isLoading} guildName={guildName} />}
                  <TablePager page={page} totalPages={pagination?.totalPages ?? 1} onChange={setPage} />
                </>
              )}
            </Card>

            <VStack align="stretch" spacing={4}>
              <Card p={4}>
                <Box mb={3}><SectionTitle>{t("pages.rotation.evolution")}</SectionTitle></Box>
                <RotationEvolutionChart
                  cycles={history?.per_cycle ?? []}
                  selectedCycleId={showAll ? null : cycleId ?? null}
                  onSelect={(selected) => {
                    const target = passages.find((p) => p.cycle._id === selected);
                    if (target) selectCycle(target.slug);
                  }}
                />
              </Card>
              <BuildsPanel rotationId={id} />
            </VStack>
          </Grid>
        </VStack>
      </Container>
    </>
  );
};

export default RotationPage;
