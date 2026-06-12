'use client';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  Box,
  Badge,
  useColorModeValue,
  Flex,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiCalendar, FiLayers } from "react-icons/fi";

import { AlterationImage } from "../components/ui/AlterationImage";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import CustomLink from "@/components/ui/CustomLink";
import { HeroSection } from "@/components/HeroSection";
import { useCycle } from "@/hooks/useAPI";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";
import { PageLoader } from "@/components/ui/PageLoader";

const CycleDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { t } = useTranslation();
  
  // Utiliser useSWR pour le cycle (cache automatique)
  const { cycle, isLoading, error: fetchError } = useCycle(id);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "rgba(26, 32, 44, 0.7)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const subTextColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const labelColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const statBg = useColorModeValue("white", "rgba(26, 32, 44, 0.6)");
  const rowBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const rowHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");

  useEffect(() => {
    if (fetchError) {
      setError(t("pages.cycleDetail.errorLoading"));
    }
    if (!id) {
      setError(t("pages.cycleDetail.errorMissingId"));
    }
  }, [fetchError, id]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <PageLoader height="200px" />
      </Container>
    );
  }

  if (error || !cycle) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="error">
            <AlertIcon />
            {error || t("pages.cycleDetail.errorNotFound")}
          </Alert>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => router.push("/cycles")}
          >
            {t("pages.cycleDetail.backToCycles")}
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={cycle ? `${cycle.name} - ${cycle.year} - Schrift BBS` : `Cycle ${id} - Schrift BBS`}
        description={cycle ? `Détails du cycle ${cycle.name} (${cycle.year}) de la Guilde War Schrift` : `Détails du cycle ${id} de la Guilde War Schrift`}
        noIndex={true}
      />

      <Box w="100%">
        <HeroSection
          title={`${cycle.name} — ${cycle.year}`}
          description={t("pages.cycleDetail.subtitle")}
          badge={{ text: `${cycle.rotations?.length || 0} rotations`, icon: "⚔️" }}
          size="md"
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">

            {/* Bouton retour */}
            <Box>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                onClick={() => router.push("/cycles")}
                size="sm"
                _hover={{ transform: "translateX(-4px)" }}
                transition="all 0.2s"
              >
                {t("pages.cycleDetail.backToCycles")}
              </Button>
            </Box>

            {/* Stats strip */}
            {cycle.rotations && cycle.rotations.length > 0 && (
              <Box
                bg={statBg}
                borderRadius="xl"
                borderWidth={1}
                borderColor={borderColor}
                boxShadow="md"
                overflow="hidden"
              >
                <Flex
                  justify="center"
                  align="center"
                  px={6}
                  py={5}
                  gap={12}
                  wrap="wrap"
                >
                  <HStack spacing={3}>
                    <Box bg="green.500" borderRadius="lg" p={2} display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiCalendar} color="white" boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="lg" fontWeight="extrabold" color="green.500">
                        {cycle.rotations[0].start_date || "—"}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wide">
                        {t("pages.cycleDetail.labelStartDate")}
                      </Text>
                    </VStack>
                  </HStack>

                  <Divider orientation="vertical" h="40px" />

                  <HStack spacing={3}>
                    <Box bg="red.500" borderRadius="lg" p={2} display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiCalendar} color="white" boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="lg" fontWeight="extrabold" color="red.500">
                        {cycle.rotations[cycle.rotations.length - 1].end_date || "—"}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wide">
                        {t("pages.cycleDetail.labelEndDate")}
                      </Text>
                    </VStack>
                  </HStack>

                  <Divider orientation="vertical" h="40px" />

                  <HStack spacing={3}>
                    <Box bgGradient="linear(to-br, purple.500, blue.500)" borderRadius="lg" p={2} display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiLayers} color="white" boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="lg" fontWeight="extrabold" bgGradient="linear(to-r, purple.500, blue.400)" bgClip="text">
                        {cycle.rotations.length}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wide">
                        {t("pages.cycleDetail.labelRotations")}
                      </Text>
                    </VStack>
                  </HStack>
                </Flex>
              </Box>
            )}

            {/* Liste des rotations */}
            {cycle.rotations && cycle.rotations.length > 0 && (
              <VStack spacing={2} align="stretch">
                <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wider" mb={1}>
                  {t("pages.cycleDetail.rotationsHeading")}
                </Text>

                {cycle.rotations.map((rotation, index) => (
                  <Box
                    key={index}
                    bg={cardBg}
                    backdropFilter="blur(12px)"
                    borderRadius="xl"
                    borderWidth={1}
                    borderColor={borderColor}
                    overflow="hidden"
                    position="relative"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      transform: "translateX(4px)",
                      borderColor: "purple.400",
                      _dark: { borderColor: "purple.600" },
                      bg: rowHoverBg,
                    }}
                  >
                    {/* Accent bar */}
                    <Box
                      position="absolute"
                      left={0}
                      top={0}
                      bottom={0}
                      w="3px"
                      bgGradient="linear(to-b, purple.400, blue.500)"
                    />

                    <Box pl={5} pr={4} py={3}>
                      {/* Ligne 1 : position + lien + badge période */}
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="bold" color="purple.500" minW="24px" textAlign="right">
                            #{rotation.position}
                          </Text>
                          <CustomLink
                            to={`/cycle/${id}/rotation/${rotation.position}`}
                            text={`Rotation #${rotation.position}`}
                          />
                        </HStack>
                        <Badge
                          fontSize="xs"
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          colorScheme={rotation.period?.includes("Vendredi") ? "pink" : "blue"}
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          {t(`periodsShort.${rotation.period}`, rotation.period?.includes("Vendredi") ? "V–D" : "M–J")}
                        </Badge>
                      </Flex>

                      {/* Ligne 2 : infos */}
                      <Flex gap={2} flexWrap="wrap">
                        {/* Killer */}
                        <Box flex={1} minW="110px" bg={rowBg} px={3} py={1.5} borderRadius="lg">
                          <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                            {t("pages.cycleDetail.fieldKiller")}
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color={labelColor} noOfLines={1}>
                            {t(`factions.${rotation.killer}`, rotation.killer)}
                          </Text>
                        </Box>

                        {/* Attack */}
                        <Box flexShrink={0} bg={rowBg} px={3} py={1.5} borderRadius="lg">
                          <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" mb={1}>
                            {t("pages.cycleDetail.fieldAttack")}
                          </Text>
                          <HStack spacing={1.5}>
                            <AttackTypeBadge attackType={rotation.attack} size="15px" />
                            <Text fontSize="xs" color={subTextColor} w="46px">
                              {t(`attackTypes.${rotation.attack}`, rotation.attack)}
                            </Text>
                          </HStack>
                        </Box>

                        {/* Alteration */}
                        <Box flexShrink={0} bg={rowBg} px={3} py={1.5} borderRadius="lg">
                          <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" mb={1}>
                            {t("pages.cycleDetail.fieldAlteration")}
                          </Text>
                          <AlterationImage alteration={rotation.alteration} size="20px" showLabel={true} />
                        </Box>

                        {/* Dates */}
                        <Box flexShrink={0} bg={rowBg} px={3} py={1.5} borderRadius="lg">
                          <HStack spacing={1.5} mb={0.5}>
                            <Icon as={FiCalendar} boxSize={3} color="green.500" />
                            <Text fontSize="xs" color={subTextColor}>{rotation.start_date || "—"}</Text>
                          </HStack>
                          <HStack spacing={1.5}>
                            <Icon as={FiCalendar} boxSize={3} color="red.500" />
                            <Text fontSize="xs" color={subTextColor}>{rotation.end_date || "—"}</Text>
                          </HStack>
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                ))}
              </VStack>
            )}

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default CycleDetailPage;
