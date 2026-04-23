import { VStack, Heading, Text, Center, Divider } from "@chakra-ui/react";
import { UserRotationsChart } from "@/components/charts/UserRotationsChart";
import { UserTypeAnalysis } from "@/components/user/UserTypeAnalysis";
import type { IUserStats } from "@/hooks/useAPI";

interface UserPerformancesProps {
  stats: IUserStats;
}

export const UserPerformances = ({ stats }: UserPerformancesProps) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Scores Moyens par Rotation</Heading>
      <Text fontSize="sm" color="gray.500">
        Toutes vos rotations triées par score moyen décroissant
      </Text>
      <Text fontSize="xs" color="gray.400" fontStyle="italic">
        💡 Le pourcentage de performance est calculé par rapport à votre meilleure rotation (100%). 
        Une rotation à 80% signifie qu'elle atteint 80% du score moyen de votre meilleure rotation.
      </Text>
      {stats.allRotations.length > 0 ? (
        <UserRotationsChart rotations={stats.allRotations} showAll={true} />
      ) : (
        <Center py={10}>
          <Text color="gray.500">Pas assez de données disponibles</Text>
        </Center>
      )}

      <Divider />

      <Heading size="md">Analyse par Type</Heading>
      <Text fontSize="sm" color="gray.500">
        Performances agrégées par killer, type d'attaque et altération d'état
      </Text>
      <UserTypeAnalysis stats={stats} />
    </VStack>
  );
};
