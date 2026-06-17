import { Box, useColorModeValue, useBreakpointValue, Flex } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";

interface UserRotationsChartProps {
  rotations: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
    averageScore: number;
    scoreCount: number;
  }[];
  showAll?: boolean;
}

export const UserRotationsChart = ({ rotations, showAll = false }: UserRotationsChartProps) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const gridColor = useColorModeValue("#f0f0f0", "#2d3748");
  const textColor = useColorModeValue("#4a5568", "#cbd5e0");
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false }, { fallback: 'md' });
  const fontSize = isMobile ? "10px" : "12px";
  const labelFontSize = isMobile ? "9px" : "11px";

  const mobileMargin = { top: 10, right: 5, left: 5, bottom: 10 };
  const desktopMargin = { top: 20, right: 30, left: 20, bottom: 20 };

  // Trier par score moyen et prendre toutes ou les 10 meilleures
  const sortedRotations = [...rotations]
    .sort((a, b) => b.averageScore - a.averageScore);
  
  const displayRotations = showAll ? sortedRotations : sortedRotations.slice(0, 10);
  
  // Calculer le meilleur score pour les pourcentages
  const maxScore = displayRotations.length > 0 ? displayRotations[0].averageScore : 1;
  
  const topRotations = displayRotations.map((rotation) => {
    const percentage = Math.round((rotation.averageScore / maxScore) * 100);
    return {
      id: rotation.rotation_id,
      name: rotation.rotation_killer,
      score: Math.round(rotation.averageScore),
      count: rotation.scoreCount,
      attack: rotation.rotation_attack,
      percentage: percentage
    };
  });

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

  // Fonction pour tronquer les noms trop longs
  const truncateName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 1) + "…";
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const isTopPerformer = payload[0].payload.percentage === 100;
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
            Score moyen: {payload[0].value.toLocaleString()}
          </Box>
          <Box 
            fontSize="sm" 
            color={isTopPerformer ? "green.500" : textColor}
            fontWeight={isTopPerformer ? "bold" : "normal"}
          >
            Performance: {payload[0].payload.percentage}%
            {isTopPerformer && " 🏆"}
          </Box>
          <Box fontSize="sm" color={textColor}>
            Participations: {payload[0].payload.count}
          </Box>
          <Flex fontSize="sm" alignItems="center" gap={2} color={textColor} mt={1}>
            Type: <AttackTypeBadge attackType={payload[0].payload.attack} />
          </Flex>
        </Box>
      );
    }
    return null;
  };

  const chartHeight = isMobile
    ? Math.max(300, topRotations.length * 45)
    : showAll 
      ? Math.max(400, topRotations.length * 35) 
      : 400;

  if (isMobile) {
    // Version mobile avec barres horizontales
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={topRotations} layout="vertical" margin={mobileMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            type="number"
            stroke={textColor}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            style={{ fontSize }}
          />
          <YAxis
            type="category"
            dataKey="id"
            stroke={textColor}
            style={{ fontSize }}
            width={"auto"}
            tickFormatter={(value) => {
              const rotation = topRotations.find(r => r.id === value);
              return rotation ? truncateName(rotation.name, 15) : value;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[0, 8, 8, 0]}>
            {topRotations.map((entry) => (
              <Cell key={entry.id} fill={getColorByAttack(entry.attack)} />
            ))}
            <LabelList 
              dataKey="percentage" 
              position="insideRight" 
              formatter={(value: number) => `${value}%`}
              style={{ fontSize: labelFontSize, fontWeight: "bold", fill: "white" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Version desktop avec barres verticales
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={topRotations} margin={desktopMargin}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="id"
          height={80}
          stroke={textColor}
          style={{ fontSize }}
          interval={0}
          angle={25}
          textAnchor="end"
          tickFormatter={(value) => {
            const rotation = topRotations.find(r => r.id === value);
            return rotation?.name || value;
          }}
        />
        <YAxis
          stroke={textColor}
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          style={{ fontSize }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
          {topRotations.map((entry) => (
            <Cell key={entry.id} fill={getColorByAttack(entry.attack)} />
          ))}
          <LabelList 
            dataKey="percentage" 
            position="top"
            formatter={(value: number) => `${value}%`}
            style={{ fontSize: labelFontSize, fontWeight: "bold", fill: textColor }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
