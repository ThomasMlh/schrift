import {
  Box,
  Text,
  HStack,
  VStack,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

export interface RadarMetricDef {
  key: string;
  label: string;
  getRawValue: (stats: Record<string, unknown>) => number;
  absolute?: boolean; // already 0-100, skip normalization
}

export interface RadarEntityDef {
  name: string;
  color: string;
  stats: Record<string, unknown>;
}

interface ComparisonRadarChartProps {
  entities: RadarEntityDef[];
  metrics: RadarMetricDef[];
  heading: string;
}

export const ComparisonRadarChart = ({
  entities,
  metrics,
  heading,
}: ComparisonRadarChartProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const textColor = useColorModeValue("#2D3748", "#E2E8F0");
  const haloColor = useColorModeValue("rgba(255,255,255,0.9)", "rgba(26,32,44,0.85)");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const { t } = useTranslation();

  const maxValues: Record<string, number> = {};
  for (const metric of metrics) {
    if (!metric.absolute) {
      maxValues[metric.key] = Math.max(
        1,
        ...entities.filter((e) => e.stats).map((e) => metric.getRawValue(e.stats))
      );
    }
  }

  const radarData = metrics.map((metric) => ({
    metric: metric.label,
    ...Object.fromEntries(
      entities.map((e) => [
        e.name,
        e.stats
          ? metric.absolute
            ? Math.min(metric.getRawValue(e.stats), 100)
            : Math.min((metric.getRawValue(e.stats) / maxValues[metric.key]) * 100, 100)
          : 0,
      ])
    ),
    fullMark: 100,
  }));

  const CustomAxisTick = ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
    <g>
      <text
        x={x} y={y} textAnchor="middle" dominantBaseline="central"
        stroke={haloColor} strokeWidth={5} strokeLinejoin="round"
        fontSize={12} fontWeight="600" paintOrder="stroke"
      >
        {payload.value}
      </text>
      <text
        x={x} y={y} textAnchor="middle" dominantBaseline="central"
        fill={textColor} fontSize={12} fontWeight="600"
      >
        {payload.value}
      </text>
    </g>
  );

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string; payload: { metric: string } }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box bg={bgColor} p={3} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor={borderColor}>
        <Text fontWeight="bold" fontSize="sm" mb={2}>{payload[0].payload.metric}</Text>
        {payload.map((entry, i: number) => (
          <HStack key={i} spacing={2}>
            <Box w={3} h={3} borderRadius="full" bg={entry.color} />
            <Text fontSize="xs" color={textColor}>{entry.name}: {Math.round(entry.value)}%</Text>
          </HStack>
        ))}
      </Box>
    );
  };

  return (
    <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={5} h="100%" display="flex" flexDirection="column">
      <VStack spacing={4} align="stretch" flex={1}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color="text.strong">{heading}</Text>
          <Text fontSize="xs" color="text.muted">{t("components.comparatorCharts.radarScale")}</Text>
        </HStack>
        <Box w="100%" flex={1} minH="400px">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke={gridColor} strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="metric" tick={(props: { x: string | number; y: string | number; payload: { value: string } }) => <CustomAxisTick x={Number(props.x)} y={Number(props.y)} payload={props.payload} />} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: textColor, fontSize: 10 }} />
              {entities.map((entity, i) => (
                <Radar
                  key={i}
                  name={entity.name}
                  dataKey={entity.name}
                  stroke={entity.color}
                  fill={entity.color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
        <Text fontSize="xs" color="text.muted">
          {t("components.comparatorCharts.radarTip")} {t("components.comparatorCharts.radarTipText")}
        </Text>
      </VStack>
    </Box>
  );
};
