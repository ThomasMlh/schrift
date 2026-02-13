import {
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Divider,
  Box,
  Badge,
  useColorModeValue
} from "@chakra-ui/react";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";

interface ScoreInfo {
  score: number;
  rotation_killer: string;
  rotation_attack: string;
}

interface RotationInfo {
  rotation_killer: string;
  rotation_attack: string;
  averageScore: number;
  scoreCount: number;
  totalScore: number;
}

interface RotationDetailCardProps {
  title: string;
  icon: string;
  rotation: RotationInfo;
  extremeScore: ScoreInfo;
  extremeLabel: string;
  variant: "best" | "worst";
}

export const RotationDetailCard = ({
  title,
  icon,
  rotation,
  extremeScore,
  extremeLabel,
  variant
}: RotationDetailCardProps) => {
  const statCardBg = useColorModeValue("blue.50", "gray.700");
  const color = variant === "best" ? "green" : "red";

  return (
    <Card
      bg={statCardBg}
      borderRadius="xl"
      borderLeft="6px solid"
      borderColor={`${color}.500`}
    >
      <CardBody>
        <Heading size="sm" mb={4} color={`${color}.500`}>
          {icon} {title}
        </Heading>
        <VStack align="stretch" spacing={3}>
          <HStack spacing={2}>
            <Text fontWeight="bold" fontSize="xl">
              {rotation.rotation_killer}
            </Text>
            <AttackTypeBadge attackType={rotation.rotation_attack} />
          </HStack>
          <Divider />

          <Box bg={`${color}.500`} p={3} borderRadius="lg" color="white">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                {extremeLabel}
              </Text>
              <Text fontWeight="bold" fontSize="xl">
                {extremeScore.score.toLocaleString()}
              </Text>
            </HStack>
            <Text fontSize="xs" mt={1} opacity={0.9}>
              {extremeScore.rotation_killer}
            </Text>
          </Box>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              Moyenne:
            </Text>
            <Text fontWeight="semibold" fontSize="lg">
              {rotation.averageScore.toLocaleString()}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              Participations:
            </Text>
            <Badge colorScheme={color} fontSize="md" px={3} py={1}>
              {rotation.scoreCount}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              Total:
            </Text>
            <Text fontWeight="semibold" fontSize="lg">
              {rotation.totalScore.toLocaleString()}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
