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

interface CurrentInfoSectionProps {
}

export const CurrentInfoSection = ({}: CurrentInfoSectionProps = {}) => {
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
  const { cycles: allCycles, isLoading, error: cyclesError } = useCycles({ limit: 5, authenticated: true });

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie";

    try {
      const date = parseDate(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "Date invalide";
    }
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
      <VStack spacing={6} align="stretch">
        {/* En-tête moderne */}
        <HStack spacing={3} mb={2}>
          <Icon as={FaClock} boxSize={6} color="green.500" />
          <Text fontWeight="bold" fontSize="2xl">
            Informations Actuelles
          </Text>
        </HStack>
        
        <Box
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow={shadowColor}
          overflow="hidden"
        >
          {error ? (
          <Box p={6}>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          </Box>
        ) : isLoading ? (
          <Flex justify="center" align="center" py={8}>
            <HStack spacing={3}>
              <Spinner size="lg" color="blue.500" thickness="4px" />
              <Text fontSize="lg">Chargement...</Text>
            </HStack>
          </Flex>
        ) : !currentCycle && !nextCycle ? (
          /* Aucun cycle disponible */
          <Box p={8} textAlign="center">
            <VStack spacing={3}>
              <Icon as={FaCalendarAlt} boxSize={12} color="gray.400" />
              <Text fontSize="lg" fontWeight="medium" color="gray.500">
                Aucun cycle disponible
              </Text>
            </VStack>
          </Box>
        ) : (
          <>
                {/* Cycle actuel ou prochain */}
                {(currentCycle || nextCycle) && (
                  <Box p={6}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={2}>
                          <Icon as={FaCalendarAlt} boxSize={5} color="blue.500" />
                          <Text fontSize="sm" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                            {isCycleActive ? "Cycle en cours" : "Prochain cycle"}
                          </Text>
                        </HStack>
                        <CustomLink
                          to={`/cycle/${(currentCycle || nextCycle)?._id}`}
                          text={(currentCycle || nextCycle)?.name || ""}
                          textSize="xl"
                        />
                        {(currentCycle || nextCycle)?.created_at && (
                          <Text fontSize="xs" color="gray.500">
                            Créé le {formatDate((currentCycle || nextCycle)?.created_at)}
                          </Text>
                        )}
                      </VStack>
                      <Badge 
                        colorScheme={isCycleActive ? "blue" : "orange"} 
                        variant="solid" 
                        fontSize="xs"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {isCycleActive ? "ACTIF" : "PROCHAIN"}
                      </Badge>
                    </HStack>
                  </Box>
                )}

                {/* Rotation actuelle ou prochaine - seulement si on a un cycle actif */}
                {currentCycle && currentRotation ? (
                  <Box p={6}>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between" align="start">
                        <HStack spacing={2}>
                          <Icon as={FaClock} boxSize={5} color="purple.500" />
                          <Text fontSize="sm" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                            {isRotationActive ? "Rotation en cours" : "Prochaine rotation"}
                          </Text>
                        </HStack>
                        <Badge 
                          colorScheme={isRotationActive ? "purple" : "orange"} 
                          variant="solid" 
                          fontSize="xs"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {isRotationActive ? "EN COURS" : "PROCHAINE"}
                        </Badge>
                      </HStack>
                      
                      <VStack align="start" spacing={3}>
                        <HStack spacing={3} flexWrap="wrap" align="center">
                          {currentRotation.position ? (
                            <CustomLink 
                              to={`/cycle/${currentCycle._id}/rotation/${currentRotation.position}`} 
                              text={`Rotation #${currentRotation.position}`} 
                              textSize="xl" 
                            />
                          ) : (
                            <Text fontSize="xl" fontWeight="bold" color="gray.500">
                              Rotation (sans position)
                            </Text>
                          )}
                          <Text fontSize="xl" fontWeight="bold">
                            {currentRotation.killer}
                          </Text>
                          <AttackTypeBadge
                            attackType={currentRotation.attack}
                            size="28px"
                          />
                          <AlterationImage
                            alteration={currentRotation.alteration}
                            showLabel={true}
                            size="24px"
                            fontWeight="bold"
                          />
                        </HStack>
                        
                        {currentRotation.start_date && currentRotation.end_date && (
                          <HStack spacing={6} flexWrap="wrap" fontSize="sm" color="gray.600">
                            {(() => {
                              const { realStartDate, realEndDate } =
                                getRotationRealDates(
                                  currentRotation.start_date,
                                  currentRotation.end_date
                                );
                              return (
                                <>
                                  <HStack spacing={2}>
                                    <Text fontWeight="medium">Début:</Text>
                                    <Text>{formatRealDateTime(realStartDate)}</Text>
                                  </HStack>
                                  <HStack spacing={2}>
                                    <Text fontWeight="medium">Fin:</Text>
                                    <Text>{formatRealDateTime(realEndDate)}</Text>
                                  </HStack>
                                </>
                              );
                            })()}
                          </HStack>
                        )}
                      </VStack>
                    </VStack>
                  </Box>
                ) : (
                  currentCycle && (
                    <Box p={6} textAlign="center">
                      <Text fontSize="sm" color="gray.500">
                        Aucune rotation définie pour ce cycle
                      </Text>
                    </Box>
                  )
                )}
            </>
          )}
        </Box>
      </VStack>
    </Box>
  );
};
