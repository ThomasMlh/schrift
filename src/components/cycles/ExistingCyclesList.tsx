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
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  useToast
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import type { ICycle } from "../../interfaces";
import { AlterationImage } from "../ui/AlterationImage";

interface ExistingCyclesListProps {
  cycles: ICycle[];
  isLoading: boolean;
  onRefresh: () => void;
  onDownloadEvents: () => void;
  onDownloadCycleEvents: (cycle: ICycle) => void;
  onDeleteCycle: (cycleId: string) => Promise<void>;
}

const ExistingCyclesList = ({ cycles,
  isLoading,
  onRefresh,
  onDownloadEvents,
  onDownloadCycleEvents,
  onDeleteCycle
}: ExistingCyclesListProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cycleToDelete, setCycleToDelete] = useState<ICycle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cycleBg = useColorModeValue('gray.50', 'gray.800');
  const linkColor = useColorModeValue('black', 'white');

  const handleDeleteClick = (cycle: ICycle) => {
    setCycleToDelete(cycle);
    onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!cycleToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteCycle(cycleToDelete._id || '');
      toast({
        title: "Cycle supprimé",
        description: `Le cycle "${cycleToDelete.name}" a été supprimé avec succès`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setCycleToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le cycle",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
                          to={`/cycle/${cycle._id}`}
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
                          <IconButton
                            size="xs"
                            colorScheme="red"
                            aria-label="Supprimer le cycle"
                            icon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(cycle)}
                            title={`Supprimer le cycle ${cycle.name}`}
                          />
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

      {/* Modal de confirmation de suppression */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer le cycle
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer le cycle <strong>"{cycleToDelete?.name}"</strong> ?
              <br />
              <br />
              Cette action est <strong>irréversible</strong> et supprimera également :
              <br />
              • Toutes les rotations du cycle ({cycleToDelete?.rotations?.length || 0} rotations)
              <br />
              • Tous les scores associés à ce cycle
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} isDisabled={isDeleting}>
                Annuler
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText="Suppression..."
              >
                Supprimer définitivement
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  );
}

export { ExistingCyclesList };