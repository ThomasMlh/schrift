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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subTitlesColor = useColorModeValue("black", "white");

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fonction utilitaire pour les requêtes authentifiées
  const authenticatedFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("userToken");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });
  };

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const accentColor = useColorModeValue("blue.50", "blue.900");
  const purpleBgColor = useColorModeValue("purple.50", "purple.900");
  const grayBgColor = useColorModeValue("gray.50", "gray.700");

  // Charger les informations actuelles
  useEffect(() => {
    const loadCurrentInfo = async () => {
      if (!apiUrl) {
        setError("Configuration API manquante");
        return;
      }

      try {
        // Charger plusieurs cycles pour pouvoir identifier le prochain
        const cyclesResponse = await authenticatedFetch(
          `${apiUrl}/api/cycles?limit=5`
        );
        const cyclesData = await cyclesResponse.json();

        let allCycles = [];

        // La réponse peut être un tableau directement ou un objet avec success
        if (Array.isArray(cyclesData)) {
          allCycles = cyclesData;
        } else if (cyclesData.success && cyclesData.data) {
          allCycles = cyclesData.data;
        }

        if (allCycles.length > 0) {
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
      } catch (error) {
        console.error(
          "Erreur lors du chargement des informations actuelles:",
          error
        );
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentInfo();
  }, [apiUrl]);

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
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={shadowColor}
      p={{ base: 4, md: 6 }}
      w="100%"
      maxW="600px"
      mx="auto"
    >
      <VStack spacing={4} align="stretch">
        {/* En-tête */}
        <HStack spacing={2} justify="center">
          <Icon as={FaClock} color="green.500" />
          <Text fontWeight="bold" fontSize="lg" color="green.500">
            Informations Actuelles
          </Text>
        </HStack>

        {error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        ) : isLoading ? (
          <Flex justify="center" align="center" py={4}>
            <HStack spacing={3}>
              <Spinner size="md" />
              <Text>Chargement...</Text>
            </HStack>
          </Flex>
        ) : (
          <VStack spacing={3} align="stretch">
            {!currentCycle && !nextCycle ? (
              /* Aucun cycle disponible */
              <Box
                p={4}
                bg={grayBgColor}
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
                textAlign="center"
              >
                <VStack spacing={2}>
                  <Icon as={FaCalendarAlt} color="gray.400" size={24} />
                  <Text fontSize="lg" fontWeight="medium" color="gray.500">
                    Aucun cycle disponible
                  </Text>
                </VStack>
              </Box>
            ) : (
              <>
                {/* Cycle actuel ou prochain */}
                {(currentCycle || nextCycle) && (
                  <Box
                    p={4}
                    bg={accentColor}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="blue.200"
                  >
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <Icon as={FaCalendarAlt} color="blue.500" />
                          <Text fontSize="sm" fontWeight="medium" color={subTitlesColor}>
                            {isCycleActive ? "Cycle en cours" : "Prochain cycle"}
                          </Text>
                        </HStack>
                        <CustomLink
                          to={`/cycle/${(currentCycle || nextCycle)?._id}`}
                          text={(currentCycle || nextCycle)?.name || ""}
                          textSize="md"
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
                        fontSize="sm"
                      >
                        {isCycleActive ? "ACTIF" : "PROCHAIN"}
                      </Badge>
                    </HStack>
                  </Box>
                )}

                {/* Rotation actuelle ou prochaine - seulement si on a un cycle actif */}
                {currentCycle && currentRotation ? (
                  <Box
                    p={4}
                    bg={purpleBgColor}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="purple.200"
                  >
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2} align="center">
                          <Icon as={FaClock} color="purple.500" />
                          <Text fontSize="sm" fontWeight="medium" color={subTitlesColor}>
                            {isRotationActive ? "Rotation en cours:" : "Prochaine rotation:"}
                          </Text>
                        </HStack>
                        <HStack spacing={2} flexDir={{ base: "column", sm: "row" }} align="start">
                          {currentRotation.position ? (
                            <CustomLink 
                              to={`/cycle/${currentCycle._id}/rotation/${currentRotation.position}`} 
                              text={`Rotation #${currentRotation.position}`} 
                              textSize="lg" 
                            />
                          ) : (
                            <Text fontSize="lg" fontWeight="bold" color="gray.500">
                              Rotation (sans position)
                            </Text>
                          )}
                          <Text fontSize="lg" fontWeight="bold">
                            {currentRotation.killer}
                          </Text>
                          <AttackTypeBadge
                            attackType={currentRotation.attack}
                            size="24px"
                          />
                          <AlterationImage
                            alteration={currentRotation.alteration}
                            showLabel={true}
                            size="20px"
                            fontWeight="bold"
                          />
                        </HStack>
                        {currentRotation.position && (
                          <HStack spacing={4}>
                            <Text fontSize="xs" color="gray.500">
                              Position: {currentRotation.position}
                            </Text>
                          </HStack>
                        )}
                        {currentRotation.start_date && currentRotation.end_date && (
                          <HStack spacing={4} flexWrap="wrap">
                            {(() => {
                              const { realStartDate, realEndDate } =
                                getRotationRealDates(
                                  currentRotation.start_date,
                                  currentRotation.end_date
                                );
                              return (
                                <>
                                  <Text fontSize="xs" color="gray.500">
                                    Début: {formatRealDateTime(realStartDate)}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    Fin: {formatRealDateTime(realEndDate)}
                                  </Text>
                                </>
                              );
                            })()}
                          </HStack>
                        )}
                      </VStack>
                      <Badge 
                        colorScheme={isRotationActive ? "purple" : "orange"} 
                        variant="solid" 
                        fontSize="sm"
                      >
                        {isRotationActive ? "EN COURS" : "PROCHAINE"}
                      </Badge>
                    </HStack>
                  </Box>
                ) : (
                  currentCycle && (
                    <Box
                      p={4}
                      bg={grayBgColor}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                      textAlign="center"
                    >
                      <Text fontSize="sm" color="gray.500">
                        Aucune rotation définie pour ce cycle
                      </Text>
                    </Box>
                  )
                )}
              </>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
