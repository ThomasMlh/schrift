import {
  VStack,
  Heading,
  Text,
  Box,
  useColorModeValue,
  HStack,
  Button
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { CustomSelect } from "../ui/CustomSelect";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import type { IUserStats } from "@/hooks/useAPI";

interface UserTemporalEvolutionProps {
  stats: IUserStats;
}

export const UserTemporalEvolution = ({ stats }: UserTemporalEvolutionProps) => {
  const lineColor = useColorModeValue("#3182CE", "#63B3ED");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");
  const textColor = useColorModeValue("#2D3748", "#E2E8F0");
  const tooltipBg = useColorModeValue("#FFFFFF", "#2D3748");
  const tooltipBorder = useColorModeValue("#E2E8F0", "#4A5568");

  // État pour le filtre d'année
  const [selectedYear, setSelectedYear] = useState<string>("all");

  if (!stats.temporalEvolution || stats.temporalEvolution.length === 0) {
    return (
      <VStack spacing={4} align="stretch">
        <Heading size="md">Évolution Temporelle</Heading>
        <Text fontSize="sm" color="gray.500" textAlign="center" py={10}>
          Aucune donnée d'évolution disponible
        </Text>
      </VStack>
    );
  }

  // Extraire les années disponibles
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    stats.temporalEvolution?.forEach((item) => {
      if (item.year) {
        years.add(item.year);
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [stats.temporalEvolution]);

  // Filtrer les données par année (déjà triées chronologiquement depuis le backend)
  const filteredData = useMemo(() => {
    if (selectedYear === "all") {
      return stats.temporalEvolution || [];
    }
    return (stats.temporalEvolution || []).filter(
      (item) => item.year === parseInt(selectedYear)
    );
  }, [stats.temporalEvolution, selectedYear]);

  // Formater les données pour le graphique
  const chartData = filteredData.map((item) => ({
    name: selectedYear === "all" && item.year 
      ? `${item.cycle_name} (${item.year})`
      : item.cycle_name,
    score: Math.round(item.averageScore / 1000000), // Convertir en millions
    scoreCount: item.scoreCount,
    year: item.year,
    cycleName: item.cycle_name // Garder le nom original pour le tooltip
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={tooltipBg}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={tooltipBorder}
          boxShadow="lg"
        >
          <Text fontWeight="bold" mb={1}>
            {payload[0].payload.cycleName || payload[0].payload.name}
          </Text>
          {payload[0].payload.year && (
            <Text color="purple.500" fontSize="xs" mb={1}>
              Année {payload[0].payload.year}
            </Text>
          )}
          <Text color="blue.500" fontSize="sm">
            Score moyen: {payload[0].value}M
          </Text>
          <Text color="gray.500" fontSize="xs">
            {payload[0].payload.scoreCount} rotation
            {payload[0].payload.scoreCount > 1 ? "s" : ""}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center" flexWrap="wrap">
        <Box>
          <Heading size="md">Évolution Temporelle</Heading>
          <Text fontSize="sm" color="gray.500">
            Progression de votre score moyen par cycle (du plus ancien au plus récent)
          </Text>
        </Box>

        {availableYears.length > 1 && (
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Filtrer par année :
            </Text>
            <CustomSelect
              size="sm"
              maxW="150px"
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              options={[
                { value: "all", label: "Toutes les années" },
                ...availableYears.map((year) => ({
                  value: year.toString(),
                  label: year.toString(),
                })),
              ]}
              allowDeselect={false}
            />
            {selectedYear !== "all" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedYear("all")}
                colorScheme="blue"
              >
                Réinitialiser
              </Button>
            )}
          </HStack>
        )}
      </HStack>
      
      {chartData.length === 0 ? (
        <Box py={10} textAlign="center">
          <Text color="gray.500">
            Aucune donnée disponible pour la période sélectionnée
          </Text>
        </Box>
      ) : (
        <Box w="full">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="name"
              stroke={textColor}
              angle={0}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis
              stroke={textColor}
              label={{
                value: "Score (M)",
                angle: -90,
                position: "insideLeft",
                style: { fill: textColor }
              }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, r: 5 }}
              activeDot={{ r: 8 }}
              name="Score moyen (M)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      )}

      {filteredData.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontSize="xs" color="gray.400" fontStyle="italic">
            💡 Ce graphique montre l'évolution de votre score moyen au fil des
            cycles, du plus ancien au plus récent. Une tendance à la hausse indique une progression constante !
            {selectedYear === "all" && " L'année est affichée entre parenthèses."}
          </Text>
          {filteredData.length > 0 && (
            <Text fontSize="xs" color="blue.500" fontWeight="medium">
              📊 {filteredData.length} cycle{filteredData.length > 1 ? "s" : ""} affiché{filteredData.length > 1 ? "s" : ""}
              {selectedYear !== "all" && ` pour l'année ${selectedYear}`}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};
