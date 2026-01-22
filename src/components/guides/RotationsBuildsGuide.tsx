import {
  VStack,
  Box,
  Text,
  useColorModeValue,
  Flex,
  Divider,
  Heading,
  Button,
  HStack,
  Spinner,
  Avatar,
  useDisclosure,
  Alert,
  AlertIcon,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AddIcon, InfoIcon, EditIcon } from "@chakra-ui/icons";
import { useBuilds, useRotations } from "../../hooks/useAPI";
import BuildCreationModal from "../ui/BuildCreationModal";
import { BuildDetailModal } from "../ui/BuildDetailModal";
import { Pagination } from "../ui/Pagination";
import { useAuth } from "../../providers/AuthProvider";
import { UserDisplay } from "../ui/UserDisplay";
import { CustomSelect } from "../ui/CustomSelect";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { AlterationImage } from "../ui/AlterationImage";
import type { IBuild } from "../../interfaces";

const RotationsBuildsGuide = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState<string>("");
  const [selectedBuild, setSelectedBuild] = useState<IBuild | null>(null);
  const [buildToEdit, setBuildToEdit] = useState<IBuild | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const bucketUrl = import.meta.env.VITE_BUCKET_URL;

  // Vérifier si l'utilisateur est connecté
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  // Récupérer toutes les rotations
  const { rotations, isLoading: isLoadingRotations } = useRotations();

  // Initialiser les états depuis l'URL au chargement
  useEffect(() => {
    const rotationParam = searchParams.get("rotation");
    const pageParam = searchParams.get("page");

    if (rotationParam && rotationParam !== selectedRotation) {
      setSelectedRotation(rotationParam);
    }
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page !== currentPage) {
        setCurrentPage(page);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Récupérer les builds validés uniquement
  const { builds, pagination, isLoading, mutate } = useBuilds({
    page: currentPage,
    limit: 10,
    rotation_id: selectedRotation || undefined,
    isValid: true, // Toujours seulement les builds validés pour les utilisateurs
    authenticated: false
  });

  // Ouvrir le modal de détail si un build est spécifié dans l'URL
  useEffect(() => {
    const buildParam = searchParams.get("build");
    if (buildParam && builds.length > 0 && !selectedBuild && isInitialLoad) {
      const build = builds.find((b) => b._id === buildParam);
      if (build) {
        setSelectedBuild(build);
        onDetailOpen();
        setIsInitialLoad(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builds, searchParams, isInitialLoad]);

  // Mettre à jour l'URL quand les filtres changent (sauf au chargement initial)
  useEffect(() => {
    if (isInitialLoad) return;

    const params = new URLSearchParams();
    
    if (selectedRotation) {
      params.set("rotation", selectedRotation);
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }
    if (selectedBuild?._id) {
      params.set("build", selectedBuild._id);
    }

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedRotation, currentPage, selectedBuild, setSearchParams, searchParams, isInitialLoad]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handleBuildCreated = () => {
    mutate();
  };

  const handleCreateBuild = () => {
    setBuildToEdit(null);
    onOpen();
  };

  const handleEditBuild = (build: IBuild, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Empêcher l'ouverture du détail
    }
    setBuildToEdit(build);
    onOpen();
  };

  const handleCloseModal = () => {
    setBuildToEdit(null);
    onClose();
  };

  const handleCloseDetailModal = () => {
    setSelectedBuild(null);
    onDetailClose();
    // Marquer que le chargement initial est terminé après la première interaction
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  };

  const handleOpenBuild = (build: IBuild) => {
    setSelectedBuild(build);
    onDetailOpen();
    // Marquer que le chargement initial est terminé après la première interaction
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  };

  // Vérifier si l'utilisateur peut éditer un build
  const canEditBuild = (build: IBuild) => {
    if (!currentUser) return false;
    return build.user_id === currentUser._id || currentUser.is_admin;
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4}>
          🛠️ Builds de la Communauté
        </Heading>
        <Text color="gray.600" mb={4}>
          Découvrez les meilleures compositions d'équipes validées par la
          communauté et partagez les vôtres !
        </Text>

        {!isAuthenticated && (
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Text fontSize="sm">
              Connectez-vous pour créer et partager vos propres builds avec la
              communauté.
            </Text>
          </Alert>
        )}
      </Box>

      {/* Filtres et création */}
      <Box
        bg={bgColor}
        p={4}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align={{ base: "stretch", md: "flex-end" }}
          justify="space-between"
        >
          <Box flex={1} maxW={{ base: "100%", md: "500px" }}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Filtrer par rotation
            </Text>
            <CustomSelect
              placeholder="Toutes les rotations"
              value={selectedRotation}
              onChange={(value) => {
                setSelectedRotation(value);
                setCurrentPage(1);
              }}
              isDisabled={isLoadingRotations}
              bg={bgColor}
              options={rotations.map((rotation) => ({
                value: rotation._id || '',
                label: `${rotation.killer} - ${rotation.attack}`,
                content: (
                  <HStack spacing={2} w="100%">
                    <Text fontWeight="medium">
                      {rotation.killer}
                    </Text>
                    <AttackTypeBadge attackType={rotation.attack} />
                    <AlterationImage alteration={rotation.alteration} size="16px" />
                  </HStack>
                )
              }))}
              renderSelected={(option) => {
                const rotation = rotations.find((r) => r._id === option.value);
                return rotation ? (
                  <HStack spacing={2}>
                    <Text>{rotation.killer}</Text>
                    <AttackTypeBadge attackType={rotation.attack} />
                    <AlterationImage alteration={rotation.alteration} size="16px" />
                  </HStack>
                ) : <Text>{option.label}</Text>;
              }}
              allowDeselect={true}
            />
          </Box>

          {isAuthenticated && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="orange"
              onClick={handleCreateBuild}
              isDisabled={!selectedRotation}
              size="md"
              flexShrink={0}
            >
              Créer un Build
            </Button>
          )}
        </Flex>

        {!selectedRotation && isAuthenticated && (
          <Flex align="center" gap={2} mt={3} color="orange.500">
            <Icon as={InfoIcon} />
            <Text fontSize="xs">
              Sélectionnez une rotation pour créer un build
            </Text>
          </Flex>
        )}
      </Box>

      {/* Titre de la section */}
      <Box
        bg={bgColor}
        p={4}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        {selectedRotation ? (
          <HStack spacing={3} justify="center">
            <Heading size="md">
              {rotations.find(r => r._id === selectedRotation)?.killer || 'Rotation'}
            </Heading>
            <AttackTypeBadge 
              attackType={rotations.find(r => r._id === selectedRotation)?.attack || ''} 
            />
            <AlterationImage 
              alteration={rotations.find(r => r._id === selectedRotation)?.alteration || ''} 
              size="24px" 
            />
          </HStack>
        ) : (
          <Heading size="md" textAlign="center">
            Tous les Builds
          </Heading>
        )}
      </Box>

      {/* Liste des builds */}
      {isLoading ? (
        <Flex justify="center" py={8}>
          <Spinner size="xl" color="orange.500" />
        </Flex>
      ) : builds.length === 0 ? (
        <Box
          bg={bgColor}
          p={8}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <Text color="gray.500">
            {selectedRotation
              ? "Aucun build trouvé pour cette rotation"
              : "Aucun build disponible. Sélectionnez une rotation pour voir les builds."}
          </Text>
        </Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {builds.map((build) => (
              <Card
                key={build._id}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{
                  boxShadow: "lg",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s"
                }}
                cursor="pointer"
                onClick={() => handleOpenBuild(build)}
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    {/* Rotation (seulement si aucun filtre) */}
                    {!selectedRotation && build.rotation && (
                      <Box>
                        <HStack spacing={2} justify="center">
                          <Text fontSize="sm" fontWeight="bold">
                            {rotations.find(r => r._id === build.rotation_id)?.killer || 'Rotation'}
                          </Text>
                          <AttackTypeBadge 
                            attackType={rotations.find(r => r._id === build.rotation_id)?.attack || ''} 
                          />
                          <AlterationImage 
                            alteration={rotations.find(r => r._id === build.rotation_id)?.alteration || ''} 
                            size="16px" 
                          />
                        </HStack>
                        <Divider mt={3} />
                      </Box>
                    )}

                    {/* En-tête avec créateur */}
                    <HStack justify="space-between">
                      {build.user ? (
                        <>
                          <UserDisplay user={build.user} />
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(build.created_at)}
                            </Text>
                            {canEditBuild(build) && (
                              <Tooltip label="Modifier ce build" placement="top">
                                <IconButton
                                  aria-label="Modifier le build"
                                  icon={<EditIcon />}
                                  size="xs"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={(e) => handleEditBuild(build, e)}
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          Anonyme
                        </Text>
                      )}
                    </HStack>

                    {/* Description */}
                    {build.description && (
                      <Box>
                        <Text fontSize="sm" whiteSpace="pre-wrap" noOfLines={3}>
                          {build.description}
                        </Text>
                      </Box>
                    )}

                    <Divider />

                    {/* Team - Avatars uniquement */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.500"
                        mb={2}
                      >
                        COMPOSITION
                      </Text>
                      <HStack spacing={3} justify="center">
                        {build.team?.slice(0, 3).map((member, idx) => (
                          <Avatar
                            key={idx}
                            size="lg"
                            src={
                              `${bucketUrl}/characters/thumb/${member.character?._id}.png`
                            }
                            name={member.character?.name || "?"}
                            bg="gray.200"
                          />
                        ))}
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

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

      <Divider my={8} />

      {/* Modal de création/édition */}
      {(selectedRotation || buildToEdit) && (
        <BuildCreationModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          rotationId={buildToEdit?.rotation_id || selectedRotation}
          onSuccess={handleBuildCreated}
          buildToEdit={buildToEdit}
        />
      )}

      {/* Modal de détails */}
      <BuildDetailModal 
        isOpen={isDetailOpen}
        onClose={handleCloseDetailModal}
        build={selectedBuild}
        onEdit={handleEditBuild}
      />
    </VStack>
  );
};

export { RotationsBuildsGuide };
