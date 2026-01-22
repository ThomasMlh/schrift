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
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { AlterationImage } from "./ui/AlterationImage";
import CustomLink from "./ui/CustomLink";
import { useCycles } from "@/hooks/useAPI";

export const CurrentInfoSection = () => {
  const [currentCycle, setCurrentCycle] = useState<ICycle | null>(null);
  const [nextCycle, setNextCycle] = useState<ICycle | null>(null);
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [currentRotation, setCurrentRotation] = useState<ICycleRotation | null>(
    null
  );
  const [isRotationActive, setIsRotationActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shadowColor = useColorModeValue("lg", "dark-lg");

  // Utilisation de useSWR pour les cycles (cache automatique + déduplication)
  const {
    cycles: allCycles,
    isLoading,
    error: cyclesError
  } = useCycles({ limit: 5, authenticated: true });

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("black.900", "white.900");

  // Traiter les cycles quand ils sont chargés
  useEffect(() => {
    if (!isLoading && allCycles.length > 0) {
      const now = new Date();
      let activeCycle = null;
      let activeRotation = null;
      let upcomingRotation = null;
      let isRotationCurrentlyActive = false;
      let isCycleCurrentlyActive = false;

      // Chercher un cycle avec au moins une rotation active
      for (const cycle of allCycles) {
        if (cycle.rotations && cycle.rotations.length > 0) {
          // Vérifier s'il y a une rotation active dans ce cycle
          for (const rotation of cycle.rotations) {
            if (rotation.start_date && rotation.end_date) {
              const { realStartDate, realEndDate } = getRotationRealDates(
                rotation.start_date,
                rotation.end_date
              );

              // Rotation actuellement active
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

          // Si pas de rotation active, chercher s'il y a au moins une rotation future dans ce cycle
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

      // Si on a trouvé un cycle actif
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
      // Sinon, chercher le prochain cycle
      else if (allCycles.length > 0) {
        const nextCycleData = allCycles[0]; // Le plus récent
        setCurrentCycle(null);
        setNextCycle(nextCycleData);
        setIsCycleActive(false);
        setCurrentRotation(null);
        setIsRotationActive(false);
      }
    }

    if (cyclesError) {
      setError("Erreur lors du chargement des données");
    }
  }, [allCycles, isLoading, cyclesError]);

  const parseDate = (dateString: string) => {
    // Les dates semblent être au format DD/MM/YYYY
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Fallback pour d'autres formats
    return new Date(dateString);
  };

  const getRotationRealDates = (startDate: string, endDate: string) => {
    // La rotation commence la veille de start_date à 16h
    const realStartDate = parseDate(startDate);
    realStartDate.setDate(realStartDate.getDate() - 1);
    realStartDate.setHours(16, 0, 0, 0);

    // La rotation se termine le jour de end_date à 16h
    const realEndDate = parseDate(endDate);
    realEndDate.setHours(16, 0, 0, 0);

    return { realStartDate, realEndDate };
  };

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
            borderColor={useColorModeValue("blackAlpha.200", "whiteAlpha.200")}
          >
            <Icon
              as={FaClock}
              boxSize={4}
              color={useColorModeValue("green.600", "green.300")}
            />
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="xl">
              Informations actuelles
            </Text>
            <Text fontSize="sm" opacity={0.75}>
              Aperçu du cycle et de la rotation (dates, statut, détails).
            </Text>
          </Box>
        </HStack>

        {/* Container */}
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
                <Text fontSize="lg">Chargement…</Text>
              </HStack>
            </Flex>
          ) : !currentCycle && !nextCycle ? (
            <Flex justify="center" align="center" py={12}>
              <VStack spacing={3}>
                <Icon as={FaCalendarAlt} boxSize={10} opacity={0.5} />
                <Text fontSize="md" fontWeight="semibold" opacity={0.75}>
                  Aucun cycle disponible
                </Text>
              </VStack>
            </Flex>
          ) : (
            <Box>
              {/* GRID: Cycle + Rotation */}
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
                gap={4}
              >
                {/* Card: Cycle */}
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
                          color={useColorModeValue("blue.600", "blue.300")}
                        />
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          textTransform="uppercase"
                          letterSpacing="0.12em"
                          color={textColor}
                        >
                          {isCycleActive ? "Cycle en cours" : "Prochain cycle"}
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
                        {isCycleActive ? "Actif" : "Prochain"}
                      </Badge>
                    </HStack>

                    <VStack align="start" spacing={3}>
                      <CustomLink
                        to={`/cycle/${(currentCycle || nextCycle)?._id}`}
                        text={(currentCycle || nextCycle)?.name || ""}
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
                                  <Text fontWeight="semibold">Début :</Text>
                                  <Text opacity={0.8}>
                                    {formatRealDateTime(realStartDate)}
                                  </Text>
                                </HStack>
                                <HStack spacing={2} fontSize="sm">
                                  <Text fontWeight="semibold">Fin :</Text>
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

                {/* Card: Rotation */}
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
                        color={useColorModeValue("purple.600", "purple.300")}
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
                            ? "Rotation en cours"
                            : "Prochaine rotation"
                          : "Rotation"}
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
                        {isRotationActive ? "En cours" : "Prochaine"}
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
                      {/* line 1 */}
                      <HStack spacing={2} flexWrap="wrap" align="center">
                        {currentRotation.position ? (
                          <CustomLink
                            to={`/cycle/${currentCycle._id}/rotation/${currentRotation.position}`}
                            text={`Rotation #${currentRotation.position}`}
                            textSize="md"
                          />
                        ) : (
                          <Text fontSize="md" opacity={0.7}>
                            Rotation (sans position)
                          </Text>
                        )}

                        <Text opacity={0.5}>•</Text>
                        <Text fontSize="md" fontWeight="semibold">
                          {currentRotation.killer}
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

                      {/* line 2 - dates */}
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
                                    <Text fontWeight="semibold">Début :</Text>
                                    <Text opacity={0.8}>
                                      {formatRealDateTime(realStartDate)}
                                    </Text>
                                  </HStack>
                                  <HStack spacing={2} fontSize="sm">
                                    <Text fontWeight="semibold">Fin :</Text>
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
                      Aucune rotation définie pour ce cycle.
                    </Text>
                  ) : (
                    <Text fontSize="sm" opacity={0.75}>
                      Sélectionne un cycle pour voir la rotation.
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
