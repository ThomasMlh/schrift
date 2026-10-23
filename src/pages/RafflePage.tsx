import { useMemo } from "react";
import {
  Alert, AlertIcon, Box, Container, Flex, HStack, SimpleGrid, Skeleton, Stat, StatHelpText, StatLabel, StatNumber, Switch, Tab,
  TabList, Tabs, Text, Tooltip, VStack, useToast,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroSection } from "@/components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { RaffleTable } from "@/components/raffle/RaffleTable";
import { RaffleDrawPanel } from "@/components/raffle/RaffleDrawPanel";
import { RaffleRules } from "@/components/raffle/RaffleRules";
import { RaffleSettings } from "@/components/raffle/RaffleSettings";
import { useGuildRaffle, useRaffleOverview } from "@/hooks/useAPI";
import { useRaffleMutations } from "@/hooks/mutations/useRaffleMutations";
import { useAuth } from "@/providers/AuthProvider";
import { formatMonthKey, formatScore } from "@/utils/format";

const RafflePage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const { isAdmin, managedGuildIds, currentUser } = useAuth();
  const { overview, isLoading: isLoadingOverview } = useRaffleOverview();
  const { setSRank } = useRaffleMutations();

  const months = overview?.months ?? [];
  const guilds = overview?.guilds ?? [];
  // The month in progress by default: tickets fill up while it runs
  const month = params.get("mois") ?? (months.find((m) => m.in_progress) ?? months[0])?.key;
  const ownGuildId = currentUser?.bbs_accounts?.map((a) => a.guilde_id).find((id) => guilds.some((g) => g._id === id));
  const guildId = params.get("guilde") ?? ownGuildId ?? guilds[0]?._id;
  const { raffle, isLoading } = useGuildRaffle(month, guildId);

  const canManage = Boolean(guildId && (isAdmin || managedGuildIds.includes(guildId)));
  const ownBbsIds = useMemo(() => (currentUser?.bbs_accounts ?? []).map((a) => a.bbs_id).filter(Boolean), [currentUser]);
  const mine = raffle?.players.filter((p) => ownBbsIds.includes(p.bbs_id)) ?? [];

  const select = (key: "mois" | "guilde", value: string) => setParams((p) => {
    const next = new URLSearchParams(p);
    next.set(key, value);
    return next;
  }, { replace: true });

  const toggleSRank = async (value: boolean) => {
    if (!raffle) return;
    try {
      await setSRank(raffle.month.key, raffle.guild._id, value);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };

  return (
    <>
      <SEOHead title={t("pages.raffle.seoTitle")} description={t("pages.raffle.seoDescription")} url="https://bbs-schrift.fr/tombola" />
      <HeroSection title={t("pages.raffle.heroTitle")} description={t("pages.raffle.heroDescription", { prize: overview?.prize ?? "" })} />

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={10}>
        <VStack spacing={6} align="stretch">
          {isAdmin && overview && <RaffleSettings key={overview.guild_ids.join(",")} overview={overview} />}

          {isLoadingOverview && <Skeleton h="80px" borderRadius="xl" />}
          {overview && guilds.length === 0 && (
            <Alert status="info" borderRadius="xl"><AlertIcon />{t("pages.raffle.noGuild")}</Alert>
          )}

          {guilds.length > 0 && (
            <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={3} direction={{ base: "column", md: "row" }}>
              <Tabs
                variant="soft-rounded"
                colorScheme="purple"
                size="sm"
                index={Math.max(0, guilds.findIndex((g) => g._id === guildId))}
                onChange={(i) => select("guilde", guilds[i]._id)}
              >
                <TabList flexWrap="wrap" gap={1}>
                  {guilds.map((g) => <Tab key={g._id}>{t("pages.raffle.guild", { name: g.name })}</Tab>)}
                </TabList>
              </Tabs>
              <Box w={{ base: "100%", md: "240px" }}>
                <CustomSelect
                  value={month ?? ""}
                  onChange={(value) => select("mois", value)}
                  options={months.map((m) => ({
                    value: m.key,
                    label: `${formatMonthKey(m.key, i18n.language)}${m.in_progress ? ` · ${t("pages.raffle.inProgress")}` : ""}`,
                  }))}
                />
              </Box>
            </Flex>
          )}

          {guilds.length > 0 && isLoading && <Skeleton h="320px" borderRadius="xl" />}

          {raffle && (
            <>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
                  <StatLabel>{t("pages.raffle.stats.total")}</StatLabel>
                  <StatNumber>{raffle.total_tickets}</StatNumber>
                  <StatHelpText mb={0}>{t("pages.raffle.stats.players", { count: raffle.players.filter((p) => p.tickets > 0).length })}</StatHelpText>
                </Stat>
                <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
                  <StatLabel>{t("pages.raffle.stats.mine")}</StatLabel>
                  <StatNumber>{mine.length > 0 ? mine.reduce((sum, p) => sum + p.tickets, 0) : "—"}</StatNumber>
                  <StatHelpText mb={0}>
                    {mine.length > 0 && raffle.total_tickets > 0
                      ? t("pages.raffle.stats.chance", { value: ((mine.reduce((sum, p) => sum + p.tickets, 0) / raffle.total_tickets) * 100).toFixed(1) })
                      : t("pages.raffle.stats.notInGuild")}
                  </StatHelpText>
                </Stat>
                <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
                  <StatLabel>{t("pages.raffle.stats.gap")}</StatLabel>
                  <StatNumber fontSize="xl">{raffle.collective_gap === null ? "—" : formatScore(raffle.collective_gap)}</StatNumber>
                  <StatHelpText mb={0}>{t("pages.raffle.stats.gapGoal", { gap: formatScore(raffle.rules.collectiveGap) })}</StatHelpText>
                </Stat>
                <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
                  <StatLabel>{t("pages.raffle.stats.sRank")}</StatLabel>
                  <HStack mt={2}>
                    <Tooltip label={t("pages.raffle.stats.sRankHint")} isDisabled={!canManage} hasArrow>
                      <Box>
                        <Switch
                          colorScheme="purple"
                          isChecked={raffle.s_rank}
                          isDisabled={!canManage || raffle.draw !== null}
                          onChange={(e) => void toggleSRank(e.target.checked)}
                        />
                      </Box>
                    </Tooltip>
                    <Text fontSize="sm" color="text.secondary">{raffle.s_rank ? t("pages.raffle.stats.sRankYes") : t("pages.raffle.stats.sRankNo")}</Text>
                  </HStack>
                </Stat>
              </SimpleGrid>

              <RaffleDrawPanel raffle={raffle} canManage={canManage} isAdmin={isAdmin} />

              {canManage && !raffle.draw && (
                <Text fontSize="sm" color="text.muted">{t("pages.raffle.managerHint")}</Text>
              )}

              <RaffleTable raffle={raffle} canManage={canManage} ownBbsIds={ownBbsIds} />
              <RaffleRules raffle={raffle} />
            </>
          )}
        </VStack>
      </Container>
    </>
  );
};

export default RafflePage;
