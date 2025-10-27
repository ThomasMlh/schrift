import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  Button
} from "@chakra-ui/react";
import type { Cycle } from "../interfaces";
import { handleAttackType } from "../utils/attackTypes";

export function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const linkColor = useColorModeValue('black', 'white');
  const loadCycles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cycles`);
      if (response.ok) {
        const data = await response.json();
        
        // Vérifier si la réponse est un tableau ou un objet avec une propriété cycles
        if (Array.isArray(data)) {
          setCycles(data);
        } else if (data && Array.isArray(data.cycles)) {
          setCycles(data.cycles);
        } else {
          console.error("Format de données inattendu:", data);
          setCycles([]);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des cycles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4}>Cycles de Rotation</Heading>
          <Text color="gray.500">
            Découvrez tous les cycles de rotation disponibles
          </Text>
        </Box>

        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="medium">
            {isLoading ? "Chargement..." : `${cycles.length} cycle${cycles.length > 1 ? 's' : ''}`}
          </Text>
          <Button
            size="sm"
            onClick={loadCycles}
            isLoading={isLoading}
            loadingText="Chargement..."
          >
            Actualiser
          </Button>
        </HStack>

        {isLoading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : !Array.isArray(cycles) || cycles.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            {!Array.isArray(cycles) ? "Erreur lors du chargement des cycles." : "Aucun cycle disponible pour le moment."}
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {cycles.map((cycle) => (
              <Card
                key={cycle._id}
                bg={cardBg}
                borderColor={borderColor}
                borderWidth={1}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" align="start">
                      <Heading 
                        as={Link}
                        to={`/cycles/${cycle._id}`}
                        size="md" 
                        flex={1}
                        color={linkColor}
                        _hover={{ color: linkColor, textDecoration: "underline" }}
                        textDecoration="none"
                      >
                        {cycle.name}
                      </Heading>
                      <Badge colorScheme="blue" fontSize="sm">
                        {cycle.rotations?.length || 0} rotations
                      </Badge>
                    </HStack>

                    {cycle.rotations && cycle.rotations[0]?.start_date && (
                      <VStack spacing={2} align="stretch">
                        <HStack>
                          <Text fontSize="sm" fontWeight="medium" color="gray.500">
                            Date de début:
                          </Text>
                          <Text fontSize="sm">
                            {cycle.rotations[0].start_date}
                          </Text>
                        </HStack>
                        {cycle.rotations[cycle.rotations.length - 1]?.end_date && (
                          <HStack>
                            <Text fontSize="sm" fontWeight="medium" color="gray.500">
                              Date de fin:
                            </Text>
                            <Text fontSize="sm">
                              {cycle.rotations[cycle.rotations.length - 1].end_date}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    )}

                    {cycle.rotations && cycle.rotations.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Rotations:
                        </Text>
                        <VStack spacing={1} align="stretch" maxH="200px" overflowY="auto">
                          {cycle.rotations.map((rotation, index) => (
                            <HStack key={index} justify="space-between" fontSize="sm" spacing={2}>
                              <Text minW="30px">#{index + 1}</Text>
                              <VStack spacing={0} flex={1} align="center">
                                <Text fontWeight="medium" fontSize="xs">
                                  {rotation.killer}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {handleAttackType(rotation)}
                                </Text>
                              </VStack>
                              <Badge size="sm" colorScheme="gray" fontSize="xs">
                                {rotation.period}
                              </Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}