import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  VStack,
  HStack,
  Select,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useColorModeValue,
  Avatar,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useBuilds } from "../hooks/useAPI";
import { useAPIMutations } from "../hooks/useAPIMutations";
import { CheckIcon, CloseIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import type { IBuild } from "../interfaces";
import { Pagination } from "./ui/Pagination";
import { AffinityIcon } from "./ui/AffinityIcon";
import { UserDisplay } from "./ui/UserDisplay";
import { BuildDetailModal } from "./ui/BuildDetailModal";

const BuildsAdminSection = () => {
  const { deleteBuild, validateBuild } = useAPIMutations();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterIsValid, setFilterIsValid] = useState<boolean | undefined>(undefined);
  const [selectedBuild, setSelectedBuild] = useState<IBuild | null>(null);
  const [buildToDelete, setBuildToDelete] = useState<string | null>(null);
  
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const { builds, pagination, isLoading, mutate } = useBuilds({
    page: currentPage,
    limit: 20,
    isValid: filterIsValid,
    authenticated: true,
  });

  const handleValidate = async (buildId: string, isValid: boolean) => {
    try {
      await validateBuild(buildId, isValid);
      toast({
        title: isValid ? "Build validé" : "Build invalidé",
        status: "success",
        duration: 3000,
      });
      mutate();
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erreur",
        description: err.message || "Impossible de modifier le statut",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDelete = async () => {
    if (!buildToDelete) return;

    try {
      await deleteBuild(buildToDelete);
      toast({
        title: "Build supprimé",
        status: "success",
        duration: 3000,
      });
      mutate();
      onDeleteClose();
      setBuildToDelete(null);
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer le build",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleView = (build: IBuild) => {
    setSelectedBuild(build);
    onViewOpen();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Gestion des Builds</Heading>

        {/* Filtres */}
        <Box bg={bgColor} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <HStack spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Statut de validation
              </Text>
              <Select
                value={filterIsValid === undefined ? "" : filterIsValid.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterIsValid(value === "" ? undefined : value === "true");
                  setCurrentPage(1);
                }}
                w="200px"
              >
                <option value="">Tous</option>
                <option value="true">Validés</option>
                <option value="false">Non validés</option>
              </Select>
            </Box>
          </HStack>
        </Box>

        {/* Table */}
        {isLoading ? (
          <Flex justify="center" py={8}>
            <Spinner size="xl" color="orange.500" />
          </Flex>
        ) : builds.length === 0 ? (
          <Box bg={bgColor} p={8} borderRadius="md" borderWidth="1px" borderColor={borderColor} textAlign="center">
            <Text>Aucun build trouvé</Text>
          </Box>
        ) : (
          <>
            <Box overflowX="auto" bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Utilisateur</Th>
                    <Th>Rotation</Th>
                    <Th>Description</Th>
                    <Th>Team</Th>
                    <Th>Statut</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {builds.map((build) => (
                    <Tr key={build._id}>
                      <Td>
                        {build.user ? (
                          <HStack spacing={2}>
                            <UserDisplay user={build.user} />
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">
                            Anonyme
                          </Text>
                        )}
                      </Td>
                      <Td>
                        {build.rotation ? (
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="medium">
                              {build.rotation.killer}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {build.rotation.attack} / {build.rotation.alteration}
                            </Text>
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">
                            Rotation inconnue
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm" isTruncated maxW="200px">
                          {build.description || "Pas de description"}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          {build.team?.slice(0, 3).map((member, idx) => (
                            <HStack key={idx} spacing={2}>
                              <Avatar
                                size="xs"
                                src={member.character?.link || member.character?.image}
                                name={member.character?.name || "?"}
                                bg="gray.200"
                              />
                              <Text fontSize="xs" isTruncated maxW="120px">
                                {member.character?.name || "Inconnu"}
                              </Text>
                              {member.character?.affinity && (
                                <AffinityIcon affinity={member.character.affinity} size="14px" />
                              )}
                            </HStack>
                          ))}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={build.isValid ? "green" : "gray"}>
                          {build.isValid ? "Validé" : "En attente"}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{formatDate(build.created_at)}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Voir les détails">
                            <IconButton
                              aria-label="Voir"
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleView(build)}
                            />
                          </Tooltip>
                          {build.isValid ? (
                            <Tooltip label="Invalider">
                              <IconButton
                                aria-label="Invalider"
                                icon={<CloseIcon />}
                                size="sm"
                                colorScheme="orange"
                                variant="ghost"
                                onClick={() => handleValidate(build._id!, false)}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip label="Valider">
                              <IconButton
                                aria-label="Valider"
                                icon={<CheckIcon />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleValidate(build._id!, true)}
                              />
                            </Tooltip>
                          )}
                          <Tooltip label="Supprimer">
                            <IconButton
                              aria-label="Supprimer"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => {
                                setBuildToDelete(build._id!);
                                onDeleteOpen();
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                hasPrevPage={pagination.hasPrevPage}
                hasNextPage={pagination.hasNextPage}
                onPageChange={setCurrentPage}
                totalCount={pagination.totalCount}
                itemsOnPage={pagination.itemsOnPage}
              />
            )}
          </>
        )}
      </VStack>

      {/* Modal de visualisation */}
      <BuildDetailModal 
        isOpen={isViewOpen}
        onClose={onViewClose}
        build={selectedBuild}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer le build
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer ce build ? Cette action est irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default BuildsAdminSection;
