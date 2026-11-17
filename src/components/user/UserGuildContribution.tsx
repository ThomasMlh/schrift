import { Badge, Box, Grid, HStack, Icon, Skeleton, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { FiInfo, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis,
} from "recharts";
import type { IUserStats } from "@/hooks/useAPI";

interface UserGuildContributionProps {
  historicalContribution: NonNullable<IUserStats["guildContribution"]>;
  cycleContribution?: NonNullable<IUserStats["guildContribution"]> | null;
  cycleContributionLoading?: boolean;
  hasSelectedCycle: boolean;
  selectedCycleId?: string;
  selectedCycleName?: string;
  guildName?: string;
  temporalEvolution?: IUserStats["temporalEvolution"];
}

const billions = (value: number) => `${(value / 1_000_000_000).toFixed(2)}B`;

// The player's slice of the guild total, drawn as a pie
const ShareRing = ({ pct }: { pct: number }) => (
  <Box
    boxSize={{ base: "96px", md: "112px" }}
    borderRadius="full"
    flexShrink={0}
    display="grid"
    placeItems="center"
    bg={`conic-gradient(var(--chakra-colors-teal-300) 0 ${Math.min(100, pct)}%, var(--chakra-colors-whiteAlpha-200) 0)`}
    _light={{ bg: `conic-gradient(var(--chakra-colors-teal-500) 0 ${Math.min(100, pct)}%, var(--chakra-colors-gray-200) 0)` }}
  >
    <Box boxSize="74%" borderRadius="full" bg="bg.card" display="grid" placeItems="center">
      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="extrabold" color="teal.300" _light={{ color: "teal.600" }} sx={{ fontVariantNumeric: "tabular-nums" }}>
        {pct}%
      </Text>
    </Box>
  </Box>
);

const Figure = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Box bg="bg.subtle" borderRadius="lg" px={3} py={2} minW={0}>
    <Text fontSize="xs" color="text.muted" fontWeight="semibold" noOfLines={1}>{label}</Text>
    <Text fontSize="lg" fontWeight="bold" color={color ?? "text.strong"} sx={{ fontVariantNumeric: "tabular-nums" }} whiteSpace="nowrap">{value}</Text>
  </Box>
);

