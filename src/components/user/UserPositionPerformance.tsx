import {
  Box,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  Icon,
  Badge,
  useColorModeValue
} from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { IUserStats } from "@/hooks/useAPI";

interface UserPositionPerformanceProps {
  performanceByQuartile: NonNullable<IUserStats["performanceByQuartile"]>;
}

export const UserPositionPerformance = ({
  performanceByQuartile
}: UserPositionPerformanceProps) => {
  const cardBg = "bg.card";
  const radarColor = useColorModeValue("#3182CE", "#63B3ED");
  const tooltipBg = "bg.elevated";
  const tooltipBorder = "border.default";
  const { t } = useTranslation();

  if (performanceByQuartile.length < 2) return null;

  const maxScore = Math.max(...performanceByQuartile.map(q => q.averageScore));

  const chartData = performanceByQuartile.map(q => ({
    quartile: q.quartile,
    score: q.averageScore,
    pct: maxScore > 0 ? Math.round((q.averageScore / maxScore) * 100) : 0,
    count: q.count
  }));

  const best = [...performanceByQuartile].sort((a, b) => b.averageScore - a.averageScore)[0];
  const worst = [...performanceByQuartile].sort((a, b) => a.averageScore - b.averageScore)[0];
  const trend = best.quartile.startsWith("Q1") || best.quartile.startsWith("Q2") ? "début" : "fin";

  type ChartItem = { quartile: string; score: number; pct: number; count: number };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartItem }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <Box
          bg={tooltipBg}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={tooltipBorder}
          boxShadow="lg"
        >
          <Text fontWeight="bold" mb={1}>{d.quartile}</Text>
          <Text fontSize="sm" color="blue.500">
            {t("components.user.positionPerformance.tooltipAvg")} <strong>{(d.score / 1_000_000).toFixed(2)}M</strong>
          </Text>
          <Text fontSize="xs" color="gray.500">{d.count} {t("components.user.positionPerformance.rotShort")}</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="md">
      <CardBody>
        <HStack spacing={3} mb={2}>
          <Box
            p={2}
            borderRadius="lg"
            bg="purple.100"
            color="purple.600"
            _dark={{ bg: "purple.900", color: "purple.300" }}
          >
            <Icon as={FiClock} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="md">{t("components.user.positionPerformance.title")}</Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="green" fontSize="xs">
                {t("components.user.positionPerformance.labelBest")} {best.quartile}
              </Badge>
              <Badge colorScheme="red" fontSize="xs">
                {t("components.user.positionPerformance.labelWorst")} {worst.quartile}
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <Text fontSize="sm" color="gray.500" mb={4}>
          {t("components.user.positionPerformance.performsBetterIn", { period: trend })}
        </Text>

        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="quartile" tick={{ fontSize: 12 }} />
            <Radar
              name="Score moyen"
              dataKey="pct"
              stroke={radarColor}
              fill={radarColor}
              fillOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        <VStack spacing={1} mt={2} align="stretch">
          {performanceByQuartile.map(q => (
            <HStack key={q.quartile} justify="space-between" fontSize="sm">
              <Text color="gray.600" _dark={{ color: "gray.400" }}>{q.quartile}</Text>
              <HStack spacing={3}>
                <Text fontSize="xs" color="gray.500">{q.count} {t("components.user.positionPerformance.rotShort")}</Text>
                <Text fontWeight="semibold">{(q.averageScore / 1_000_000).toFixed(2)}M</Text>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};
