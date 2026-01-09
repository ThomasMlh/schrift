import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { ArrowBackIcon, CalendarIcon } from "@chakra-ui/icons";

import { handleAttackType } from "../utils/attackTypes";
import { AlterationImage } from "../components/ui/AlterationImage";
import CustomLink from "@/components/ui/CustomLink";
import { useCycle } from "@/hooks/useAPI";

const CycleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Utiliser useSWR pour le cycle (cache automatique)
  const { cycle, isLoading, error: fetchError } = useCycle(id);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  // const rotationHoverBg = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    if (fetchError) {
      setError("Erreur lors du chargement du cycle");
    }
    if (!id) {
      setError("ID du cycle manquant");
    }
  }, [fetchError, id]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="lg" />
        </Flex>
      </Container>
    );
  }

  if (error || !cycle) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="error">
            <AlertIcon />
            {error || "Cycle non trouvé"}
          </Alert>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => navigate("/cycles")}
          >
            Retour aux cycles
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header avec bouton retour */}
        <HStack justify="space-between" align="center">
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate("/cycles")}
          >
            Retour aux cycles
          </Button>
          <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
            {cycle.rotations?.length || 0} rotations
          </Badge>
        </HStack>

        {/* Titre du cycle */}
        <Box textAlign="center">
          <Heading size="xl" mb={2}>
            {cycle.name}
          </Heading>
          <Text color="gray.500">Détail du cycle de rotation</Text>
        </Box>

        {/* Informations générales */}
        {cycle.rotations && cycle.rotations.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Informations générales</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.500"
                      mb={1}
                    >
                      <CalendarIcon mb={1} mr={1} color="green.500" />
                      Date de début
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {cycle.rotations[0].start_date || "Non définie"}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.500"
                      mb={1}
                    >
                      <CalendarIcon mb={1} mr={1} color="red.500" />
                      Date de fin
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {cycle.rotations[cycle.rotations.length - 1].end_date ||
                        "Non définie"}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.500"
                      mb={1}
                    >
                      Nombre de rotations
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {cycle.rotations.length}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Liste détaillée des rotations */}
        {cycle.rotations && cycle.rotations.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <VStack spacing={2} align="stretch">
                  <Heading size="md">Rotations détaillées</Heading>
                  <Alert status="info" variant="subtle" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      💡 Cliquez sur le nom d'une rotation pour voir son classement détaillé
                    </Text>
                  </Alert>
                </VStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {cycle.rotations.map((rotation, index) => (
                    <Card key={index} variant="outline" size="sm">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <CustomLink to={`/cycle/${id}/rotation/${rotation.position}`} text={`Rotation #${rotation.position}`} />
                            <Badge colorScheme="purple" size="sm">
                              {rotation.period}
                            </Badge>
                          </HStack>

                          <VStack spacing={2} align="stretch">
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Killer
                              </Text>
                              <Badge
                                colorScheme="green"
                                fontSize="sm"
                                fontWeight="medium"
                              >
                                {rotation.killer}
                              </Badge>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Type d'attaque
                              </Text>
                              <Badge
                                colorScheme={
                                  rotation.attack === "R"
                                    ? "red"
                                    : rotation.attack === "B"
                                    ? "blue"
                                    : "orange"
                                }
                                size="sm"
                              >
                                {handleAttackType(rotation)}
                              </Badge>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Altération
                              </Text>
                              <AlterationImage
                                alteration={rotation.alteration}
                                size="20px"
                                showLabel={true}
                              />
                            </Box>
                          </VStack>

                          <VStack spacing={1} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.500">
                                <CalendarIcon mb={1} mr={1} color="green.500" />
                                Début:
                              </Text>
                              <Text fontSize="xs" fontWeight="medium">
                                {rotation.start_date || "Non définie"}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.500">
                                {" "}
                                <CalendarIcon mb={1} mr={1} color="red.500" />
                                Fin:
                              </Text>
                              <Text fontSize="xs" fontWeight="medium">
                                {rotation.end_date || "Non définie"}
                              </Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default CycleDetailPage;
