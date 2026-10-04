import {
  Box,
  Text,
  Skeleton,
  Flex,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useGuildScoreDistribution } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface GuildScoreDistributionProps {
  guildId: string;
  cycleId?: string;
}

const CLEAR_THRESHOLD_INDEX = 4; // index 4 = ≥617M = clear
const MISS_INDEX = 0;

export const GuildScoreDistribution = ({ guildId, cycleId }: GuildScoreDistributionProps) => {
  const { distribution, isLoading } = useGuildScoreDistribution(guildId, cycleId);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { t } = useTranslation();

  const bg = useColorModeValue("white", "rgba(26,32,44,0.7)");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const countColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const subText = useColorModeValue("gray.500", "whiteAlpha.600");
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const axisColor = isDark ? "#718096" : "#A0AEC0";

  const hasData = distribution.some(b => b.count > 0);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box bg={bg} p={2} borderRadius="md" boxShadow="md" borderWidth="1px" borderColor={border}>
        <Text fontSize="xs" fontWeight="semibold">{label}</Text>
        <Text fontSize="xs" color={subText}>{payload[0].value} score(s)</Text>
      </Box>
    );
  };

  return (
    <Box bg={bg} borderRadius="xl" borderWidth="1px" borderColor={border} p={4} boxShadow="sm">
      <Text
        fontSize="xs" fontWeight="semibold" textTransform="uppercase"
        letterSpacing="wider" color={countColor} mb={3}
      >
        {t("pages.guilds.distributionTitle")}
      </Text>

      {isLoading ? (
        <Skeleton h="160px" borderRadius="lg" />
      ) : !hasData ? (
        <Flex justify="center" align="center" h="120px">
          <Text fontSize="sm" color={subText}>{t("pages.guilds.distributionNoData")}</Text>
        </Flex>
      ) : (
        <Box h="160px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: axisColor }} interval={0} />
              <YAxis tick={{ fontSize: 9, fill: axisColor }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      index === MISS_INDEX
                        ? (isDark ? "#718096" : "#A0AEC0")
                        : index >= CLEAR_THRESHOLD_INDEX
                          ? (isDark ? "#68D391" : "#38A169")
                          : (isDark ? "#FC8181" : "#E53E3E")
                    }
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
      <Text fontSize="2xs" color={subText} mt={1}>
        🟢 ≥ 617M = clear &nbsp;·&nbsp; 🔴 &lt; 617M &nbsp;·&nbsp; ⚫ miss
      </Text>
    </Box>
  );
};
