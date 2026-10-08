import { Box, useColorModeValue } from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface UserScoreDistributionProps {
  rotations: {
    rotation_killer: string;
    rotation_attack: string;
    averageScore: number;
    scoreCount: number;
  }[];
}

export const UserScoreDistribution = ({ rotations }: UserScoreDistributionProps) => {
  const bgColor = "bg.card";
  const textColor = useColorModeValue("#4a5568", "#cbd5e0");

  // Grouper par type d'attaque
  const attackStats = rotations.reduce(
    (acc, rotation) => {
      const type = rotation.rotation_attack;
      if (!acc[type]) {
        acc[type] = { total: 0, count: 0 };
      }
      acc[type].total += rotation.averageScore * rotation.scoreCount;
      acc[type].count += rotation.scoreCount;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  const data = Object.entries(attackStats).map(([type, stats]) => ({
    name: type,
    value: Math.round(stats.total / stats.count),
    count: stats.count
  }));

  const COLORS: Record<string, string> = {
    NAD: "#4299E1",
    SAD: "#F56565",
    SP: "#48BB78",
    default: "#9F7AEA"
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { count: number } }> }) => {
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
            Type: {payload[0].name}
          </Box>
          <Box fontSize="sm" color={textColor}>
            Score moyen: {payload[0].value.toLocaleString()}
          </Box>
          <Box fontSize="sm" color={textColor}>
            Participations: {payload[0].payload.count}
          </Box>
        </Box>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: { cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number }) => {
    if (cx == null || cy == null || midAngle == null || innerRadius == null || outerRadius == null || percent == null) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="14px"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name] || COLORS.default}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: textColor, fontSize: "14px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
