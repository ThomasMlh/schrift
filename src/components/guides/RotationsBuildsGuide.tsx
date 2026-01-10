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
  Select,
  useDisclosure,
  Alert,
  AlertIcon,
  Icon,
  SimpleGrid,
  Card,
  CardBody
} from "@chakra-ui/react";
import { useState } from "react";
import { AddIcon, InfoIcon } from "@chakra-ui/icons";
import { useBuilds, useRotations } from "../../hooks/useAPI";
import BuildCreationModal from "../ui/BuildCreationModal";
import { Pagination } from "../ui/Pagination";
import { jwtDecode } from "jwt-decode";
import { UserDisplay } from "../ui/UserDisplay";
import CustomLink from "../ui/CustomLink";
import { Link as RouterLink } from "react-router-dom";

const RotationsBuildsGuide = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Vérifier si l'utilisateur est connecté
  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return null;
      return jwtDecode(token) as any;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isAuthenticated = !!currentUser;

  // Récupérer toutes les rotations
  const { rotations, isLoading: isLoadingRotations } = useRotations();

  // Récupérer les builds validés uniquement
  const { builds, pagination, isLoading, mutate } = useBuilds({
    page: currentPage,
    limit: 10,
    rotation_id: selectedRotation || undefined,
    isValid: true, // Toujours seulement les builds validés pour les utilisateurs
    authenticated: false
  });

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
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
        >
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Filtrer par rotation
            </Text>
            <Select
              value={selectedRotation}
              onChange={(e) => {
                setSelectedRotation(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Toutes les rotations"
              size="sm"
              w={{ base: "full", md: "350px" }}
              isDisabled={isLoadingRotations}
            >
              {rotations.map((rotation) => (
                <option key={rotation._id} value={rotation._id}>
                  {rotation.killer} / {rotation.attack} / {rotation.alteration}
                </option>
              ))}
            </Select>
          </Box>

          {isAuthenticated && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="orange"
              onClick={onOpen}
              isDisabled={!selectedRotation}
              size="sm"
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
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    {/* En-tête avec créateur */}
                    <HStack justify="space-between">
                      {build.user ? (
                        <>
                          <UserDisplay user={build.user} />
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(build.created_at)}
                          </Text>
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
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {build.description}
                        </Text>
                      </Box>
                    )}

                    <Divider />

                    {/* Team */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.500"
                        mb={2}
                      >
                        COMPOSITION
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        {build.team?.slice(0, 3).map((member, idx) => (
                          <Box key={idx}>
                            <HStack spacing={3}>
                              <RouterLink
                                to={`/personnage/${member.id_character}`}
                              >
                                <Avatar
                                  size="md"
                                  src={
                                    member.character?.image ||
                                    member.character?.link
                                  }
                                  name={member.character?.name || "?"}
                                  bg="gray.200"
                                  cursor="pointer"
                                  _hover={{ opacity: 0.8 }}
                                />
                              </RouterLink>
                              <VStack align="start" spacing={1} flex={1}>
                                <CustomLink
                                  to={`/personnage/${member.id_character}`}
                                  text={member.character?.name || "Personnage inconnu"}
                                />
                              </VStack>
                            </HStack>
                            {member.links && member.links.length > 0 && (
                              <HStack spacing={2} mt={2} ml={14}>
                                {member.links.map((link, linkIdx) => (
                                  <RouterLink
                                    key={linkIdx}
                                    to={`/personnage/${link.id_character}`}
                                  >
                                    <Avatar
                                      size="sm"
                                      src={
                                        link.character?.image ||
                                        link.character?.link
                                      }
                                      name={link.character?.name || "?"}
                                      bg="gray.100"
                                      cursor="pointer"
                                      _hover={{ opacity: 0.8 }}
                                    />
                                  </RouterLink>
                                ))}
                              </HStack>
                            )}
                          </Box>
                        ))}
                      </VStack>
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

      {/* Modal de création */}
      {selectedRotation && (
        <BuildCreationModal
          isOpen={isOpen}
          onClose={onClose}
          rotationId={selectedRotation}
          onSuccess={handleBuildCreated}
        />
      )}
    </VStack>
  );
};

export { RotationsBuildsGuide };
