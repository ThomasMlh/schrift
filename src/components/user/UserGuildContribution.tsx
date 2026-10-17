import {
  Box,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Badge,
  Skeleton,
  Divider,
} from "@chakra-ui/react";
import { FiUsers, FiInfo } from "react-icons/fi";
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
  Cell,
} from "recharts";
import type { IUserStats } from "@/hooks/useAPI";

interface UserGuildContributionProps {
  historicalContribution: NonNullable<IUserStats["guildContribution"]>;
  cycleContribution?: NonNullable<IUserStats["guildContribution"]> | null;
  cycleContributionLoading?: boolean;
  hasSelectedCycle: boolean;
  selectedCycleId?: string;
  selectedCycleName?: string;
  guildName?: string;
  temporalEvolution?: IUserStats["temporalEvolution"];
}

export const UserGuildContribution = ({
  historicalContribution,
  cycleContribution,
  cycleContributionLoading,
  hasSelectedCycle,
  selectedCycleId,
  selectedCycleName,
  guildName,
  temporalEvolution,
}: UserGuildContributionProps) => {
  const cardBg = "bg.card";
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");
  const textColor = useColorModeValue("#2D3748", "#E2E8F0");
  const tooltipBg = "bg.elevated";
  const tooltipBorder = "border.default";
  const mutedColor = "text.muted";
  const cycleBg = useColorModeValue("blue.50", "rgba(49,130,206,0.1)");
  const noteColor = useColorModeValue("gray.400", "gray.600");
  const { t } = useTranslation();

  const cycleNameMap: Record<string, string> = {};
  temporalEvolution?.forEach((c) => { cycleNameMap[c.cycle_id] = c.cycle_name; });

  const chartData = historicalContribution.byCycle.map((c) => ({
    name: cycleNameMap[c.cycle_id] ?? "Cycle",
    cycle_id: c.cycle_id,
    pct: c.contributionPct,
    userTotal: c.userTotal,
    guildTotal: c.guildTotal,
  }));

  const avg = historicalContribution.averagePct;

  const cycleStat = cycleContribution?.byCycle[0] ?? null;
  const cycleInDifferentGuild = hasSelectedCycle && !cycleContributionLoading && cycleContribution !== undefined && cycleStat === null;
  const cyclePct = cycleStat?.contributionPct;
  const cycleColor = cyclePct !== undefined
    ? cyclePct >= avg ? "#38A169" : cyclePct >= avg * 0.7 ? "#3182CE" : "#DD6B20"
    : "#718096";

  type ChartItem = { name: string; cycle_id: string; pct: number; userTotal: number; guildTotal: number };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartItem }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <Box bg={tooltipBg} p={3} borderRadius="md" border="1px solid" borderColor={tooltipBorder} boxShadow="lg">
        <Text fontWeight="bold" mb={1} fontSize="sm">{d.name}</Text>
        <Text fontSize="sm" color="blue.500">
          {t("components.user.guildContribution.labelContribution")} <strong>{d.pct}%</strong>
        </Text>
        <Text fontSize="xs" color="gray.500">
          {(d.userTotal / 1_000_000_000).toFixed(2)}B / {(d.guildTotal / 1_000_000_000).toFixed(2)}B {t("components.user.guildContribution.labelGuildTotal")}
        </Text>
      </Box>
    );
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
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiUsers} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize="md">
                {t("components.user.guildContribution.title")}
              </Text>
              {guildName && <Text fontSize="sm" color={mutedColor}>— {guildName}</Text>}
            </HStack>
            <Text fontSize="xs" color={mutedColor}>
              {t("components.user.guildContribution.subtitle")}
            </Text>
          </VStack>
        </HStack>

        <Box
          mb={5}
          p={4}
          borderRadius="xl"
          bg={cycleBg}
          border="1px solid"
          borderColor={useColorModeValue("blue.100", "blue.800")}
        >
          {!hasSelectedCycle ? (
            <Text fontSize="sm" color={mutedColor} textAlign="center" py={1}>
              {t("components.user.guildContribution.selectCycleHint")}
            </Text>
          ) : cycleContributionLoading ? (
            <HStack spacing={4}>
              <Skeleton h="44px" w="110px" borderRadius="md" />
              <Skeleton h="44px" w="90px" borderRadius="md" />
              <Skeleton h="44px" w="90px" borderRadius="md" />
            </HStack>
          ) : cycleInDifferentGuild ? (
            <HStack spacing={2}>
              <Badge colorScheme="orange" variant="subtle" fontSize="xs" px={2} py={1} borderRadius="full">
                {t("components.user.guildContribution.differentGuild")}
              </Badge>
              <Text fontSize="xs" color={mutedColor}>
                {t("components.user.guildContribution.differentGuildNote", { cycle: selectedCycleName ?? "" })}
              </Text>
            </HStack>
          ) : cycleStat ? (
            <HStack spacing={0} divider={<Divider orientation="vertical" h="40px" />} flexWrap="wrap" gap={3}>
              <VStack align="start" spacing={0} minW="110px" pr={4}>
                <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedColor}>
                  {selectedCycleName ?? t("components.user.guildContribution.selectedCycle")}
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color={cycleColor} lineHeight="1.1">
                  {cycleStat.contributionPct}%
                </Text>
              </VStack>
              <VStack align="start" spacing={0} px={4}>
                <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedColor}>
                  {t("components.user.guildContribution.myTotal")}
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                  {(cycleStat.userTotal / 1_000_000_000).toFixed(2)}B
                </Text>
              </VStack>
              <VStack align="start" spacing={0} pl={4}>
                <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedColor}>
                  {t("components.user.guildContribution.guildTotal")}
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                  {(cycleStat.guildTotal / 1_000_000_000).toFixed(2)}B
                </Text>
              </VStack>
            </HStack>
          ) : null}
        </Box>

        {chartData.length >= 2 && (
          <>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedColor} mb={3}>
              {t("components.user.guildContribution.historicalHeading")}
            </Text>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={11} />
                <YAxis stroke={textColor} fontSize={11} unit="%" domain={[0, "auto"]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={avg}
                  stroke="#9F7AEA"
                  strokeDasharray="4 4"
                  label={{ value: `moy. ${avg}%`, fill: "#9F7AEA", fontSize: 11 }}
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => {
                    const isSelected = entry.cycle_id === selectedCycleId;
                    const base = entry.pct >= avg ? "#38A169" : "#E53E3E";
                    return (
                      <Cell
                        key={i}
                        fill={isSelected ? "#9F7AEA" : base}
                        opacity={isSelected ? 1 : 0.75}
                        stroke={isSelected ? "#7C3AED" : undefined}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        <HStack spacing={1.5} mt={4} pt={3} borderTop="1px solid" borderColor="bg.inset">
          <Icon as={FiInfo} boxSize={3} color={noteColor} flexShrink={0} />
          <Text fontSize="2xs" color={noteColor}>
            {t("components.user.guildContribution.note")}
          </Text>
        </HStack>
      </CardBody>
    </Card>
  );
};
