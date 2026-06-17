import {
  Box,
  Text,
  Skeleton,
  Flex,
  HStack,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGuildEvolution } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface GuildEvolutionProps {
  guildId: string;
}

const formatScore = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  return n.toLocaleString("fr-FR");
};

export const GuildEvolution = ({ guildId }: GuildEvolutionProps) => {
  const { evolution, isLoading } = useGuildEvolution(guildId, 6);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { t } = useTranslation();

  const bg = useColorModeValue("white", "rgba(26,32,44,0.7)");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const countColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const subText = useColorModeValue("gray.500", "whiteAlpha.600");
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const axisColor = isDark ? "#718096" : "#A0AEC0";

  const chartData = evolution.map(p => ({
    name: `${p.cycleName} ${p.cycleYear}`,
    avgScore: p.averageScore,
    clearRate: p.clearRate,
    totalScores: p.totalScores,
  }));

  const hasData = evolution.some(p => p.totalScores > 0);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box bg={bg} p={3} borderRadius="md" boxShadow="md" borderWidth="1px" borderColor={border}>
        <Text fontSize="xs" fontWeight="semibold" mb={1}>{label}</Text>
        {payload.map((p, i: number) => (
          <HStack key={i} spacing={2}>
            <Box w={2} h={2} borderRadius="full" bg={p.color} />
            <Text fontSize="xs" color={subText}>
              {p.name === "avgScore"
                ? `${t("pages.guilds.evolutionAvgScore")}: ${formatScore(p.value)}`
                : `${t("pages.guilds.evolutionClearRate")}: ${p.value}%`}
            </Text>
          </HStack>
        ))}
      </Box>
    );
  };

  return (
    <Box bg={bg} borderRadius="xl" borderWidth="1px" borderColor={border} p={4} boxShadow="sm">
      <Text
        fontSize="xs" fontWeight="semibold" textTransform="uppercase"
        letterSpacing="wider" color={countColor} mb={3}
      >
        {t("pages.guilds.evolutionTitle")}
      </Text>

      {isLoading ? (
        <Skeleton h="180px" borderRadius="lg" />
      ) : !hasData || evolution.length < 2 ? (
        <Flex justify="center" align="center" h="140px">
          <Text fontSize="sm" color={subText}>{t("pages.guilds.evolutionNoData")}</Text>
        </Flex>
      ) : (
        <Box h="180px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: axisColor }} />
              <YAxis
                yAxisId="score"
                tickFormatter={formatScore}
                tick={{ fontSize: 9, fill: axisColor }}
                width={45}
              />
              <YAxis
                yAxisId="rate"
                orientation="right"
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 9, fill: axisColor }}
                domain={[0, 100]}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                formatter={(value) =>
                  value === "avgScore"
                    ? t("pages.guilds.evolutionAvgScore")
                    : t("pages.guilds.evolutionClearRate")
                }
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="avgScore"
                stroke={isDark ? "#9F7AEA" : "#7C3AED"}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="clearRate"
                stroke={isDark ? "#68D391" : "#38A169"}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};
