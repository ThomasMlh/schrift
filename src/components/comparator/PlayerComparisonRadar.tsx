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
import type { IUserStats } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface PlayerComparisonRadarProps {
  playersData: Array<{
    name: string;
    stats: IUserStats | null;
    color: string;
  }>;
}

export const PlayerComparisonRadar = ({
  playersData
}: PlayerComparisonRadarProps) => {
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
      1, // Minimum 1 pour éviter division par zéro
      ...playersData
        .filter((p) => p.stats)
        .map((p) => p.stats!.averageScore || 0)
    ),
    totalScores: Math.max(
      1,
      ...playersData.filter((p) => p.stats).map((p) => p.stats!.totalScores || 0)
    ),
    bestScore: Math.max(
      1,
      ...playersData
        .filter((p) => p.stats)
        .map((p) => p.stats!.bestScore?.score || 0)
    ),
    consistency: 100 // Pour le taux de participation (sera 100 - missRate)
  };

  // Préparer les données pour le radar
  const radarData = [
    {
      metric: t("components.comparatorCharts.radarAvg"),
      ...Object.fromEntries(
        playersData.map((p) => [
          p.name,
          p.stats && p.stats.averageScore
            ? normalizeValue(p.stats.averageScore, maxValues.averageScore)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarBest"),
      ...Object.fromEntries(
        playersData.map((p) => [
          p.name,
          p.stats && p.stats.bestScore
            ? normalizeValue(p.stats.bestScore.score, maxValues.bestScore)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarParticipation"),
      ...Object.fromEntries(
        playersData.map((p) => [
          p.name,
          p.stats && p.stats.totalScores
            ? normalizeValue(p.stats.totalScores, maxValues.totalScores)
            : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarRegularity"),
      ...Object.fromEntries(
        playersData.map((p) => [
          p.name,
          p.stats && typeof p.stats.missRate === 'number' ? 100 - p.stats.missRate : 0
        ])
      ),
      fullMark: 100
    },
    {
      metric: t("components.comparatorCharts.radarTotalPoints"),
      ...Object.fromEntries(
        playersData.map((p) => [
          p.name,
          p.stats && p.stats.totalPoints && maxValues.totalScores > 0
            ? normalizeValue(p.stats.totalPoints, maxValues.totalScores * maxValues.averageScore)
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
              {t("components.comparatorCharts.radarHeadingPlayers")}
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
                {playersData.map((player, index) => (
                  <Radar
                    key={index}
                    name={player.name}
                    dataKey={player.name}
                    stroke={player.color}
                    fill={player.color}
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
            bg={isDark ? "rgba(49,130,206,0.08)" : "blue.50"}
          >
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              💡 <Text as="span" fontWeight="semibold">{t("components.comparatorCharts.radarTip")}</Text> {t("components.comparatorCharts.radarTipText")}
            </Text>
          </Box>
        </VStack>
    </Box>
  );
};
