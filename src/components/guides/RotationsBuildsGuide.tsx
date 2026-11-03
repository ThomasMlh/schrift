import {
  VStack,
  Box,
  Text,
  Flex,
  Divider,
  Heading,
  Button,
  HStack,
  useDisclosure,
  Alert,
  AlertIcon,
  Icon,
  Tooltip,
  Link,
  IconButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AddIcon } from "@chakra-ui/icons";
import { useBuilds, useCycles, useRotations } from "../../hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { FiCheckCircle, FiGrid, FiList, FiSearch } from "react-icons/fi";
import { useMyAlbum } from "@/hooks/useMyAlbum";
import { albumTabUrl } from "@/utils/buildOwnership";
import BuildCreationModal from "../ui/BuildCreationModal";
import { BuildDetailModal } from "../ui/BuildDetailModal";
import { Pagination } from "../ui/Pagination";
import { useAuth } from "../../providers/AuthProvider";
import { CustomSelect } from "../ui/CustomSelect";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { AlterationImage } from "../ui/AlterationImage";
import type { IBuild } from "../../interfaces";
import { PageLoader } from "../ui/PageLoader";
import { BuildRow } from "./BuildRow";
import { BuildCard } from "./BuildCard";

type BuildListLayout = "cards" | "rows";

const LAYOUT_KEY = "rotationsBuildsGuide.layout";

const readLayout = (): BuildListLayout => {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "rows" ? "rows" : "cards";
  } catch {
    return "cards";
  }
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

  const { accounts, account, owned, hasAlbum, isLoading: isLoadingAlbum, selectAccount } = useMyAlbum();
  const [playableOnly, setPlayableOnly] = useState(false);
  const isPlayableFilterOn = playableOnly && hasAlbum && !!account;

  const [layout, setLayout] = useState<BuildListLayout>(readLayout);
  const changeLayout = (next: BuildListLayout) => {
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      // Storage unavailable: the choice only applies to this session
    }
  };

  const { rotations, isLoading: isLoadingRotations } = useRotations();
  const { cycles, isLoading: isLoadingCycles } = useCycles({ limit: 5 });
  const { currentRotation } = useCurrentRotation(cycles, isLoadingCycles);

  const activeRotation = useMemo(
    () => (selectedRotation ? rotations.find((r) => r._id === selectedRotation) : undefined),
    [selectedRotation, rotations]
  );

  // Initialize from the URL
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

  const sortByScore = !!selectedRotation || isPlayableFilterOn;
  const { builds, pagination, isLoading, mutate } = useBuilds({
    page: currentPage,
    limit: 10,
    rotation_id: selectedRotation || undefined,
    isValid: true,
    playable_by: isPlayableFilterOn ? account?.bbs_id : undefined,
    // Most recent first without a filter, best score first as soon as one applies
    sort: sortByScore ? "score" : "recent",
    authenticated: false,
  });

  // Open the detail modal from the URL
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

  // Keep the URL in sync
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

        {account && (
          <Flex gap={3} mt={3} align="center" wrap="wrap">
            <Tooltip label={t("components.buildOwnership.fillAlbumFirst")} hasArrow isDisabled={hasAlbum}>
              <Button
                size="sm"
                variant={isPlayableFilterOn ? "solid" : "outline"}
                colorScheme="purple"
                leftIcon={<Icon as={FiCheckCircle} />}
                onClick={() => { setPlayableOnly(!playableOnly); setCurrentPage(1); }}
                isDisabled={!hasAlbum}
                aria-pressed={isPlayableFilterOn}
              >
                {t("components.buildOwnership.playableFilter")}
              </Button>
            </Tooltip>
            {accounts.length > 1 && (
              <Box w="200px">
                <CustomSelect
                  size="sm"
                  value={account.bbs_id}
                  onChange={(bbsId) => { selectAccount(bbsId); setCurrentPage(1); }}
                  options={accounts.map((a) => ({ value: a.bbs_id, label: a.bbs_name || a.bbs_id }))}
                  allowDeselect={false}
                />
              </Box>
            )}
            {hasAlbum && (
              <Text fontSize="xs" color={mutedText}>{t("components.buildOwnership.legend")}</Text>
            )}
          </Flex>
        )}

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

      {account && !hasAlbum && !isLoadingAlbum && (
        <Alert status="info" borderRadius="lg" fontSize="sm" py={2}>
          <AlertIcon />
          <Text>
            {t("components.buildOwnership.fillAlbumHint")}{" "}
            <Link as={RouterLink} to={albumTabUrl(account)} color="accent" fontWeight="semibold">
              {t("components.buildOwnership.fillAlbumLink")}
            </Link>
          </Text>
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert status="info" borderRadius="lg" fontSize="sm" py={2}>
          <AlertIcon />
          {t("components.rotationsBuildsGuide.loginAlert")}
        </Alert>
      )}

      {isLoading ? (
        <PageLoader color="purple.400" height="250px" />
      ) : builds.length === 0 ? (
        <Box
          bg={bgColor} p={8} borderRadius="xl" borderWidth="1px"
          borderColor={borderColor} textAlign="center"
        >
          <Icon as={FiSearch} boxSize={8} color="text.muted" mb={3} />
          <Text color={mutedText} fontSize="sm">
            {isPlayableFilterOn
              ? t("components.buildOwnership.noPlayableBuild")
              : selectedRotation
              ? t("components.rotationsBuildsGuide.noBuildsForRotation")
              : t("components.rotationsBuildsGuide.noBuildsAvailable")}
          </Text>
        </Box>
      ) : (
        <>
          <Flex justify="space-between" align="center" gap={3}>
            <Text fontSize="xs" color={mutedText}>
              {t(sortByScore ? "components.rotationsBuildsGuide.sortScore" : "components.rotationsBuildsGuide.sortRecent")}
            </Text>
            <HStack spacing={0.5} flexShrink={0}>
              {([["cards", "layoutCards", FiGrid], ["rows", "layoutRows", FiList]] as const).map(([mode, labelKey, ModeIcon]) => {
                const label = t(`components.rotationsBuildsGuide.${labelKey}`);
                return (
                  <Tooltip key={mode} label={label} placement="top" hasArrow openDelay={400}>
                    <IconButton
                      aria-label={label}
                      aria-pressed={layout === mode}
                      icon={<Icon as={ModeIcon} />}
                      size="sm"
                      variant={layout === mode ? "solid" : "ghost"}
                      colorScheme={layout === mode ? "purple" : "gray"}
                      onClick={() => changeLayout(mode)}
                    />
                  </Tooltip>
                );
              })}
            </HStack>
          </Flex>

          {layout === "cards" ? (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              {builds.map((build) => (
                <BuildCard
                  key={build._id}
                  build={build}
                  rotation={rotations.find((r) => r._id === build.rotation_id)}
                  canEdit={Boolean(canEditBuild(build))}
                  onOpen={handleOpenBuild}
                  onEdit={handleEditBuild}
                  owned={hasAlbum ? owned : undefined}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" overflow="hidden">
              <VStack spacing={0} align="stretch" divider={<Divider borderColor="border.subtle" />}>
                {builds.map((build) => (
                  <BuildRow
                    key={build._id}
                    build={build}
                    rotation={rotations.find((r) => r._id === build.rotation_id)}
                    canEdit={Boolean(canEditBuild(build))}
                    onOpen={handleOpenBuild}
                    onEdit={handleEditBuild}
                    owned={hasAlbum ? owned : undefined}
                  />
                ))}
              </VStack>
            </Box>
          )}

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
