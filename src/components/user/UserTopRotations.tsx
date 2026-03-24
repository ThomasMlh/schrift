import {
  SimpleGrid,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import { RotationDetailCard } from "./RotationDetailCard";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import type { IUserStats } from "@/hooks/useAPI";

interface UserTopRotationsProps {
  stats: IUserStats;
}

export const UserTopRotations = ({ stats }: UserTopRotationsProps) => {
  const tableBg = useColorModeValue("white", "gray.800");
  const stripedBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "gray.600");

  if (!stats.bestRotation || !stats.worstRotation) {
    return null;
  }

  // Trier les rotations par position
  const sortedRotations = [...stats.allRotations].sort((a, b) => {
    if (a.rotation_position !== undefined && b.rotation_position !== undefined) {
      return a.rotation_position - b.rotation_position;
    }
    return b.averageScore - a.averageScore;
  });

  return (
    <VStack spacing={6} align="stretch">
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

      {/* Tableau de toutes les rotations du cycle */}
      {sortedRotations.length > 0 && (
        <Card bg={tableBg} borderRadius="xl" boxShadow="md">
          <CardBody>
            <Heading size="md" mb={4}>
              📋 Détail par rotation
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Toutes les rotations du cycle sélectionné, triées par position
            </Text>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Killer</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Score moyen</Th>
                    <Th isNumeric>Participations</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedRotations.map((rotation, index) => {
                    const isBest = rotation.rotation_id === stats.bestRotation?.rotation_id;
                    const isWorst = rotation.rotation_id === stats.worstRotation?.rotation_id;

                    return (
                      <Tr
                        key={rotation.rotation_id}
                        bg={index % 2 === 0 ? "transparent" : stripedBg}
                        _hover={{ bg: hoverBg }}
                      >
                        <Td>
                          <Text fontWeight="medium">
                            {rotation.rotation_position ?? index + 1}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold">
                              {rotation.rotation_killer}
                            </Text>
                            {isBest && (
                              <Badge colorScheme="green" fontSize="xs">🏆 Best</Badge>
                            )}
                            {isWorst && (
                              <Badge colorScheme="red" fontSize="xs">📉 Pire</Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <AttackTypeBadge attackType={rotation.rotation_attack} />
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold">
                            {rotation.averageScore.toLocaleString()}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="blue" px={2}>
                            {rotation.scoreCount}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};
