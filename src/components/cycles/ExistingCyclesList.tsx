import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  Badge,
  Heading,
  Box,
  useColorModeValue
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { Cycle } from "../../interfaces";
import { AlterationImage } from "../ui/AlterationImage";

interface ExistingCyclesListProps {
  cycles: Cycle[];
  isLoading: boolean;
  onRefresh: () => void;
  onDownloadEvents: () => void;
  onDownloadCycleEvents: (cycle: Cycle) => void;
}

const ExistingCyclesList = ({ cycles,
  isLoading,
  onRefresh,
  onDownloadEvents,
  onDownloadCycleEvents
}: ExistingCyclesListProps) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cycleBg = useColorModeValue('gray.50', 'gray.800');
  const linkColor = useColorModeValue('black', 'white');

  return (
    <Card bg={cardBg} borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Cycles existants
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="green"
                onClick={onDownloadEvents}
                isDisabled={!Array.isArray(cycles) || cycles.length === 0}
              >
                📥 Télécharger tous les cycles
              </Button>
              <Button
                size="sm"
                onClick={onRefresh}
                isLoading={isLoading}
                loadingText="Chargement..."
              >
                Actualiser
              </Button>
            </HStack>
          </HStack>

          {isLoading ? (
            <Flex justify="center" p={8}>
              <Spinner size="lg" />
            </Flex>
          ) : !Array.isArray(cycles) || cycles.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              {!Array.isArray(cycles) ? "Erreur lors du chargement des cycles." : "Aucun cycle créé pour le moment."}
            </Alert>
          ) : (
            <VStack spacing={3} align="stretch">
              {cycles.map((cycle) => (
                <Card
                  key={cycle._id}
                  variant="outline"
                  size="sm"
                  bg={cycleBg}
                >
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Heading
                          as={Link}
                          to={`/cycles/${cycle._id}`}
                          size="sm"
                          color={linkColor}
                          _hover={{ color: linkColor, textDecoration: "underline" }}
                          textDecoration="none"
                        >
                          {cycle.name}
                        </Heading>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue">
                            {cycle.rotations?.length || 0} rotations
                          </Badge>
                          <Button
                            size="xs"
                            colorScheme="green"
                            onClick={() => onDownloadCycleEvents(cycle)}
                            isDisabled={!cycle.rotations || cycle.rotations.length === 0}
                            title={`Télécharger events.json pour ${cycle.name}`}
                          >
                            📥
                          </Button>
                        </HStack>
                      </HStack>

                      {cycle.rotations && cycle.rotations.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Aperçu des rotations:
                          </Text>
                          <VStack spacing={1} align="stretch" maxH="120px" overflowY="auto">
                            {cycle.rotations.slice(0, 5).map((rotation, index) => (
                              <HStack key={index} justify="space-between" fontSize="xs" spacing={2}>
                                <Text>#{index + 1}</Text>
                                <Text fontWeight="medium" flex={1}>
                                  {rotation.killer}
                                </Text>
                                <AlterationImage
                                  alteration={rotation.alteration}
                                  size="16px"
                                />
                                <Badge size="sm" colorScheme="gray">
                                  {rotation.period}
                                </Badge>
                              </HStack>
                            ))}
                            {cycle.rotations.length > 5 && (
                              <Text fontSize="xs" color="gray.500" textAlign="center" pt={1}>
                                ... et {cycle.rotations.length - 5} autres rotations
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export { ExistingCyclesList };