import {
  VStack,
  Heading,
  Box,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  useColorModeValue,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { useOrbGuide } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface OrbSource {
  title: string;
  description: string;
  amount: number;
}

const OrbFarmingGuide = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("purple.500", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const totalBoxBg = useColorModeValue("purple.50", "purple.900");
  const totalBoxBorder = useColorModeValue("purple.200", "purple.600");
  const totalTextColor = useColorModeValue("gray.700", "gray.200");

  const { t } = useTranslation();
  const { orbData, isLoading: loading, error } = useOrbGuide();

  const colorSchemes = [
    "purple",
    "blue",
    "green",
    "orange",
    "cyan",
    "red",
    "pink",
    "teal",
    "purple",
    "yellow",
    "red",
    "green",
    "blue",
    "gray"
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
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

  return (
    <VStack spacing={6} align="stretch">
      <Flex align="center" gap={4}>
        <Box flex={1}>
          <Heading size="lg" mb={2} color={accentColor}>
            {t("components.orbFarmingGuide.heading")}
          </Heading>
          <Text fontSize="sm" color={textColor}>
            {t("components.orbFarmingGuide.description", {
              total: orbData.totalOrbes.toLocaleString()
            })}
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {orbData.data.map((source: OrbSource, index: number) => (
          <Card
            key={index}
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            shadow="md"
          >
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <Heading size="sm">{source.title}</Heading>
                <Badge colorScheme={colorSchemes[index]} fontSize="md">
                  {source.amount}
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody pt={2}>
              <Text fontSize="sm">{source.description}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Total */}
      <Box
        mt={6}
        p={6}
        bg={totalBoxBg}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={totalBoxBorder}
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={2}>
              {t("components.orbFarmingGuide.totalHeading")}
            </Heading>
            <Text fontSize="sm" color={totalTextColor}>
              {t("components.orbFarmingGuide.totalDescription")}
            </Text>
          </Box>
          <Badge colorScheme="purple" fontSize="3xl" px={6} py={3}>
            {orbData.totalOrbes.toLocaleString()} {t("components.orbFarmingGuide.orbsUnit")}
          </Badge>
        </Flex>
      </Box>
    </VStack>
  );
};

export default OrbFarmingGuide;
