import { Box, Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import type { IRotationHistoryCycle } from "@/interfaces";

// Checked for contrast and color blindness on the light (#FFFFFF) and dark (#171D2B) surfaces
const COLORS = {
  light: { best: "#6D4DFF", average: "#C97A06" },
  dark: { best: "#8B6CFF", average: "#C98418" },
};

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string; color?: string; payload?: { label: string } }>;
}

const compact = (value: number) => `${Math.round(value / 1_000_000)} M`;
const shortLabel = (c: IRotationHistoryCycle) => `C${c.cycle_name?.replace(/\D/g, "") ?? "?"}·${String(c.cycle_year ?? "").slice(2)}`;

// Best and average score of each passage; a click selects that passage
export const RotationEvolutionChart = ({
  cycles, selectedCycleId, onSelect,
}: { cycles: IRotationHistoryCycle[]; selectedCycleId: string | null; onSelect: (cycleId: string) => void }) => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const colors = COLORS[colorMode === "dark" ? "dark" : "light"];
  const axis = colorMode === "dark" ? "#8B93A7" : "#6B7388";
  const grid = colorMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const data = cycles
    .filter((c) => c.count > 0)
    .map((c) => ({ id: c.cycle_id, short: shortLabel(c), label: `${c.cycle_name} · ${c.cycle_year}`, best: c.best, average: c.average }));
  const selected = data.find((d) => d.id === selectedCycleId)?.short;

  if (data.length < 2) {
    return <Text fontSize="sm" color="text.muted">{t("pages.rotation.chartNotEnough")}</Text>;
  }

  const renderTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
      <Box bg="bg.card" p={2.5} borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor="border.subtle">
        <Text fontSize="xs" fontWeight="bold" mb={1} color="text.strong">{payload[0].payload?.label}</Text>
        {payload.map((p) => (
          <HStack key={String(p.dataKey)} spacing={2}>
            <Box w={2} h={2} borderRadius="full" bg={p.color} />
            <Text fontSize="xs" color="text.strong" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {t(p.dataKey === "best" ? "pages.rotation.chartBest" : "pages.rotation.chartAverage")} : {Number(p.value).toLocaleString(locale)}
            </Text>
          </HStack>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Flex gap={4} mb={2} fontSize="xs" color="text.muted">
        <HStack spacing={1.5}><Box w="14px" h="3px" borderRadius="full" bg={colors.best} /><Text>{t("pages.rotation.chartBest")}</Text></HStack>
        <HStack spacing={1.5}><Box w="14px" h="3px" borderRadius="full" bg={colors.average} /><Text>{t("pages.rotation.chartAverage")}</Text></HStack>
      </Flex>
      <Box h="200px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            onClick={(state) => {
              const index = Number(state?.activeTooltipIndex);
              if (Number.isInteger(index) && data[index]) onSelect(data[index].id);
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="short" tick={{ fontSize: 10, fill: axis }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={compact} tick={{ fontSize: 10, fill: axis }} tickLine={false} axisLine={false} width={48} domain={["auto", "auto"]} />
            {selected && <ReferenceLine x={selected} stroke={axis} strokeDasharray="3 3" />}
            <Tooltip content={renderTooltip} cursor={{ stroke: grid }} />
            <Line type="monotone" dataKey="average" stroke={colors.average} strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="best" stroke={colors.best} strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
