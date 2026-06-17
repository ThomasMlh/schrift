import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorMode,
  Alert,
  AlertIcon,
  Flex
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageLoader } from "./ui/PageLoader";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { AlterationImage } from "./ui/AlterationImage";
import CustomLink from "./ui/CustomLink";
import { useCycles } from "@/hooks/useAPI";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";

export const CurrentInfoSection = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [error, setError] = useState<string | null>(null);

  const {
    cycles: allCycles,
    isLoading,
    error: cyclesError
  } = useCycles({ limit: 5, authenticated: true });

  const { currentCycle, nextCycle, currentRotation, isCycleActive, isRotationActive } =
    useCurrentRotation(allCycles, isLoading);

  const cardBg = isDark ? 'gray.800' : 'white';
  const borderColor = isDark ? 'whiteAlpha.100' : 'gray.200';
  const innerBg = isDark ? 'rgba(255,255,255,0.03)' : 'gray.50';

  useEffect(() => {
    if (cyclesError) setError(t("components.currentInfoSection.errorLoading"));
  }, [cyclesError, t]);

  const formatRealDateTime = (date: Date) => {
    return (
      date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }) +
      " à " +
      date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  };

  return (
    <Box w="100%">
      {/* Section header */}
      <HStack spacing={3} mb={4} align="center">
        <Box
          p={2} borderRadius="lg"
          bg="linear-gradient(135deg, #7C3AED, #4F46E5)"
          display="flex" alignItems="center" justifyContent="center"
        >
          <Icon as={FaClock} boxSize={4} color="white" />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            {t("components.currentInfoSection.heading")}
          </Text>
          <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
            {t("components.currentInfoSection.subheading")}
          </Text>
        </Box>
      </HStack>

      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        bg={cardBg}
        boxShadow={isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)'}
        overflow="hidden"
      >
        {error ? (
          <Box p={5}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          </Box>
        ) : isLoading ? (
          <PageLoader label={t("components.currentInfoSection.loading")} color="purple.400" height="200px" />
        ) : !currentCycle && !nextCycle ? (
          <Flex justify="center" align="center" py={12}>
            <VStack spacing={3}>
              <Icon as={FaCalendarAlt} boxSize={10} color={isDark ? 'gray.600' : 'gray.300'} />
              <Text fontSize="md" fontWeight="semibold" color={isDark ? 'gray.500' : 'gray.400'}>
                {t("components.currentInfoSection.noCycle")}
              </Text>
            </VStack>
          </Flex>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          >
            {/* Cycle card */}
            {(currentCycle || nextCycle) && (
              <Box
                p={5}
                borderRight={{ base: "none", lg: "1px solid" }}
                borderBottom={{ base: "1px solid", lg: "none" }}
                borderColor={borderColor}
                borderLeftWidth="3px"
                borderLeftColor="blue.400"
              >
                <HStack justify="space-between" align="start" mb={4}>
                  <HStack spacing={2}>
                    <Icon as={FaCalendarAlt} boxSize={4} color={isDark ? 'blue.400' : 'blue.500'} />
                    <Text
                      fontSize="2xs" fontWeight="semibold"
                      textTransform="uppercase" letterSpacing="widest"
                      color={isDark ? 'blue.400' : 'blue.500'}
                    >
                      {isCycleActive
                        ? t("components.currentInfoSection.cycleActive")
                        : t("components.currentInfoSection.cycleNext")}
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme={isCycleActive ? "blue" : "orange"}
                    variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs"
                  >
                    {isCycleActive
                      ? t("components.currentInfoSection.badgeActive")
                      : t("components.currentInfoSection.badgeNext")}
                  </Badge>
                </HStack>

                <VStack align="start" spacing={3}>
                  <CustomLink
                    to={`/cycle/${(currentCycle || nextCycle)?._id}`}
                    text={`${(currentCycle || nextCycle)?.name} - ${(currentCycle || nextCycle)?.year}`}
                    textSize="lg"
                  />

                  {currentCycle && currentCycle.rotations && (
                    <Box
                      w="100%" borderRadius="lg" p={3}
                      bg={innerBg} border="1px solid" borderColor={borderColor}
                    >
                      {(() => {
                        const { realStartDate, realEndDate } = getRotationRealDates(
                          currentCycle.rotations[0].start_date,
                          currentCycle.rotations[currentCycle.rotations.length - 1].end_date
                        );
                        return (
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} fontSize="sm">
                              <Text fontWeight="semibold" color={isDark ? 'gray.300' : 'gray.700'}>
                                {t("components.currentInfoSection.labelStart")}
                              </Text>
                              <Text color={isDark ? 'gray.400' : 'gray.500'}>
                                {formatRealDateTime(realStartDate)}
                              </Text>
                            </HStack>
                            <HStack spacing={2} fontSize="sm">
                              <Text fontWeight="semibold" color={isDark ? 'gray.300' : 'gray.700'}>
                                {t("components.currentInfoSection.labelEnd")}
                              </Text>
                              <Text color={isDark ? 'gray.400' : 'gray.500'}>
                                {formatRealDateTime(realEndDate)}
                              </Text>
                            </HStack>
                          </VStack>
                        );
                      })()}
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* Rotation card */}
            <Box
              p={5}
              borderLeftWidth="3px"
              borderLeftColor="purple.400"
            >
              <HStack justify="space-between" align="start" mb={4}>
                <HStack spacing={2}>
                  <Icon as={FaClock} boxSize={4} color={isDark ? 'purple.400' : 'purple.500'} />
                  <Text
                    fontSize="2xs" fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="widest"
                    color={isDark ? 'purple.400' : 'purple.500'}
                  >
                    {currentCycle && currentRotation
                      ? isRotationActive
                        ? t("components.currentInfoSection.rotationActive")
                        : t("components.currentInfoSection.rotationNext")
                      : t("components.currentInfoSection.rotationLabel")}
                  </Text>
                </HStack>

                {currentCycle && currentRotation ? (
                  <Badge
                    colorScheme={isRotationActive ? "purple" : "orange"}
                    variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs"
                  >
                    {isRotationActive
                      ? t("components.currentInfoSection.badgeInProgress")
                      : t("components.currentInfoSection.badgeUpcoming")}
                  </Badge>
                ) : (
                  <Badge variant="outline" borderRadius="full" px={3} py={1} fontSize="xs"
                    color={isDark ? 'gray.500' : 'gray.400'}>
                    N/A
                  </Badge>
                )}
              </HStack>

              {currentCycle && currentRotation ? (
                <VStack align="start" spacing={3}>
                  <HStack spacing={2} flexWrap="wrap" align="center">
                    {currentRotation.position ? (
                      <CustomLink
                        to={`/cycle/${currentCycle._id}/rotation/${currentRotation.position}`}
                        text={`${t("components.currentInfoSection.rotationLabel")} #${currentRotation.position}`}
                        textSize="md"
                      />
                    ) : (
                      <Text fontSize="md" color={isDark ? 'gray.500' : 'gray.400'}>
                        {t("components.currentInfoSection.rotationNoPosition")}
                      </Text>
                    )}
                    <Text color={isDark ? 'gray.600' : 'gray.300'}>•</Text>
                    <Text fontSize="md" fontWeight="semibold">
                      {t(`factions.${currentRotation.killer}`, currentRotation.killer)}
                    </Text>
                    <Text color={isDark ? 'gray.600' : 'gray.300'}>•</Text>
                    <AttackTypeBadge attackType={currentRotation.attack} size="28px" />
                    <AlterationImage alteration={currentRotation.alteration} showLabel size="24px" />
                  </HStack>

                  {currentRotation.start_date && currentRotation.end_date && (
                    <Box
                      w="100%" borderRadius="lg" p={3}
                      bg={innerBg} border="1px solid" borderColor={borderColor}
                    >
                      {(() => {
                        const { realStartDate, realEndDate } = getRotationRealDates(
                          currentRotation.start_date,
                          currentRotation.end_date
                        );
                        return (
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} fontSize="sm">
                              <Text fontWeight="semibold" color={isDark ? 'gray.300' : 'gray.700'}>
                                {t("components.currentInfoSection.labelStart")}
                              </Text>
                              <Text color={isDark ? 'gray.400' : 'gray.500'}>
                                {formatRealDateTime(realStartDate)}
                              </Text>
                            </HStack>
                            <HStack spacing={2} fontSize="sm">
                              <Text fontWeight="semibold" color={isDark ? 'gray.300' : 'gray.700'}>
                                {t("components.currentInfoSection.labelEnd")}
                              </Text>
                              <Text color={isDark ? 'gray.400' : 'gray.500'}>
                                {formatRealDateTime(realEndDate)}
                              </Text>
                            </HStack>
                          </VStack>
                        );
                      })()}
                    </Box>
                  )}
                </VStack>
              ) : currentCycle ? (
                <Text fontSize="sm" color={isDark ? 'gray.500' : 'gray.400'}>
                  {t("components.currentInfoSection.noRotationDefined")}
                </Text>
              ) : (
                <Text fontSize="sm" color={isDark ? 'gray.500' : 'gray.400'}>
                  {t("components.currentInfoSection.selectCycle")}
                </Text>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
