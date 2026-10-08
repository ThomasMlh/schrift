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
  Tooltip
} from "recharts";
import type { IGuildStats } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface GuildComparisonRadarProps {
  guildsData: Array<{
    name: string;
    stats: IGuildStats | null;
    color: string;
  }>;
}

export const GuildComparisonRadar = ({
  guildsData
}: GuildComparisonRadarProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const textColor = useColorModeValue("#2D3748", "#E2E8F0");
  const haloColor = useColorModeValue("rgba(255,255,255,0.9)", "rgba(26,32,44,0.85)");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const { t } = useTranslation();

  const CustomAxisTick = ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
    <g>
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        stroke={haloColor}
        strokeWidth={5}
        strokeLinejoin="round"
        fontSize={12}
        fontWeight="600"
        paintOrder="stroke"
      >
        {payload.value}
      </text>
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={12}
        fontWeight="600"
      >
        {payload.value}
      </text>
    </g>
  );

  // Normaliser les données pour le radar (échelle 0-100)
  const normalizeValue = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  };

  // Trouver les valeurs max pour normalisation
  const maxValues = {
    averageScore: Math.max(
      1,
      ...guildsData
        .filter((g) => g.stats)
        .map((g) => g.stats!.averageScore || 0)
    ),
    totalMembers: Math.max(
      1,
      ...guildsData
        .filter((g) => g.stats)
        .map((g) => g.stats!.totalMembers || 0)
    ),
    totalScores: Math.max(
      1,
      ...guildsData
        .filter((g) => g.stats)
        .map((g) => g.stats!.totalScores || 0)
    ),
    bestScore: Math.max(
      1,
      ...guildsData
        .filter((g) => g.stats)
        .map((g) => g.stats!.bestScore || 0)
    )
  };

  // Préparer les données pour le radar
  const radarData = [
    {
      metric: t("components.comparatorCharts.radarAvg"),
      ...Object.fromEntries(
        guildsData.map((g) => [
          g.name,
          g.stats && g.stats.averageScore
            ? normalizeValue(g.stats.averageScore, maxValues.averageScore)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarBest"),
      ...Object.fromEntries(
        guildsData.map((g) => [
          g.name,
          g.stats && g.stats.bestScore
            ? normalizeValue(g.stats.bestScore, maxValues.bestScore)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarMembers"),
      ...Object.fromEntries(
        guildsData.map((g) => [
          g.name,
          g.stats && g.stats.totalMembers
            ? normalizeValue(g.stats.totalMembers, maxValues.totalMembers)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarParticipation"),
      ...Object.fromEntries(
        guildsData.map((g) => [
          g.name,
          g.stats && g.stats.totalScores
            ? normalizeValue(g.stats.totalScores, maxValues.totalScores)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarTotalPoints"),
      ...Object.fromEntries(
        guildsData.map((g) => [
          g.name,
          g.stats && g.stats.totalPoints && maxValues.totalScores > 0
            ? normalizeValue(g.stats.totalPoints, maxValues.totalScores * maxValues.averageScore)
            : 0
        ])
      ),
      fullMark: 100
    }
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string; payload: { metric: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={bgColor}
          p={3}
          borderRadius="xl"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontWeight="bold" fontSize="sm" mb={2}>
            {payload[0].payload.metric}
          </Text>
          {payload.map((entry, index: number) => (
            <HStack key={index} spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg={entry.color} />
              <Text fontSize="xs" color={textColor}>
                {entry.name}: {Math.round(entry.value)}%
              </Text>
            </HStack>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={5}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
              {t("components.comparatorCharts.radarHeadingGuilds")}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {t("components.comparatorCharts.radarScale")}
            </Text>
          </HStack>

          <Box w="100%" h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={gridColor} strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={(props: { x: string | number; y: string | number; payload: { value: string } }) => <CustomAxisTick x={Number(props.x)} y={Number(props.y)} payload={props.payload} />}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: textColor, fontSize: 10 }} />
                {guildsData.map((guild, index) => (
                  <Radar
                    key={index}
                    name={guild.name}
                    dataKey={guild.name}
                    stroke={guild.color}
                    fill={guild.color}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>

          <Box
            p={3}
            borderRadius="lg"
            bg={isDark ? "rgba(159,122,234,0.08)" : "purple.50"}
          >
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              💡 <Text as="span" fontWeight="semibold">{t("components.comparatorCharts.radarTip")}</Text> {t("components.comparatorCharts.radarTipText")}
            </Text>
          </Box>
        </VStack>
    </Box>
  );
};
