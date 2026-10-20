import {
  VStack,
  Heading,
  Text,
  Box,
  useColorModeValue,
  HStack,
  Button,
  ButtonGroup,
  Skeleton
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomSelect } from "../ui/CustomSelect";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { usePlayerMonthlyAverages } from "@/hooks/useAPI";
import type { IUserStats } from "@/hooks/useAPI";

type TemporalEvolution = NonNullable<IUserStats["temporalEvolution"]>;
type View = "cycle" | "month";

interface UserTemporalEvolutionProps {
  temporalEvolution: TemporalEvolution;
  // bbs account shown on the page, for the monthly view
  bbsId?: string;
}

// One chart point, whatever the view
interface EvolutionPoint {
  name: string;
  title: string;
  detail?: string;
  year?: number;
  averageScore: number;
  scoreCount: number;
}

export const UserTemporalEvolution = ({ temporalEvolution, bbsId }: UserTemporalEvolutionProps) => {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<View>("cycle");
  const { months, isLoading: monthsLoading } = usePlayerMonthlyAverages(bbsId, view === "month");
  const lineColor = useColorModeValue("#3182CE", "#63B3ED");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");
  const textColor = useColorModeValue("#2D3748", "#E2E8F0");
  const tooltipBg = "bg.elevated";
  const tooltipBorder = "border.default";

  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Both views share the same shape (data is already sorted chronologically by the API)
  const points = useMemo<EvolutionPoint[]>(() => {
    if (view === "month") {
      return months.map((m) => {
        const [year, month] = m.key.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        return {
          name: date.toLocaleDateString(i18n.language, { month: "short", year: "2-digit" }),
          title: date.toLocaleDateString(i18n.language, { month: "long", year: "numeric" }),
          detail: `${m.start_date} → ${m.end_date}${m.in_progress ? ` (${t("components.user.temporalEvolution.inProgress")})` : ""}`,
          year,
          averageScore: m.averageScore,
          scoreCount: m.scoreCount,
        };
      });
    }
    return (temporalEvolution ?? []).map((item) => ({
      name: selectedYear === "all" && item.year ? `${item.cycle_name} (${item.year})` : item.cycle_name,
      title: item.cycle_name,
      detail: item.year ? `${t("components.user.temporalEvolution.tooltipYear")} ${item.year}` : undefined,
      year: item.year,
      averageScore: item.averageScore,
      scoreCount: item.scoreCount,
    }));
  }, [view, months, temporalEvolution, selectedYear, i18n.language, t]);

  const availableYears = useMemo(
    () => [...new Set(points.map((p) => p.year).filter((y): y is number => !!y))].sort((a, b) => a - b),
    [points]
  );

  const filteredData = useMemo(
    () => (selectedYear === "all" ? points : points.filter((p) => p.year === parseInt(selectedYear))),
    [points, selectedYear]
  );

  const viewSwitch = (
    <ButtonGroup size="xs" isAttached variant="outline">
      {(["cycle", "month"] as View[]).map((v) => (
        <Button
          key={v}
          colorScheme={view === v ? "purple" : "gray"}
          variant={view === v ? "solid" : "outline"}
          aria-pressed={view === v}
          onClick={() => { setView(v); setSelectedYear("all"); }}
        >
          {t(v === "cycle" ? "components.user.temporalEvolution.viewByCycle" : "components.user.temporalEvolution.viewByMonth")}
        </Button>
      ))}
    </ButtonGroup>
  );

  if (view === "month" && monthsLoading) return <Skeleton h="400px" borderRadius="xl" />;

  if (points.length === 0) {
    return (
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" flexWrap="wrap">
          <Heading size="md">{t("components.user.temporalEvolution.heading")}</Heading>
          {bbsId && viewSwitch}
        </HStack>
        <Text fontSize="sm" color="gray.500" textAlign="center" py={10}>
          {t("components.user.temporalEvolution.noData")}
        </Text>
      </VStack>
    );
  }

  const chartData = filteredData.map((item) => ({
    name: item.name,
    score: Math.round(item.averageScore / 1000000), // In millions
    scoreCount: item.scoreCount,
    title: item.title,
    detail: item.detail,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { title?: string; detail?: string; scoreCount?: number }; value: number; name: string }> }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={tooltipBg}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={tooltipBorder}
          boxShadow="lg"
        >
          <Text fontWeight="bold" mb={1} textTransform="capitalize">
            {payload[0].payload.title}
          </Text>
          {payload[0].payload.detail && (
            <Text color="purple.500" fontSize="xs" mb={1}>
              {payload[0].payload.detail}
            </Text>
          )}
          <Text color="blue.500" fontSize="sm">
            {t("components.user.temporalEvolution.tooltipAvgScore")} {payload[0].value}M
          </Text>
          <Text color="gray.500" fontSize="xs">
            {payload[0].payload.scoreCount ?? 0} rotation
            {(payload[0].payload.scoreCount ?? 0) > 1 ? "s" : ""}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center" flexWrap="wrap">
        <Box>
          <Heading size="md">{t("components.user.temporalEvolution.heading")}</Heading>
          <Text fontSize="sm" color="gray.500">
            {t(view === "month" ? "components.user.temporalEvolution.subtitleMonthly" : "components.user.temporalEvolution.subtitle")}
          </Text>
        </Box>

        {bbsId && viewSwitch}

        {availableYears.length > 1 && (
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              {t("components.user.temporalEvolution.filterByYear")}
            </Text>
            <CustomSelect
              size="sm"
              maxW="150px"
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              options={[
                { value: "all", label: t("components.user.temporalEvolution.allYears") },
                ...availableYears.map((year) => ({
                  value: year.toString(),
                  label: year.toString(),
                })),
              ]}
              allowDeselect={false}
            />
            {selectedYear !== "all" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedYear("all")}
                colorScheme="blue"
              >
                {t("components.user.temporalEvolution.reset")}
              </Button>
            )}
          </HStack>
        )}
      </HStack>
      
      {chartData.length === 0 ? (
        <Box py={10} textAlign="center">
          <Text color="gray.500">
            {t("components.user.temporalEvolution.noDataForPeriod")}
          </Text>
        </Box>
      ) : (
        <Box w="full">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="name"
              stroke={textColor}
              angle={0}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis
              stroke={textColor}
              label={{
                value: t("components.user.temporalEvolution.yAxisLabel"),
                angle: -90,
                position: "insideLeft",
                style: { fill: textColor }
              }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, r: 5 }}
              activeDot={{ r: 8 }}
            name={t("components.user.temporalEvolution.lineName")}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      )}

      {filteredData.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontSize="xs" color="gray.400" fontStyle="italic">
            {view === "month"
              ? t("components.user.temporalEvolution.evolutionNoteMonthly")
              : t("components.user.temporalEvolution.evolutionNote")}
            {view === "cycle" && selectedYear === "all" && ` ${t("components.user.temporalEvolution.yearNote")}`}
          </Text>
          {filteredData.length > 0 && (
            <Text fontSize="xs" color="blue.500" fontWeight="medium">
              {t(view === "month" ? "components.user.temporalEvolution.monthsDisplayed" : "components.user.temporalEvolution.cyclesDisplayed", { count: filteredData.length })}
              {selectedYear !== "all" && ` ${t("components.user.temporalEvolution.forYear", { year: selectedYear })}`}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};
