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
import { useTranslation } from "react-i18next";
import { RotationDetailCard } from "./RotationDetailCard";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import type { IUserStats } from "@/hooks/useAPI";

interface UserTopRotationsProps {
  stats: IUserStats;
}

export const UserTopRotations = ({ stats }: UserTopRotationsProps) => {
  const { t } = useTranslation();
  const tableBg = "bg.card";
  const stripedBg = "bg.muted";
  const hoverBg = useColorModeValue("blue.50", "gray.600");

  if (!stats.bestRotation || !stats.worstRotation) {
    return null;
  }

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
          title={t("components.user.topRotations.bestRotationTitle")}
          icon="🏆"
          rotation={stats.bestRotation}
          extremeScore={stats.bestScore}
          extremeLabel={t("components.user.topRotations.bestScoreLabel")}
          variant="best"
        />
        <RotationDetailCard
          title={t("components.user.topRotations.worstRotationTitle")}
          icon="📉"
          rotation={stats.worstRotation}
          extremeScore={stats.worstScore}
          extremeLabel={t("components.user.topRotations.worstScoreLabel")}
          variant="worst"
        />
      </SimpleGrid>

      {sortedRotations.length > 0 && (
        <Card bg={tableBg} borderRadius="xl" boxShadow="md">
          <CardBody>
            <Heading size="md" mb={4}>
              {t("components.user.topRotations.detailHeading")}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              {t("components.user.topRotations.detailSubtitle")}
            </Text>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>{t("components.user.topRotations.colRank")}</Th>
                    <Th>{t("components.user.topRotations.colKiller")}</Th>
                    <Th>{t("components.user.topRotations.colType")}</Th>
                    <Th isNumeric>{t("components.user.topRotations.colAvgScore")}</Th>
                    <Th isNumeric>{t("components.user.topRotations.colParticipations")}</Th>
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
                              <Badge colorScheme="green" fontSize="xs">{t("components.user.topRotations.badgeBest")}</Badge>
                            )}
                            {isWorst && (
                              <Badge colorScheme="red" fontSize="xs">{t("components.user.topRotations.badgeWorst")}</Badge>
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
