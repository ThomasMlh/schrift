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
  Badge,
  useColorMode,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AddIcon, EditIcon, CalendarIcon } from "@chakra-ui/icons";
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

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const { t } = useTranslation();
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
    <VStack spacing={5} align="stretch">

      {/* Header: title + create button */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="sm" mb={1}>
            {t("components.rotationsBuildsGuide.heading")}
          </Heading>
          <Text fontSize="xs" color={mutedText}>
            {t("components.rotationsBuildsGuide.description")}
          </Text>
        </Box>
        {isAuthenticated && (
          <Tooltip
            label={!selectedRotation ? t("components.rotationsBuildsGuide.selectRotationHint") : ""}
            placement="top"
            hasArrow
            isDisabled={!!selectedRotation}
          >
            <Button
              leftIcon={<AddIcon />}
              colorScheme="orange"
              onClick={handleCreateBuild}
              isDisabled={!selectedRotation}
              size="sm"
              flexShrink={0}
            >
              {t("components.rotationsBuildsGuide.buttonCreate")}
            </Button>
          </Tooltip>
        )}
      </Flex>

      {!isAuthenticated && (
        <Alert status="info" borderRadius="lg" fontSize="sm" py={2}>
          <AlertIcon />
          {t("components.rotationsBuildsGuide.loginAlert")}
        </Alert>
      )}

      {/* Filtre rotation */}
      <Box
        bg={bgColor}
        p={4}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText} mb={3}>
          {t("components.rotationsBuildsGuide.filterLabel")}
        </Text>
        <CustomSelect
          placeholder={t("components.rotationsBuildsGuide.filterPlaceholder")}
          value={selectedRotation}
          onChange={(value) => {
            setSelectedRotation(value);
            setCurrentPage(1);
          }}
          isDisabled={isLoadingRotations}
          bg={bgColor}
          options={rotations.map((rotation) => ({
            value: rotation._id || '',
            label: `${t(`factions.${rotation.killer}`, rotation.killer)} - ${t(`attackTypes.${rotation.attack}`, rotation.attack)}`,
            content: (
              <HStack spacing={2} w="100%">
                <Text fontWeight="medium">{t(`factions.${rotation.killer}`, rotation.killer)}</Text>
                <AttackTypeBadge attackType={rotation.attack} />
                <AlterationImage alteration={rotation.alteration} size="16px" />
              </HStack>
            )
          }))}
          renderSelected={(option) => {
            const rotation = rotations.find((r) => r._id === option.value);
            return rotation ? (
              <HStack spacing={2}>
                <Text>{t(`factions.${rotation.killer}`, rotation.killer)}</Text>
                <AttackTypeBadge attackType={rotation.attack} />
                <AlterationImage alteration={rotation.alteration} size="16px" />
              </HStack>
            ) : <Text>{option.label}</Text>;
          }}
          allowDeselect={true}
        />
        {selectedRotation && (
          <HStack spacing={3} mt={3} pt={3} borderTopWidth="1px" borderTopColor={borderColor}>
            <Heading size="sm">
              {t(`factions.${rotations.find(r => r._id === selectedRotation)?.killer}`, rotations.find(r => r._id === selectedRotation)?.killer || 'Rotation')}
            </Heading>
            <AttackTypeBadge
              attackType={rotations.find(r => r._id === selectedRotation)?.attack || ''}
            />
            <AlterationImage
              alteration={rotations.find(r => r._id === selectedRotation)?.alteration || ''}
              size="20px"
            />
          </HStack>
        )}
      </Box>

      {/* Liste des builds */}
      {isLoading ? (
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="orange.500" thickness="4px" />
        </Flex>
      ) : builds.length === 0 ? (
        <Box
          bg={bgColor}
          p={8}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <Text fontSize="2xl" mb={3}>🔍</Text>
          <Text color={mutedText} fontSize="sm">
            {selectedRotation
              ? t("components.rotationsBuildsGuide.noBuildsForRotation")
              : t("components.rotationsBuildsGuide.noBuildsAvailable")}
          </Text>
        </Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {builds.map((build) => {
              const rotation = rotations.find(r => r._id === build.rotation_id);
              return (
                <Card
                  key={build._id}
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: isDark ? "orange.700" : "orange.300",
                    boxShadow: `0 0 16px rgba(251,146,60,0.15), 0 4px 12px rgba(0,0,0,0.1)`,
                    transform: "translateY(-2px)",
                  }}
                  cursor="pointer"
                  onClick={() => handleOpenBuild(build)}
                >
                  {/* Header card — rotation info */}
                  <Box
                    px={4}
                    py={3}
                    bg={isDark ? "rgba(251,146,60,0.06)" : "orange.50"}
                    borderBottomWidth="1px"
                    borderBottomColor={isDark ? "whiteAlpha.100" : "orange.100"}
                  >
                    {rotation ? (
                      <HStack spacing={2} justify="space-between">
                        <HStack spacing={2} minW={0}>
                          <Text fontSize="sm" fontWeight="bold" noOfLines={1} color={isDark ? "orange.300" : "orange.600"}>
                            {t(`factions.${rotation.killer}`, rotation.killer)}
                          </Text>
                          <AttackTypeBadge attackType={rotation.attack} />
                          <AlterationImage alteration={rotation.alteration} size="16px" />
                        </HStack>
                        {canEditBuild(build) && (
                          <Tooltip label={t("common.edit")} placement="top">
                            <IconButton
                              aria-label={t("components.rotationsBuildsGuide.ariaEditBuild")}
                              icon={<EditIcon />}
                              size="xs"
                              colorScheme="orange"
                              variant="ghost"
                              onClick={(e) => handleEditBuild(build, e)}
                              flexShrink={0}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color={mutedText} fontStyle="italic">
                        {t("components.rotationsBuildsGuide.titleAllBuilds")}
                      </Text>
                    )}
                  </Box>

                  <CardBody p={4}>
                    <VStack align="stretch" spacing={4}>
                      {/* Auteur + date */}
                      <HStack justify="space-between" align="center">
                        {build.user ? (
                          <UserDisplay user={build.user} />
                        ) : (
                          <Badge colorScheme="gray" variant="subtle" fontSize="xs">{t("components.rotationsBuildsGuide.anonymous")}</Badge>
                        )}
                        <HStack spacing={1} color={mutedText} flexShrink={0}>
                          <Icon as={CalendarIcon} boxSize={3} />
                          <Text fontSize="xs">{formatDate(build.created_at)}</Text>
                        </HStack>
                      </HStack>

                      {/* Description */}
                      {build.description && (
                        <Text fontSize="sm" color={isDark ? "gray.300" : "gray.600"} noOfLines={3} lineHeight="short">
                          {build.description}
                        </Text>
                      )}

                      <Divider borderColor={borderColor} />

                      {/* Team composition */}
                      <Box>
                        <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color={mutedText} mb={2}>
                          {t("components.rotationsBuildsGuide.composition")}
                        </Text>
                        <HStack spacing={2} justify="center">
                          {build.team?.slice(0, 3).map((member, idx) => (
                            <Tooltip key={idx} label={member.character?.name || "?"} placement="top" hasArrow>
                              <Avatar
                                size="lg"
                                src={`${bucketUrl}/characters/thumb/${member.character?._id}.png`}
                                name={member.character?.name || "?"}
                                bg={isDark ? "gray.700" : "gray.200"}
                                borderWidth="2px"
                                borderColor={isDark ? "whiteAlpha.200" : "gray.300"}
                              />
                            </Tooltip>
                          ))}
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
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
