import { useState } from "react";
import {
  Alert, AlertIcon, Box, Flex, HStack, SimpleGrid, Skeleton, Stat, StatHelpText, StatLabel, StatNumber, Switch, Tab,
  TabList, Tabs, Text, VStack, useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { RaffleTable } from "@/components/raffle/RaffleTable";
import { RaffleDrawPanel } from "@/components/raffle/RaffleDrawPanel";
import { RaffleRules } from "@/components/raffle/RaffleRules";
import { RaffleSettings } from "@/components/raffle/RaffleSettings";
import { useGuildRaffle, useRaffleOverview } from "@/hooks/useAPI";
import { useRaffleMutations } from "@/hooks/mutations/useRaffleMutations";
import { formatMonthKey, formatScore } from "@/utils/format";

// Admin tab: monthly raffle of each taking part guild, manual tickets and the draw
export const RaffleSection = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { overview, isLoading: isLoadingOverview, error: overviewError } = useRaffleOverview();
  const { setSRank } = useRaffleMutations();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [selectedGuildId, setSelectedGuildId] = useState<string>();

  const months = overview?.months ?? [];
  const guilds = overview?.guilds ?? [];
  // The month in progress by default: tickets fill up while it runs
  const month = selectedMonth ?? (months.find((m) => m.in_progress) ?? months[0])?.key;
  const guildId = selectedGuildId ?? guilds[0]?._id;
  const { raffle, isLoading, error: raffleError } = useGuildRaffle(month, guildId);

  const toggleSRank = async (value: boolean) => {
    if (!raffle) return;
    try {
      await setSRank(raffle.month.key, raffle.guild._id, value);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {overview && <RaffleSettings key={overview.guild_ids.join(",")} overview={overview} />}

      {isLoadingOverview && <Skeleton h="80px" borderRadius="xl" />}
      {(overviewError || raffleError) && (
        <Alert status="error" borderRadius="xl"><AlertIcon />{(overviewError ?? raffleError)?.message || t("pages.raffle.loadError")}</Alert>
      )}
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
            onChange={(i) => setSelectedGuildId(guilds[i]._id)}
          >
            <TabList flexWrap="wrap" gap={1}>
              {guilds.map((g) => <Tab key={g._id}>{t("pages.raffle.guild", { name: g.name })}</Tab>)}
            </TabList>
          </Tabs>
          <Box w={{ base: "100%", md: "240px" }}>
            <CustomSelect
              value={month ?? ""}
              onChange={(value) => setSelectedMonth(value)}
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
              <StatLabel>{t("pages.raffle.stats.rotations")}</StatLabel>
              <StatNumber>{raffle.rotations}</StatNumber>
              <StatHelpText mb={0}>{raffle.month.start_date} → {raffle.month.end_date}</StatHelpText>
            </Stat>
            <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
              <StatLabel>{t("pages.raffle.stats.gap")}</StatLabel>
              <StatNumber fontSize="xl">{raffle.collective_gap === null ? "—" : formatScore(raffle.collective_gap)}</StatNumber>
              <StatHelpText mb={0}>{t("pages.raffle.stats.gapGoal", { gap: formatScore(raffle.rules.collectiveGap) })}</StatHelpText>
            </Stat>
            <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
              <StatLabel>{t("pages.raffle.stats.sRank")}</StatLabel>
              <HStack mt={2}>
                <Switch
                  colorScheme="purple"
                  isChecked={raffle.s_rank}
                  isDisabled={raffle.draw !== null}
                  onChange={(e) => void toggleSRank(e.target.checked)}
                  aria-label={t("pages.raffle.stats.sRankHint")}
                />
                <Text fontSize="sm" color="text.secondary">{raffle.s_rank ? t("pages.raffle.stats.sRankYes") : t("pages.raffle.stats.sRankNo")}</Text>
              </HStack>
            </Stat>
          </SimpleGrid>

          <RaffleDrawPanel raffle={raffle} />

          {!raffle.draw && (
            <Text fontSize="sm" color="text.muted">{t("pages.raffle.managerHint")}</Text>
          )}

          <RaffleTable raffle={raffle} />
          <RaffleRules raffle={raffle} />
        </>
      )}
    </VStack>
  );
};
