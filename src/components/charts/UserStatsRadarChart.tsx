import { Box, useColorModeValue } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface UserStatsRadarChartProps {
  rotations: {
    rotation_killer: string;
    rotation_attack: string;
    averageScore: number;
    scoreCount: number;
  }[];
}

export const UserStatsRadarChart = ({
  rotations
}: UserStatsRadarChartProps) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("#4a5568", "#cbd5e0");
  const gridColor = useColorModeValue("#f0f0f0", "#2d3748");

  // Prendre toutes les rotations triées par score décroissant
  const sortedRotations = [...rotations]
    .sort((a, b) => b.averageScore - a.averageScore);

  // Calculer le pourcentage par rapport au meilleur score
  const maxScore = sortedRotations[0]?.averageScore || 1;

  const data = sortedRotations.map((rotation) => ({
    name: rotation.rotation_killer,
    performance: Math.round((rotation.averageScore / maxScore) * 100),
    actualScore: rotation.averageScore,
    attack: rotation.rotation_attack
  }));

  // Couleurs par type d'attaque
  const getColorByAttack = (attack: string) => {
    switch (attack) {
      case "B":
        return "#4299E1"; // Bleu
      case "R":
        return "#F56565"; // Rouge
      default:
        return "#9F7AEA"; // Violet
    }
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: Record<string, unknown> }> }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={bgColor}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="lg"
        >
          <Box fontWeight="bold" mb={1}>
            {payload[0].payload.name}
          </Box>
          <Box fontSize="sm" color={textColor}>
            Score: {Math.round(payload[0].payload.actualScore).toLocaleString()}
          </Box>
          <Box fontSize="sm" color={textColor}>
            Performance: {payload[0].value}%
          </Box>
          <Box fontSize="sm" color={textColor} mt={1}>
            Type: {payload[0].payload.attack}
          </Box>
        </Box>
      );
    }
    return null;
  };

  if (sortedRotations.length === 0) {
    return null;
  }

  const chartHeight = Math.max(400, sortedRotations.length * 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
        <XAxis
          type="number"
          domain={[0, 100]}
          stroke={textColor}
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke={textColor}
          style={{ fontSize: "12px" }}
          width={110}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="performance" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColorByAttack(entry.attack)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
