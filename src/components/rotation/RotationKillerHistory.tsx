import {
  Box, Button, Flex, HStack, SimpleGrid, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr,
  useColorMode, useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  CartesianGrid, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useRotationHistory } from "@/hooks/useAPI";
import type { IKillerRecordHolder } from "@/interfaces";

interface RotationKillerHistoryProps {
  rotationId: string;
  cycleId?: string;
  guildId?: string;
}

// Colors checked for contrast and color blindness on light (#FFFFFF) and dark (#1A202C)
// backgrounds: brand purple for "all players", green for the guild, regardless of the filter.
const SERIES_COLORS = {
  light: { all: "#7C3AED", guild: "#38A169" },
  dark: { all: "#9F7AEA", guild: "#38A169" },
};

interface TooltipRenderProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string; color?: string; payload?: { count: number; guildCount: number | null } }>;
}

const formatScore = (n: number) => n.toLocaleString("fr-FR");
const formatCompact = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  return n.toLocaleString("fr-FR");
};
const cycleLabel = (name: string | null, year: number | null) => [name, year].filter(Boolean).join(" ");

// "History on this killer" section of the rotation page: records and averages over every cycle
// where this killer appeared (a rotation document = a killer + attack type, reused across cycles),
// and the score to beat for the displayed cycle.
export const RotationKillerHistory = ({ rotationId, cycleId, guildId }: RotationKillerHistoryProps) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { history, isLoading } = useRotationHistory(rotationId, guildId, cycleId);
  const [showTable, setShowTable] = useState(false);

  const bg = useColorModeValue("white", "rgba(26,32,44,0.7)");
  const border = "border.faint";
  const tileBg = "bg.subtle";
  const mutedText = "text.muted";
  const strongText = "text.strong";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const axisColor = isDark ? "#718096" : "#A0AEC0";
  const colors = SERIES_COLORS[isDark ? "dark" : "light"];

  if (isLoading) return <Skeleton h="320px" borderRadius="xl" />;
  if (!history) return null;

  const showGuild = !!guildId;
  const chartData = history.per_cycle.map((c) => ({
    name: cycleLabel(c.cycle_name, c.cycle_year),
    all: c.average,
    guild: c.guild_average,
    count: c.count,
    guildCount: c.guild_count,
  }));
  const lastIndex = chartData.length - 1;

  const holderLine = (holder: IKillerRecordHolder) =>
    t("pages.rotationDetail.historyHolder", {
      name: [holder.bbs_name, holder.guild_name && !showGuild ? `(${holder.guild_name})` : null].filter(Boolean).join(" "),
      cycle: cycleLabel(holder.cycle_name, holder.cycle_year),
    });

  const renderTile = (label: string, holder: IKillerRecordHolder | null, help?: string, footer?: ReactNode) => (
    <Box bg={tileBg} borderRadius="xl" p={4} borderWidth="1px" borderColor={border}>
      <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
        {label}
      </Text>
      <Text fontSize="xs" color={mutedText} mb={1} minH="1em">{help}</Text>
      {holder ? (
        <>
          <Text fontSize="2xl" fontWeight="bold" color={strongText} lineHeight="short">{formatScore(holder.score)}</Text>
          <Text fontSize="xs" color={mutedText} mt={1}>{holderLine(holder)}</Text>
        </>
      ) : (
        <Text fontSize="sm" color={mutedText}>{t("pages.rotationDetail.historyNoRecord")}</Text>
      )}
      {footer}
    </Box>
  );

  const toBeat = history.record_to_beat;
  const currentBest = history.current_cycle_best;
  const toBeatFooter = toBeat && currentBest ? (
    currentBest.score > toBeat.score ? (
      <Text fontSize="xs" fontWeight="semibold" mt={2} color={strongText}>✅ {t("pages.rotationDetail.historyBeaten")}</Text>
    ) : (
      <Text fontSize="xs" mt={2} color={mutedText}>
        {t("pages.rotationDetail.historyRemaining", { value: formatScore(toBeat.score - currentBest.score) })}
      </Text>
    )
  ) : null;

  const renderTooltip = ({ active, payload, label }: TooltipRenderProps) => {
    if (!active || !payload?.length) return null;
    return (
      <Box bg={bg} p={3} borderRadius="xl" boxShadow="md" borderWidth="1px" borderColor={border}>
        <Text fontSize="xs" fontWeight="semibold" mb={1} color={strongText}>{label}</Text>
        {payload.filter((p) => p.value != null).map((p) => {
          const isAll = p.dataKey === "all";
          const count = isAll ? p.payload?.count : p.payload?.guildCount;
          return (
            <HStack key={String(p.dataKey)} spacing={2}>
              <Box w={2} h={2} borderRadius="full" bg={p.color} />
              <Text fontSize="xs" color={strongText}>
                {isAll ? t("pages.rotationDetail.historyAllPlayers") : t("pages.rotationDetail.historyGuildAverage")} :{" "}
                {formatScore(Number(p.value))}
              </Text>
              <Text fontSize="xs" color={mutedText}>
                ({t("pages.rotationDetail.historyScoresCount", { count: count ?? 0 })})
              </Text>
            </HStack>
          );
        })}
      </Box>
    );
  };

  // Labels the series name on its last point (in addition to the legend) when two series are shown,
  // so identity does not rely on color alone.
  const seriesEndLabel = (name: string) => (props: { x?: number | string; y?: number | string; index?: number }) =>
    props.index === lastIndex && props.x != null && props.y != null ? (
      <text x={Number(props.x) + 8} y={Number(props.y)} dy={4} fontSize={10} fill={axisColor}>{name}</text>
    ) : null;

  return (
    <Box bg={bg} borderRadius="xl" borderWidth="1px" borderColor={border} p={{ base: 4, md: 5 }}>
      <Text fontSize="md" fontWeight="bold" color={strongText}>{t("pages.rotationDetail.historyTitle")}</Text>
      <Text fontSize="sm" color={mutedText} mb={4}>{t("pages.rotationDetail.historySubtitle")}</Text>

      <SimpleGrid columns={{ base: 1, md: 1 + Number(showGuild) + Number(!!cycleId) }} spacing={3} mb={5}>
        {renderTile(t("pages.rotationDetail.historyAbsoluteRecord"), history.absolute_record)}
        {showGuild && renderTile(t("pages.rotationDetail.historyGuildRecord"), history.guild_record)}
        {cycleId && renderTile(
          t("pages.rotationDetail.historyRecordToBeat"),
          toBeat,
          t("pages.rotationDetail.historyRecordToBeatHelp"),
          toBeatFooter
        )}
      </SimpleGrid>

      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
          {t("pages.rotationDetail.historyChartTitle")}
        </Text>
        {chartData.length >= 2 && (
          <Button size="xs" variant="ghost" onClick={() => setShowTable((v) => !v)}>
            {showTable ? `📈 ${t("pages.rotationDetail.historyShowChart")}` : `📋 ${t("pages.rotationDetail.historyShowTable")}`}
          </Button>
        )}
      </Flex>

      {chartData.length < 2 ? (
        <Flex justify="center" align="center" h="100px">
          <Text fontSize="sm" color={mutedText}>{t("pages.rotationDetail.historyNotEnoughCycles")}</Text>
        </Flex>
      ) : showTable ? (
        <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th />
              <Th isNumeric>{t("pages.rotationDetail.historyAllPlayers")}</Th>
              {showGuild && <Th isNumeric>{t("pages.rotationDetail.historyGuildAverage")}</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {chartData.map((row) => (
              <Tr key={row.name}>
                <Td>{row.name}</Td>
                <Td isNumeric>{row.all != null ? formatScore(row.all) : "—"}</Td>
                {showGuild && <Td isNumeric>{row.guild != null ? formatScore(row.guild) : "—"}</Td>}
              </Tr>
            ))}
          </Tbody>
        </Table>
        </TableContainer>
      ) : (
        <Box h="220px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: showGuild ? 56 : 12, bottom: 0, left: -6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} />
              <YAxis tickFormatter={formatCompact} tick={{ fontSize: 10, fill: axisColor }} width={48} tickLine={false} axisLine={false} />
              <Tooltip content={renderTooltip} cursor={{ stroke: axisColor, strokeDasharray: "3 3" }} />
              {showGuild && (
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                  formatter={(value) => (value === "all" ? t("pages.rotationDetail.historyAllPlayers") : t("pages.rotationDetail.historyGuildAverage"))}
                />
              )}
              <Line type="monotone" dataKey="all" stroke={colors.all} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls>
                {showGuild && <LabelList content={seriesEndLabel(t("pages.rotationDetail.historyAllPlayers"))} />}
              </Line>
              {showGuild && (
                <Line type="monotone" dataKey="guild" stroke={colors.guild} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls>
                  <LabelList content={seriesEndLabel(t("pages.rotationDetail.historyGuildAverage"))} />
                </Line>
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};
