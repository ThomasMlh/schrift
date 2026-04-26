import type { ICycleRotation, ICycle } from "@/interfaces";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Flex
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { AlterationImage } from "./ui/AlterationImage";
import CustomLink from "./ui/CustomLink";
import { useCycles } from "@/hooks/useAPI";
import { getRotationRealDates } from "@/utils/cycleHelpers";

export const CurrentInfoSection = () => {
  const { t } = useTranslation();
  const [currentCycle, setCurrentCycle] = useState<ICycle | null>(null);
  const [nextCycle, setNextCycle] = useState<ICycle | null>(null);
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [currentRotation, setCurrentRotation] = useState<ICycleRotation | null>(
    null
  );
  const [isRotationActive, setIsRotationActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shadowColor = useColorModeValue("lg", "dark-lg");

  const {
    cycles: allCycles,
    isLoading,
    error: cyclesError
  } = useCycles({ limit: 5, authenticated: true });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("black.900", "white.900");
  const cycleIconColor = useColorModeValue("blue.600", "blue.300");
  const rotationIconColor = useColorModeValue("purple.600", "purple.300");
  const currentInfoIconColor = useColorModeValue("green.600", "green.300");

  useEffect(() => {
    if (!isLoading && allCycles.length > 0) {
      const now = new Date();
      let activeCycle = null;
      let activeRotation = null;
      let upcomingRotation = null;
      let isRotationCurrentlyActive = false;
      let isCycleCurrentlyActive = false;

      for (const cycle of allCycles) {
        if (cycle.rotations && cycle.rotations.length > 0) {
          for (const rotation of cycle.rotations) {
            if (rotation.start_date && rotation.end_date) {
              const { realStartDate, realEndDate } = getRotationRealDates(
                rotation.start_date,
                rotation.end_date
              );

              if (now >= realStartDate && now <= realEndDate) {
                activeCycle = cycle;
                activeRotation = rotation;
                isRotationCurrentlyActive = true;
                isCycleCurrentlyActive = true;
                break;
              }
            }
          }
          if (isRotationCurrentlyActive) break;

          if (!activeCycle) {
            for (const rotation of cycle.rotations) {
              if (rotation.start_date && rotation.end_date) {
                const { realStartDate } = getRotationRealDates(
                  rotation.start_date,
                  rotation.end_date
                );

                if (now < realStartDate) {
                  activeCycle = cycle;
                  upcomingRotation = rotation;
                  isCycleCurrentlyActive = true;
                  break;
                }
              }
            }
          }
        }
      }

      if (activeCycle && isCycleCurrentlyActive) {
        setCurrentCycle(activeCycle);
        setIsCycleActive(true);
        setNextCycle(null);

        if (activeRotation && isRotationCurrentlyActive) {
          setCurrentRotation(activeRotation);
          setIsRotationActive(true);
        } else if (upcomingRotation) {
          setCurrentRotation(upcomingRotation);
          setIsRotationActive(false);
        } else {
          setCurrentRotation(null);
          setIsRotationActive(false);
        }
      }
      else if (allCycles.length > 0) {
        let futureNextCycle = null;
        
        for (const cycle of allCycles) {
          if (cycle.rotations && cycle.rotations.length > 0) {
            const hasFutureRotation = cycle.rotations.some(rotation => {
              if (rotation.start_date && rotation.end_date) {
                const { realStartDate } = getRotationRealDates(
                  rotation.start_date,
                  rotation.end_date
                );
                return now < realStartDate;
              }
              return false;
            });
            
            if (hasFutureRotation) {
              futureNextCycle = cycle;
              break;
            }
          }
        }
        
        if (futureNextCycle) {
          setCurrentCycle(null);
          setNextCycle(futureNextCycle);
          setIsCycleActive(false);
          setCurrentRotation(null);
          setIsRotationActive(false);
        } else {
          setCurrentCycle(null);
          setNextCycle(null);
          setIsCycleActive(false);
          setCurrentRotation(null);
          setIsRotationActive(false);
        }
      }
    }

    if (cyclesError) {
      setError(t("components.currentInfoSection.errorLoading"));
    }
  }, [allCycles, isLoading, cyclesError]);

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
      <VStack spacing={4} align="stretch">
        {/* Header section */}
        <HStack spacing={3} align="center">
          <Box
            w="36px"
            h="36px"
            rounded="lg"
            display="grid"
            placeItems="center"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <Icon
              as={FaClock}
              boxSize={4}
              color={currentInfoIconColor}
            />
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="xl">
              {t("components.currentInfoSection.heading")}
            </Text>
            <Text fontSize="sm" opacity={0.75}>
              {t("components.currentInfoSection.subheading")}
            </Text>
          </Box>
        </HStack>

        <Box
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          bg={bgColor}
          backdropFilter="blur(10px)"
          boxShadow={shadowColor}
          p={{ base: 4, md: 5 }}
        >
          {error ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          ) : isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <HStack spacing={3}>
                <Spinner size="lg" color="blue.500" thickness="4px" />
                <Text fontSize="lg">{t("components.currentInfoSection.loading")}</Text>
              </HStack>
            </Flex>
          ) : !currentCycle && !nextCycle ? (
            <Flex justify="center" align="center" py={12}>
              <VStack spacing={3}>
                <Icon as={FaCalendarAlt} boxSize={10} opacity={0.5} />
                <Text fontSize="md" fontWeight="semibold" opacity={0.75}>
                  {t("components.currentInfoSection.noCycle")}
                </Text>
              </VStack>
            </Flex>
          ) : (
            <Box>
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
                gap={4}
              >
                {(currentCycle || nextCycle) && (
                  <Box
                    rounded="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={bgColor}
                    p={5}
                  >
                    <HStack justify="space-between" align="start" mb={3}>
                      <HStack spacing={2}>
                        <Icon
                          as={FaCalendarAlt}
                          boxSize={4}
                          color={cycleIconColor}
                        />
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          textTransform="uppercase"
                          letterSpacing="0.12em"
                          color={textColor}
                        >
                          {isCycleActive ? t("components.currentInfoSection.cycleActive") : t("components.currentInfoSection.cycleNext")}
                        </Text>
                      </HStack>

                      <Badge
                        colorScheme={isCycleActive ? "blue" : "orange"}
                        variant="subtle"
                        rounded="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                      >
                        {isCycleActive ? t("components.currentInfoSection.badgeActive") : t("components.currentInfoSection.badgeNext")}
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
                          w="100%"
                          rounded="lg"
                          borderWidth="1px"
                          borderColor={borderColor}
                          bg={bgColor}
                          p={3}
                        >
                          {(() => {
                            const { realStartDate, realEndDate } =
                              getRotationRealDates(
                                currentCycle.rotations[0].start_date,
                                currentCycle.rotations[
                                  currentCycle.rotations.length - 1
                                ].end_date
                              );
                            return (
                              <VStack align="start" spacing={1}>
                                <HStack spacing={2} fontSize="sm">
                                  <Text fontWeight="semibold">{t("components.currentInfoSection.labelStart")}</Text>
                                  <Text opacity={0.8}>
                                    {formatRealDateTime(realStartDate)}
                                  </Text>
                                </HStack>
                                <HStack spacing={2} fontSize="sm">
                                  <Text fontWeight="semibold">{t("components.currentInfoSection.labelEnd")}</Text>
                                  <Text opacity={0.8}>
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

                <Box
                  rounded="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg={bgColor}
                  p={5}
                >
                  <HStack justify="space-between" align="start" mb={3}>
                    <HStack spacing={2}>
                      <Icon
                        as={FaClock}
                        boxSize={4}
                        color={rotationIconColor}
                      />
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.12em"
                        color={textColor}
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
                        variant="subtle"
                        rounded="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                      >
                        {isRotationActive ? t("components.currentInfoSection.badgeInProgress") : t("components.currentInfoSection.badgeUpcoming")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        rounded="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        opacity={0.8}
                      >
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
                          <Text fontSize="md" opacity={0.7}>
                            {t("components.currentInfoSection.rotationNoPosition")}
                          </Text>
                        )}

                        <Text opacity={0.5}>•</Text>
                        <Text fontSize="md" fontWeight="semibold">
                          {t(`factions.${currentRotation.killer}`, currentRotation.killer)}
                        </Text>

                        <Text opacity={0.5}>•</Text>

                        <AttackTypeBadge
                          attackType={currentRotation.attack}
                          size="28px"
                        />
                        <AlterationImage
                          alteration={currentRotation.alteration}
                          showLabel
                          size="24px"
                        />
                      </HStack>

                      {currentRotation.start_date &&
                        currentRotation.end_date && (
                          <Box
                            w="100%"
                            rounded="lg"
                            borderWidth="1px"
                            borderColor={borderColor}
                            bg={bgColor}
                            p={3}
                          >
                            {(() => {
                              const { realStartDate, realEndDate } =
                                getRotationRealDates(
                                  currentRotation.start_date,
                                  currentRotation.end_date
                                );
                              return (
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={2} fontSize="sm">
                                    <Text fontWeight="semibold">{t("components.currentInfoSection.labelStart")}</Text>
                                    <Text opacity={0.8}>
                                      {formatRealDateTime(realStartDate)}
                                    </Text>
                                  </HStack>
                                  <HStack spacing={2} fontSize="sm">
                                    <Text fontWeight="semibold">{t("components.currentInfoSection.labelEnd")}</Text>
                                    <Text opacity={0.8}>
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
                    <Text fontSize="sm" opacity={0.75}>
                      {t("components.currentInfoSection.noRotationDefined")}
                    </Text>
                  ) : (
                    <Text fontSize="sm" opacity={0.75}>
                      {t("components.currentInfoSection.selectCycle")}
                    </Text>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};
