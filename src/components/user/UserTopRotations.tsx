import { SimpleGrid } from "@chakra-ui/react";
import { RotationDetailCard } from "./RotationDetailCard";
import type { IUserStats } from "@/hooks/useAPI";

interface UserTopRotationsProps {
  stats: IUserStats;
}

export const UserTopRotations = ({ stats }: UserTopRotationsProps) => {
  if (!stats.bestRotation || !stats.worstRotation) {
    return null;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <RotationDetailCard
        title="Meilleure Rotation"
        icon="🏆"
        rotation={stats.bestRotation}
        extremeScore={stats.bestScore}
        extremeLabel="🌟 Meilleur Score:"
        variant="best"
      />
      <RotationDetailCard
        title="Rotation à Améliorer"
        icon="📉"
        rotation={stats.worstRotation}
        extremeScore={stats.worstScore}
        extremeLabel="📊 Pire Score:"
        variant="worst"
      />
    </SimpleGrid>
  );
};
