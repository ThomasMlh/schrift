import {
  VStack,
  Heading,
  Box,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  HStack,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import { useOrbGuide } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";
import { PageLoader } from "../ui/PageLoader";

interface OrbSource {
  title: string;
  description: string;
  amount: number;
}

const CATEGORY_COLORS = [
  "purple", "blue", "green", "orange", "cyan",
  "red", "pink", "teal", "yellow", "gray",
];

const PROGRESS_TRACK_COLORS: Record<string, string> = {
  purple: "rgba(168,85,247,0.15)",
  blue: "rgba(59,130,246,0.15)",
  green: "rgba(34,197,94,0.15)",
  orange: "rgba(251,146,60,0.15)",
  cyan: "rgba(6,182,212,0.15)",
  red: "rgba(239,68,68,0.15)",
  pink: "rgba(236,72,153,0.15)",
  teal: "rgba(20,184,166,0.15)",
  yellow: "rgba(234,179,8,0.15)",
  gray: "rgba(156,163,175,0.15)",
};

const OrbFarmingGuide = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const mutedText = "text.muted";

  const { t } = useTranslation();
  const { orbData, isLoading: loading, error } = useOrbGuide();

  if (loading) {
    return <PageLoader color="purple.500" height="400px" />;
  }

  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minH="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {t("components.orbFarmingGuide.errorTitle")}
        </AlertTitle>
        <AlertDescription maxWidth="sm">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!orbData) {
    return null;
  }

  const maxAmount = Math.max(...orbData.data.map((s: OrbSource) => s.amount));

  return (
    <VStack spacing={6} align="stretch">

      {/* Header */}
      <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
        <Box>
          <Heading size="sm" mb={1} color={isDark ? "purple.300" : "purple.600"}>
            {t("components.orbFarmingGuide.heading")}
          </Heading>
          <Text fontSize="xs" color={mutedText}>
            {t("components.orbFarmingGuide.description", {
              total: orbData.totalOrbes.toLocaleString()
            })}
          </Text>
        </Box>
        <Badge
          colorScheme="purple"
          variant={isDark ? "subtle" : "solid"}
          fontSize="lg"
          px={4}
          py={2}
          borderRadius="xl"
        >
          {orbData.totalOrbes.toLocaleString()} {t("components.orbFarmingGuide.orbsUnit")}
        </Badge>
      </Flex>

      {/* Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {orbData.data.map((source: OrbSource, index: number) => {
          const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
          const progressBg = PROGRESS_TRACK_COLORS[color] ?? "rgba(168,85,247,0.1)";
          const pct = Math.round((source.amount / maxAmount) * 100);

          return (
            <Card
              key={index}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              transition="all 0.15s ease"
              _hover={{
                borderColor: isDark ? "whiteAlpha.300" : "gray.300",
                boxShadow: `0 0 16px ${progressBg}, 0 4px 12px rgba(0,0,0,0.08)`,
                transform: "translateY(-2px)",
              }}
            >
              {/* Color accent bar */}
              <Box h="3px" bgGradient={`linear(90deg, ${color}.500, ${color}.300)`} />
              <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="flex-start" gap={2}>
                    <Text fontWeight="semibold" fontSize="sm" lineHeight="short" flex={1}>
                      {source.title}
                    </Text>
                    <Badge
                      colorScheme={color}
                      variant="subtle"
                      fontSize="sm"
                      fontWeight="bold"
                      px={2}
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      {source.amount}
                    </Badge>
                  </Flex>

                  {/* Progress bar */}
                  <Box>
                    <Box
                      bg={progressBg}
                      borderRadius="full"
                      h="4px"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={`${pct}%`}
                        bgGradient={`linear(90deg, ${color}.500, ${color}.300)`}
                        borderRadius="full"
                        transition="width 0.4s ease"
                      />
                    </Box>
                  </Box>

                  <Text fontSize="xs" color={mutedText} lineHeight="short">
                    {source.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Total banner */}
      <Box
        p={5}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={isDark ? "purple.700" : "purple.200"}
        bg={isDark ? "rgba(168,85,247,0.08)" : "purple.50"}
        boxShadow={isDark ? "0 0 24px rgba(168,85,247,0.12)" : "none"}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color={isDark ? "purple.300" : "purple.700"} mb={1}>
              {t("components.orbFarmingGuide.totalHeading")}
            </Text>
            <Text fontSize="xs" color={mutedText}>
              {t("components.orbFarmingGuide.totalDescription")}
            </Text>
          </Box>
          <HStack spacing={2}>
            <Image src="/orb.png" alt={t("components.orbFarmingGuide.orbsUnit")} boxSize="36px" />
            <Heading size="lg" color={isDark ? "purple.300" : "purple.600"}>
              {orbData.totalOrbes.toLocaleString()}
            </Heading>
            <Text fontSize="sm" color={mutedText} alignSelf="flex-end" pb={1}>
              {t("components.orbFarmingGuide.orbsUnit")}
            </Text>
          </HStack>
        </Flex>

        {/* Progress global */}
        <Box mt={4}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="2xs" color={mutedText} textTransform="uppercase" letterSpacing="widest">
              {t("components.orbFarmingGuide.heading")}
            </Text>
            <Text fontSize="2xs" color={isDark ? "purple.300" : "purple.600"} fontWeight="bold">
              {orbData.data.length} sources
            </Text>
          </Flex>
          <Progress
            value={100}
            colorScheme="purple"
            size="sm"
            borderRadius="full"
            bg={isDark ? "whiteAlpha.100" : "purple.100"}
          />
        </Box>
      </Box>
    </VStack>
  );
};

export default OrbFarmingGuide;