// Share of the guild's total score brought by the player: the chosen cycle (or the average) as a pie,
// then the history by cycle
export const UserGuildContribution = ({
  historicalContribution,
  cycleContribution,
  cycleContributionLoading,
  hasSelectedCycle,
  selectedCycleId,
  selectedCycleName,
  guildName,
  temporalEvolution,
}: UserGuildContributionProps) => {
  const { t } = useTranslation();
  const gridColor = useColorModeValue("#E2E8F0", "#2D3748");
  const axisColor = useColorModeValue("#4A5568", "#A0AEC0");

  const cycleNames = new Map((temporalEvolution ?? []).map((c) => [c.cycle_id, c.cycle_name]));
  const chartData = historicalContribution.byCycle.map((c) => ({
    name: cycleNames.get(c.cycle_id) ?? "Cycle",
    cycle_id: c.cycle_id,
    pct: c.contributionPct,
    userTotal: c.userTotal,
    guildTotal: c.guildTotal,
  }));
  type ChartItem = (typeof chartData)[number];
  const avg = historicalContribution.averagePct;
  const best = chartData.reduce<ChartItem | null>((top, c) => (!top || c.pct > top.pct ? c : top), null);
  const last = chartData.at(-1) ?? null;

  const cycleStat = cycleContribution?.byCycle[0] ?? null;
  const otherGuild = hasSelectedCycle && !cycleContributionLoading && cycleContribution !== undefined && cycleStat === null;
  const delta = cycleStat ? Math.round((cycleStat.contributionPct - avg) * 100) / 100 : null;

  const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartItem }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <Box bg="bg.elevated" p={3} borderRadius="md" borderWidth="1px" borderColor="border.default" boxShadow="lg">
        <Text fontWeight="bold" mb={1} fontSize="sm">{d.name}</Text>
        <Text fontSize="sm" color="teal.300">{t("components.user.guildContribution.labelContribution")} <strong>{d.pct}%</strong></Text>
        <Text fontSize="xs" color="text.muted">{billions(d.userTotal)} / {billions(d.guildTotal)} {t("components.user.guildContribution.labelGuildTotal")}</Text>
      </Box>
    );
  };

  return (
    <Box
      bgColor="bg.card"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
      bgGradient="linear(to-br, rgba(49, 151, 149, 0.14), transparent 45%)"
    >
      <HStack spacing={3} mb={4} align="center">
        <Box p={2} borderRadius="lg" bg="teal.900" color="teal.200" _light={{ bg: "teal.100", color: "teal.700" }}>
          <Icon as={FiUsers} boxSize={5} aria-hidden />
        </Box>
        <Box minW={0}>
          <HStack spacing={2} flexWrap="wrap">
            <Text fontWeight="bold" fontSize="md" color="text.strong">{t("components.user.guildContribution.title")}</Text>
            {guildName && <Badge colorScheme="teal" variant="subtle" borderRadius="full" textTransform="none">{guildName}</Badge>}
          </HStack>
          <Text fontSize="xs" color="text.muted">{t("components.user.guildContribution.subtitle")}</Text>
        </Box>
      </HStack>

      {cycleContributionLoading ? (
        <HStack spacing={4} mb={5}><Skeleton boxSize="112px" borderRadius="full" /><Skeleton h="60px" flex={1} borderRadius="lg" /></HStack>
      ) : otherGuild ? (
        <HStack spacing={2} mb={5} flexWrap="wrap">
          <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2} py={1}>{t("components.user.guildContribution.differentGuild")}</Badge>
          <Text fontSize="sm" color="text.muted">{t("components.user.guildContribution.differentGuildNote", { cycle: selectedCycleName ?? "" })}</Text>
        </HStack>
      ) : (
        <HStack spacing={{ base: 4, md: 6 }} mb={5} align="center">
          <ShareRing pct={cycleStat ? cycleStat.contributionPct : avg} />
          <VStack align="stretch" spacing={3} flex={1} minW={0}>
            <Box>
              <Text fontSize="sm" color="text.muted">
                {cycleStat ? (selectedCycleName ?? t("components.user.guildContribution.selectedCycle")) : t("components.user.guildContribution.averageLabel")}
              </Text>
              {cycleStat && delta !== null ? (
                <Text fontSize="sm" fontWeight="semibold" color={delta >= 0 ? "green.300" : "orange.300"}>
                  {t("components.user.guildContribution.vsAverage", { delta: `${delta >= 0 ? "+" : ""}${delta}` })}
                </Text>
              ) : (
                <Text fontSize="sm" color="text.muted">{t("components.user.guildContribution.cyclesCount", { count: chartData.length })}</Text>
              )}
            </Box>
            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2}>
              {cycleStat ? (
                <>
                  <Figure label={t("components.user.guildContribution.myTotal")} value={billions(cycleStat.userTotal)} color="teal.300" />
                  <Figure label={t("components.user.guildContribution.guildTotal")} value={billions(cycleStat.guildTotal)} />
                </>
              ) : (
                <>
                  {best && <Figure label={t("components.user.guildContribution.bestShare", { cycle: best.name })} value={`${best.pct}%`} color="teal.300" />}
                  {last && <Figure label={t("components.user.guildContribution.lastShare", { cycle: last.name })} value={`${last.pct}%`} />}
                </>
              )}
            </Grid>
          </VStack>
        </HStack>
      )}

      {chartData.length >= 2 && (
        <>
          <Text fontSize="sm" fontWeight="semibold" color="text.muted" mb={2}>{t("components.user.guildContribution.historicalHeading")}</Text>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="contribution-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4FD1C5" />
                  <stop offset="1" stopColor="#2C7A7B" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={11} unit="%" domain={[0, "auto"]} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <ReferenceLine y={avg} stroke="#B794F4" strokeDasharray="4 4" label={{ value: t("components.user.guildContribution.chartAvg", { avg }), fill: "#B794F4", fontSize: 11, position: "insideTopRight" }} />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={42}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.cycle_id}
                    fill={entry.cycle_id === selectedCycleId ? "#B794F4" : "url(#contribution-bar)"}
                    opacity={entry.cycle_id === selectedCycleId || entry.pct >= avg ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      <HStack spacing={1.5} mt={3} pt={3} borderTopWidth="1px" borderColor="border.subtle" align="start">
        <Icon as={FiInfo} boxSize={3} color="text.muted" flexShrink={0} mt={0.5} aria-hidden />
        <Text fontSize="xs" color="text.muted">{t("components.user.guildContribution.note")}</Text>
      </HStack>
    </Box>
  );
};
