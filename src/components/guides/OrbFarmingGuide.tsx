import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  HStack,
  Image,
} from "@chakra-ui/react";
import { useOrbGuide } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";
import { PageLoader } from "../ui/PageLoader";

interface OrbSource {
  title: string;
  description: string;
  amount: number;
}

const OrbFarmingGuide = () => {

  const { t } = useTranslation();
  const { orbData, isLoading: loading, error } = useOrbGuide();

  if (loading) {
    return <PageLoader color="purple.400" height="400px" />;
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

  // Most to least profitable sources
  const sources = [...orbData.data].sort((x: OrbSource, y: OrbSource) => y.amount - x.amount);
  const total = orbData.totalOrbes || sources.reduce((sum, src) => sum + src.amount, 0);
  const share = (amount: number) => (total ? Math.round((amount / total) * 100) : 0);

  return (
    <VStack spacing={5} align="stretch">
      <Flex
        bg="bg.card"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.subtle"
        p={5}
        gap={4}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
      >
        <Box maxW="2xl">
          <Text fontWeight="bold" color="text.strong" mb={1}>{t("components.orbFarmingGuide.heading")}</Text>
          <Text fontSize="sm" color="text.secondary">
            {t("components.orbFarmingGuide.description", { total: total.toLocaleString("fr-FR") })}
          </Text>
          <Text fontSize="xs" color="text.muted" mt={1}>{t("components.orbFarmingGuide.totalDescription")}</Text>
        </Box>
        <HStack spacing={3} flexShrink={0}>
          <Image src="/orb.png" alt="" boxSize="40px" />
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide" fontWeight="semibold">
              {t("components.orbFarmingGuide.totalHeading")}
            </Text>
            <Text fontSize="2xl" fontWeight="extrabold" color="text.strong" lineHeight={1.1}>
              {total.toLocaleString("fr-FR")} <Text as="span" fontSize="sm" color="text.muted" fontWeight="semibold">{t("components.orbFarmingGuide.orbsUnit")}</Text>
            </Text>
          </Box>
        </HStack>
      </Flex>

      <VStack align="stretch" spacing={2}>
        {sources.map((source: OrbSource, index: number) => {
          const isBest = index === 0;
          return (
            <Box
              key={source.title}
              bg="bg.card"
              borderRadius="xl"
              borderWidth={isBest ? "2px" : "1px"}
              borderColor={isBest ? "purple.400" : "border.subtle"}
              p={4}
            >
              <Flex justify="space-between" align="start" gap={3}>
                <HStack spacing={3} align="start" minW={0}>
                  <Text fontSize="sm" fontWeight="bold" color="text.muted" w="24px" flexShrink={0}>#{index + 1}</Text>
                  <Box minW={0}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold" color="text.strong">{source.title}</Text>
                      {isBest && (
                        <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}>
                          {t("components.orbFarmingGuide.bestSource")}
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="text.secondary" mt={0.5}>{source.description}</Text>
                  </Box>
                </HStack>
                <Box textAlign="right" flexShrink={0}>
                  <HStack spacing={1} justify="flex-end">
                    <Image src="/orb.png" alt="" boxSize="16px" />
                    <Text fontWeight="extrabold" color="text.strong">{source.amount.toLocaleString("fr-FR")}</Text>
                  </HStack>
                  <Text fontSize="xs" color="text.muted">{share(source.amount)} %</Text>
                </Box>
              </Flex>
              <Progress
                value={share(source.amount)}
                size="xs"
                colorScheme="purple"
                bg="bg.inset"
                borderRadius="full"
                mt={3}
                aria-label={`${source.title} : ${share(source.amount)} %`}
              />
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default OrbFarmingGuide;
