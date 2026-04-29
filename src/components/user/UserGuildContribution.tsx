import {
  Box,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  Icon,
  Tooltip,
  useColorModeValue
} from "@chakra-ui/react";
import { FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import type { IUserStats } from "@/hooks/useAPI";

interface UserGuildContributionProps {
  guildContribution: NonNullable<IUserStats["guildContribution"]>;
  guildName?: string;
  temporalEvolution?: IUserStats["temporalEvolution"];
}

export const UserGuildContribution = ({
  guildContribution,
  guildName,
  temporalEvolution
}: UserGuildContributionProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");
  const textColor = useColorModeValue("#2D3748", "#E2E8F0");
  const tooltipBg = useColorModeValue("#FFFFFF", "#2D3748");
  const tooltipBorder = useColorModeValue("#E2E8F0", "#4A5568");
  const { t } = useTranslation();

  // Construire les données avec le nom du cycle si disponible
  const cycleNameMap: Record<string, string> = {};
  temporalEvolution?.forEach(c => { cycleNameMap[c.cycle_id] = c.cycle_name; });

  const chartData = guildContribution.byCycle.map(c => ({
    name: cycleNameMap[c.cycle_id] ?? "Cycle",
    pct: c.contributionPct,
    userTotal: c.userTotal,
    guildTotal: c.guildTotal
  }));

  const avg = guildContribution.averagePct;
  const color = avg >= 10 ? "#38A169" : avg >= 5 ? "#3182CE" : "#DD6B20";

  const CustomTooltip = ({ active, payload }: any) => {
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
          <Text fontWeight="bold" mb={1}>{d.name}</Text>
          <Text fontSize="sm" color="blue.500">
            {t("components.user.guildContribution.labelContribution")} <strong>{d.pct}%</strong>
          </Text>
          <Text fontSize="xs" color="gray.500">
            {(d.userTotal / 1_000_000_000).toFixed(2)}B / {(d.guildTotal / 1_000_000_000).toFixed(2)}B {t("components.user.guildContribution.labelGuildTotal")}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="md">
      <CardBody>
        <HStack spacing={3} mb={4}>
          <Box
            p={2}
            borderRadius="lg"
            bg="blue.100"
            color="blue.600"
            _dark={{ bg: "blue.900", color: "blue.300" }}
          >
            <Icon as={FiUsers} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize="md">
                {t("components.user.guildContribution.title")}
              </Text>
              {guildName && (
                <Text fontSize="sm" color="gray.500">— {guildName}</Text>
              )}
            </HStack>
            <Tooltip
              label={t("components.user.guildContribution.tooltip")}
              placement="top"
              hasArrow
            >
              <HStack spacing={1} cursor="help">
                <Text fontSize="2xl" fontWeight="bold" color={color}>
                  {avg}%
                </Text>
                <Text fontSize="sm" color="gray.500">{t("components.user.guildContribution.labelAvgPerCycle")}</Text>
              </HStack>
            </Tooltip>
          </VStack>
        </HStack>

        {chartData.length >= 2 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} fontSize={11} />
              <YAxis stroke={textColor} fontSize={11} unit="%" domain={[0, 'auto']} />
              <RechartsTooltip content={<CustomTooltip />} />
              <ReferenceLine y={avg} stroke={color} strokeDasharray="4 4" label={{ value: t("components.user.guildContribution.chartAvg", { avg }), fill: color, fontSize: 11 }} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pct >= avg ? "#38A169" : "#E53E3E"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
};
