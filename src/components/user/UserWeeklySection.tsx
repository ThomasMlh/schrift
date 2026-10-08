import {
  Box,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiCalendar, FiExternalLink } from "react-icons/fi";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import type { ICycle } from "@/interfaces";
import type { IUserStats } from "@/hooks/useAPI";

interface UserWeeklySectionProps {
  cycle: ICycle;
  cycleId: string;
  allRotations: IUserStats["allRotations"];
}

export const UserWeeklySection = ({
  cycle,
  cycleId,
  allRotations,
}: UserWeeklySectionProps) => {
  const cardBg = "bg.card";
  const rotBg = useColorModeValue("purple.50", "rgba(159,122,234,0.08)");
  const rotBorder = useColorModeValue("purple.200", "purple.700");

  const now = new Date();
  let currentWeek = 0;

  for (const rotation of cycle.rotations) {
    if (!rotation.start_date || !rotation.end_date) continue;
    const { realStartDate, realEndDate } = getRotationRealDates(
      rotation.start_date,
      rotation.end_date
    );
    if (now >= realStartDate && now <= realEndDate) {
      currentWeek = Math.ceil(rotation.position / 2);
      break;
    }
  }

  // Fall back to the most recently completed week
  if (currentWeek === 0) {
    let latestPos = 0;
    for (const rotation of cycle.rotations) {
      if (!rotation.start_date || !rotation.end_date) continue;
      const { realEndDate } = getRotationRealDates(
        rotation.start_date,
        rotation.end_date
      );
      if (now > realEndDate && rotation.position > latestPos) {
        latestPos = rotation.position;
      }
    }
    if (latestPos > 0) currentWeek = Math.ceil(latestPos / 2);
  }

  const maxWeeks = Math.floor(cycle.rotations.length / 2);
  if (currentWeek === 0 || maxWeeks < 1) return null;

  const week = Math.min(currentWeek, maxWeeks);
  const rot1 = cycle.rotations[(week - 1) * 2];
  const rot2 = cycle.rotations[(week - 1) * 2 + 1];

  const score1 = allRotations.find((r) => r.rotation_id === rot1?.rotation_id);
  const score2 = allRotations.find((r) => r.rotation_id === rot2?.rotation_id);

  if (!score1 && !score2) return null;

  const weekTotal = (score1?.averageScore ?? 0) + (score2?.averageScore ?? 0);

  const rotItems = [
    { rot: rot1, score: score1 },
    { rot: rot2, score: score2 },
  ];

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      boxShadow="md"
      borderLeft="4px solid"
      borderColor="purple.400"
    >
      <CardBody>
        <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Icon as={FiCalendar} color="purple.400" />
            <Text fontWeight="bold">Semaine {week} — en cours</Text>
            {weekTotal > 0 && (
              <Badge colorScheme="purple" borderRadius="full" fontSize="xs" px={2}>
                Total {Math.round(weekTotal).toLocaleString("fr-FR")}
              </Badge>
            )}
          </HStack>
          <RouterLink
            to={`/podium?mode=weekly&cycle_id=${cycleId}&week_number=${week}`}
          >
            <HStack
              spacing={1}
              fontSize="xs"
              color="purple.400"
              _hover={{ color: "purple.600" }}
            >
              <Text>Voir classement</Text>
              <Icon as={FiExternalLink} />
            </HStack>
          </RouterLink>
        </HStack>

        <HStack spacing={3} flexWrap={{ base: "wrap", md: "nowrap" }}>
          {rotItems.map(({ rot, score }, i) => (
            <Box
              key={i}
              flex={1}
              minW="140px"
              p={3}
              borderRadius="lg"
              bg={rotBg}
              border="1px solid"
              borderColor={rotBorder}
            >
              <Text
                fontSize="2xs"
                fontWeight="bold"
                color="purple.500"
                _dark={{ color: "purple.300" }}
                textTransform="uppercase"
                letterSpacing="wider"
                mb={1}
              >
                R{rot?.position} — {rot?.killer ?? "—"}
              </Text>
              <Text fontSize="xs" color="gray.500" mb={2}>
                {rot?.attack ?? "—"}
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={score ? "blue.500" : "gray.400"}
              >
                {score
                  ? Math.round(score.averageScore).toLocaleString("fr-FR")
                  : "—"}
              </Text>
              {score && score.scoreCount > 1 && (
                <Text fontSize="2xs" color="gray.400">
                  {score.scoreCount} scores
                </Text>
              )}
            </Box>
          ))}
        </HStack>
      </CardBody>
    </Card>
  );
};
