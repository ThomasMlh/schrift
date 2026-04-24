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
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "whiteAlpha.800");
  const { t } = useTranslation();

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
              {t("components.comparatorCharts.radarHeadingGuilds")}
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
            bg={useColorModeValue("purple.50", "gray.700")}
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
