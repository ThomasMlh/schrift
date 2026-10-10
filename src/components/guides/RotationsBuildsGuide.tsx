import {
  VStack,
  Box,
  Text,
  Flex,
  Divider,
  Heading,
  Button,
  HStack,
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
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AddIcon, EditIcon, CalendarIcon } from "@chakra-ui/icons";
import { useBuilds, useCycles, useRotations } from "../../hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { FiSearch } from "react-icons/fi";
import BuildCreationModal from "../ui/BuildCreationModal";
import { BuildDetailModal } from "../ui/BuildDetailModal";
import { Pagination } from "../ui/Pagination";
import { useAuth } from "../../providers/AuthProvider";
import { UserDisplay } from "../ui/UserDisplay";
import { CustomSelect } from "../ui/CustomSelect";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { AlterationImage } from "../ui/AlterationImage";
import type { IBuild } from "../../interfaces";
import { PageLoader } from "../ui/PageLoader";
import { bucketUrl } from "../../utils/apiRequest";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const RotationsBuildsGuide = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState<string>("");
  const [selectedBuild, setSelectedBuild] = useState<IBuild | null>(null);
  const [buildToEdit, setBuildToEdit] = useState<IBuild | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const mutedText = "text.muted";

  const { t } = useTranslation();

  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  const { rotations, isLoading: isLoadingRotations } = useRotations();
  const { cycles, isLoading: isLoadingCycles } = useCycles({ limit: 5 });
  const { currentRotation } = useCurrentRotation(cycles, isLoadingCycles);

  const activeRotation = useMemo(
    () => (selectedRotation ? rotations.find((r) => r._id === selectedRotation) : undefined),
    [selectedRotation, rotations]
  );

  // Init from URL
  useEffect(() => {
    const rotationParam = searchParams.get("rotation");
    const pageParam = searchParams.get("page");
    if (rotationParam && rotationParam !== selectedRotation) setSelectedRotation(rotationParam);
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page !== currentPage) setCurrentPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { builds, pagination, isLoading, mutate } = useBuilds({
    page: currentPage,
    limit: 10,
    rotation_id: selectedRotation || undefined,
    isValid: true,
    authenticated: false,
  });

  // Open detail modal from URL
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

  // Sync URL
  useEffect(() => {
    if (isInitialLoad) return;
    const params = new URLSearchParams();
    if (selectedRotation) params.set("rotation", selectedRotation);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (selectedBuild?._id) params.set("build", selectedBuild._id);
    const newSearch = params.toString();
    if (newSearch !== searchParams.toString()) setSearchParams(params, { replace: true });
  }, [selectedRotation, currentPage, selectedBuild, setSearchParams, searchParams, isInitialLoad]);

  const handleBuildCreated = () => mutate();

  const handleCreateBuild = () => {
    setBuildToEdit(null);
    onOpen();
  };

  const handleEditBuild = (build: IBuild, e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    if (isInitialLoad) setIsInitialLoad(false);
  };

  const handleOpenBuild = (build: IBuild) => {
    setSelectedBuild(build);
    onDetailOpen();
    if (isInitialLoad) setIsInitialLoad(false);
  };

  const canEditBuild = (build: IBuild) =>
    !!currentUser && (build.user_id === currentUser._id || currentUser.is_admin);

  return (
    <VStack spacing={5} align="stretch">

      {/* Toolbar: filter + create */}
      <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={4}>
        <Flex gap={3} align="flex-end" wrap="wrap">
          <Box flex={1} minW="200px">
            <Text
              fontSize="xs" fontWeight="semibold" textTransform="uppercase"
              letterSpacing="widest" color={mutedText} mb={2}
            >
              {t("components.rotationsBuildsGuide.filterLabel")}
            </Text>
            <CustomSelect
              placeholder={t("components.rotationsBuildsGuide.filterPlaceholder")}
              value={selectedRotation}
              onChange={(value) => { setSelectedRotation(value); setCurrentPage(1); }}
              isDisabled={isLoadingRotations}
              options={rotations.map((r) => ({
                value: r._id || "",
                label: `${t(`factions.${r.killer}`, r.killer)} - ${t(`attackTypes.${r.attack}`, r.attack)}`,
                content: (
                  <HStack spacing={2} w="100%">
                    <Text fontWeight="medium">{t(`factions.${r.killer}`, r.killer)}</Text>
                    <AttackTypeBadge attackType={r.attack} />
                    <AlterationImage alteration={r.alteration} size="16px" />
                  </HStack>
                ),
              }))}
              renderSelected={(option) => {
                const r = rotations.find((r) => r._id === option.value);
                return r ? (
                  <HStack spacing={2}>
                    <Text>{t(`factions.${r.killer}`, r.killer)}</Text>
                    <AttackTypeBadge attackType={r.attack} />
                    <AlterationImage alteration={r.alteration} size="16px" />
                  </HStack>
                ) : (
                  <Text>{option.label}</Text>
                );
              }}
              allowDeselect
            />
          </Box>

          {currentRotation?.rotation_id && (
            <Button
              size="sm"
              flexShrink={0}
              variant={selectedRotation === currentRotation.rotation_id ? "solid" : "outline"}
              colorScheme="purple"
              leftIcon={<AttackTypeBadge attackType={currentRotation.attack} size="10px" />}
              onClick={() => {
                setSelectedRotation(selectedRotation === currentRotation.rotation_id ? "" : currentRotation.rotation_id);
                setCurrentPage(1);
              }}
              aria-pressed={selectedRotation === currentRotation.rotation_id}
            >
              {t("components.rotationsBuildsGuide.currentRotation")}
            </Button>
          )}
          {isAuthenticated && (
            <Tooltip
              label={!selectedRotation ? t("components.rotationsBuildsGuide.selectRotationHint") : ""}
              placement="top"
              hasArrow
              isDisabled={!!selectedRotation}
            >
              <Button
                leftIcon={<AddIcon />}
                colorScheme="purple"
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

        {/* Active rotation info */}
        {activeRotation && (
          <HStack spacing={2} mt={3} pt={3} borderTopWidth="1px" borderTopColor={borderColor}>
            <Heading size="sm">
              {t(`factions.${activeRotation.killer}`, activeRotation.killer)}
            </Heading>
            <AttackTypeBadge attackType={activeRotation.attack} />
            <AlterationImage alteration={activeRotation.alteration} size="20px" />
          </HStack>
        )}
      </Box>

      {!isAuthenticated && (
        <Alert status="info" borderRadius="lg" fontSize="sm" py={2}>
          <AlertIcon />
          {t("components.rotationsBuildsGuide.loginAlert")}
        </Alert>
      )}

      {/* Build list */}
      {isLoading ? (
        <PageLoader color="purple.400" height="250px" />
      ) : builds.length === 0 ? (
        <Box
          bg={bgColor} p={8} borderRadius="xl" borderWidth="1px"
          borderColor={borderColor} textAlign="center"
        >
          <Icon as={FiSearch} boxSize={8} color="text.muted" mb={3} />
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
              const rotation = rotations.find((r) => r._id === build.rotation_id);
              return (
                <Card
                  key={build._id}
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.2s ease"
                  _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
                  cursor="pointer"
                  onClick={() => handleOpenBuild(build)}
                >
                  {/* Card header — rotation */}
                  <Box
                    px={4} py={3}
                    bg="bg.subtle"
                    borderBottomWidth="1px"
                    borderBottomColor="border.subtle"
                  >
                    {rotation ? (
                      <HStack spacing={2} justify="space-between">
                        <HStack spacing={2} minW={0}>
                          <Text fontSize="sm" fontWeight="bold" noOfLines={1} color="text.strong">
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
                    <VStack align="stretch" spacing={3}>
                      {/* Author + date */}
                      <HStack justify="space-between" align="center">
                        {build.user ? (
                          <UserDisplay user={build.user} />
                        ) : (
                          <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                            {t("components.rotationsBuildsGuide.anonymous")}
                          </Badge>
                        )}
                        <HStack spacing={1} color={mutedText} flexShrink={0}>
                          <Icon as={CalendarIcon} boxSize={3} />
                          <Text fontSize="xs">{formatDate(build.created_at)}</Text>
                        </HStack>
                      </HStack>

                      {/* Description */}
                      {build.description && (
                        <Text
                          fontSize="sm"
                          color="text.secondary"
                          noOfLines={3}
                          lineHeight="short"
                        >
                          {build.description}
                        </Text>
                      )}

                      <Divider borderColor={borderColor} />

                      {/* Composition */}
                      <Box>
                        <Text
                          fontSize="2xs" fontWeight="bold" textTransform="uppercase"
                          letterSpacing="widest" color={mutedText} mb={2}
                        >
                          {t("components.rotationsBuildsGuide.composition")}
                        </Text>
                        <HStack spacing={2} align="flex-start">
                          {build.team?.slice(0, 3).map((member, idx) => {
                            const positionColors = ["purple", "blue", "teal"] as const;
                            const posColor = positionColors[idx % 3];
                            return (
                              <VStack key={idx} spacing={1} flex={1} align="center" minW={0}>
                                <Box position="relative">
                                  <Tooltip label={member.character?.name || "?"} placement="top" hasArrow>
                                    <Avatar
                                      size="lg"
                                      borderRadius="xl"
                                      src={`${bucketUrl}/characters/thumb/${member.character?._id}.png`}
                                      name={member.character?.name || "?"}
                                      bg="bg.inset"
                                      borderWidth="2px"
                                      borderColor={`${posColor}.400`}
                                    />
                                  </Tooltip>
                                  <Badge
                                    position="absolute"
                                    top="-4px"
                                    left="-4px"
                                    colorScheme={posColor}
                                    borderRadius="full"
                                    fontSize="2xs"
                                    px={1}
                                    lineHeight="16px"
                                    minW="16px"
                                    textAlign="center"
                                    zIndex={1}
                                  >
                                    {member.position}
                                  </Badge>
                                </Box>
                                <Text fontSize="2xs" fontWeight="medium" noOfLines={1} textAlign="center" w="full">
                                  {member.character?.name || "?"}
                                </Text>
                                {member.links && member.links.length > 0 && (
                                  <HStack spacing={0.5} flexWrap="wrap" justify="center">
                                    {member.links.slice(0, 3).map((link, lIdx) => (
                                      <Tooltip key={lIdx} label={link.character?.name || "?"} placement="top" hasArrow>
                                        <Avatar
                                          size="xs"
                                          src={`${bucketUrl}/characters/thumb/${link.character?._id}.png`}
                                          name={link.character?.name || "?"}
                                          bg="bg.inset"
                                          borderWidth="1px"
                                          borderColor="border.subtle"
                                        />
                                      </Tooltip>
                                    ))}
                                  </HStack>
                                )}
                              </VStack>
                            );
                          })}
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

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

      {/* Modals */}
      {(selectedRotation || buildToEdit) && (
        <BuildCreationModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          rotationId={buildToEdit?.rotation_id || selectedRotation}
          onSuccess={handleBuildCreated}
          buildToEdit={buildToEdit ?? undefined}
        />
      )}

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
