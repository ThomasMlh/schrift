import {
  Box,
  Card,
  CardBody,
  Text,
  HStack,
  VStack,
  useColorModeValue
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
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");
  const { t } = useTranslation();


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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={cardBg}
          p={3}
          borderRadius="md"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Text fontWeight="bold" fontSize="sm" mb={2}>
            {payload[0].payload.metric}
          </Text>
          {payload.map((entry: any, index: number) => (
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
    <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
      <CardBody>
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
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: textColor, fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
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
            bg={useColorModeValue("blue.50", "gray.700")}
          >
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              💡 <Text as="span" fontWeight="semibold">{t("components.comparatorCharts.radarTip")}</Text> {t("components.comparatorCharts.radarTipText")}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
