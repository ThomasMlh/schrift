import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  SimpleGrid,
  Badge,
  useColorModeValue,
  Heading,
  Flex,
  Divider
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import type { IUserStats } from "@/hooks/useAPI";

interface UserRecentTrendProps {
  recentTrend: NonNullable<IUserStats["recentTrend"]>;
}

export const UserRecentTrend = ({ recentTrend }: UserRecentTrendProps) => {
  const { t } = useTranslation();
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue(
    recentTrend.direction === "up"
      ? "linear(to-r, green.50, teal.50)"
      : recentTrend.direction === "down"
      ? "linear(to-r, red.50, orange.50)"
      : "linear(to-r, gray.50, gray.100)",
    recentTrend.direction === "up"
      ? "linear(to-r, green.900, teal.900)"
      : recentTrend.direction === "down"
      ? "linear(to-r, red.900, orange.900)"
      : "linear(to-r, gray.800, gray.700)"
  );
  const trendColor =
    recentTrend.direction === "up"
      ? "green.500"
      : recentTrend.direction === "down"
      ? "red.500"
      : "gray.500";

  const trendIcon =
    recentTrend.direction === "up"
      ? FiTrendingUp
      : recentTrend.direction === "down"
      ? FiTrendingDown
      : FiMinus;

  const trendLabel =
    recentTrend.direction === "up"
      ? t("components.user.recentTrend.trendUp")
      : recentTrend.direction === "down"
      ? t("components.user.recentTrend.trendDown")
      : t("components.user.recentTrend.trendStable");

  const scoreBg = useColorModeValue("gray.50", "gray.700");
  const scoreItemBorderColor = "border.default";

  return (
    <VStack spacing={6} align="stretch">
      {/* En-tête avec gradient */}
      <Box
        bgGradient={headerBg}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="lg"
      >
        <VStack spacing={4} p={8} align="center">
          <Flex align="center" gap={3}>
            <Icon as={trendIcon} boxSize={10} color={trendColor} />
            <Heading size="xl" color={trendColor}>
              {trendLabel}
            </Heading>
          </Flex>

          <Text fontSize="md" color="gray.600" _dark={{ color: "gray.300" }}>
            {t("components.user.recentTrend.subtitle")}
          </Text>

          {recentTrend.percentage > 0 && (
            <Badge
              colorScheme={
                recentTrend.direction === "up"
                  ? "green"
                  : recentTrend.direction === "down"
                  ? "red"
                  : "gray"
              }
              fontSize="2xl"
              px={6}
              py={2}
              borderRadius="full"
            >
              {recentTrend.direction === "up" ? "+" : recentTrend.direction === "down" ? "-" : ""}
              {recentTrend.percentage}%
            </Badge>
          )}
        </VStack>
      </Box>

      {/* Comparaison des moyennes */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          borderWidth="2px"
          borderColor={trendColor}
        >
          <VStack spacing={3}>
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
              {t("components.user.recentTrend.badgeRecent")}
            </Badge>
            <Text
              fontSize="4xl"
              fontWeight="bold"
              color={trendColor}
            >
              {(recentTrend.recentAverage / 1000000).toFixed(1)}M
            </Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
              {t("components.user.recentTrend.labelRecentAvg")}
            </Text>
          </VStack>
        </Box>

        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor="border.default"
        >
          <VStack spacing={3}>
            <Badge colorScheme="gray" fontSize="sm" px={3} py={1}>
              {t("components.user.recentTrend.badgePrevious")}
            </Badge>
            <Text fontSize="4xl" fontWeight="bold">
              {(recentTrend.previousAverage / 1000000).toFixed(1)}M
            </Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
              {t("components.user.recentTrend.labelPreviousAvg")}
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>

      <Divider />

      {/* Détails des rotations */}
      <Box>
        <HStack spacing={2} mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            {t("components.user.recentTrend.detailHeading")}
          </Text>
        </HStack>

        <VStack spacing={3} align="stretch">
          {recentTrend.scores.map((scoreDetail, idx) => {
            const isRecent = idx < 3;
            return (
              <Box
                key={idx}
                bg={isRecent ? scoreBg : cardBg}
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={scoreItemBorderColor}
                transition="all 0.2s"
                _hover={{
                  transform: "translateX(4px)",
                  boxShadow: "md"
                }}
              >
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  gap={3}
                >
                  <HStack spacing={3} flex={1}>
                    <Badge
                      colorScheme={isRecent ? "purple" : "gray"}
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      #{scoreDetail.rotation_position}
                    </Badge>
                    <Text fontSize="md" fontWeight="semibold">
                      {scoreDetail.rotation_killer}
                    </Text>
                    <AttackTypeBadge attackType={scoreDetail.rotation_attack} />
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color={isRecent ? trendColor : undefined}>
                    {(scoreDetail.score / 1000000).toFixed(1)}M
                  </Text>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};
