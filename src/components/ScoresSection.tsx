import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  VStack,
  HStack,
  IconButton,
  Text,
  useDisclosure,
  Button,
  Card,
  CardBody,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  Box,
  Heading,
  Tooltip
} from "@chakra-ui/react";
import { FiTool } from "react-icons/fi";
import type { IScore } from "../interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import ScoresTable from "./ui/ScoresTable";
import { useCycles, useUsers, useGuilds, useScores } from "@/hooks/useAPI";
import { useScoreManagement } from "@/hooks/useScoreManagement";
import { ScoresStatsCards } from "./scores/ScoresStatsCards";
import { ScoresFilters } from "./scores/ScoresFilters";
import { ScoreModals } from "./scores/ScoreModals";
import { useTranslation } from "react-i18next";

const ScoresSection = () => {
  const [scoreSearchQuery, setScoreSearchQuery] = useState("");
  const [filterCycleId, setFilterCycleId] = useState("");
  const [filterRotationId, setFilterRotationId] = useState("");
  const [filterGuildId, setFilterGuildId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  // Hooks de données
  const navigate = useNavigate();
  const { cycles, isLoading: isLoadingCycles } = useCycles({
    authenticated: true
  });
  const { users } = useUsers({ authenticated: true, limit: 1000 });
  const { guilds } = useGuilds(true);
  const {
    scores,
    pagination,
    isLoading: isLoadingScores,
    mutate: mutateScores
  } = useScores({
    page: currentPage,
    limit: 20,
    search: scoreSearchQuery,
    cycle_id: filterCycleId || undefined,
    rotation_id: filterRotationId || undefined,
    guild_id: filterGuildId || undefined,
    authenticated: true
  });

  const { isOpen, onClose } = useDisclosure();
  const { currentUser, isAdmin, isGuildManager } = useAuth();

  // Hook de gestion des scores
  const scoreManagement = useScoreManagement({ users, cycles, onClose });

  // Gestion des filtres
  const handleCycleFilterChange = (cycleId: string) => {
    setFilterCycleId(cycleId);
    setFilterRotationId("");
    setCurrentPage(1);
  };

  const handleRotationFilterChange = (rotationId: string) => {
    setFilterRotationId(rotationId);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setScoreSearchQuery(search);
    setCurrentPage(1);
  };

  const handleGuildFilterChange = (guildId: string) => {
    setFilterGuildId(guildId);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterCycleId("");
    setFilterRotationId("");
    setFilterGuildId("");
    setScoreSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Données dérivées
  const selectedCycle = cycles.find((c) => c._id === filterCycleId);
  const availableRotations = selectedCycle?.rotations || [];
  const activeFiltersCount = [
    scoreSearchQuery,
    filterCycleId,
    filterRotationId,
    filterGuildId
  ].filter(Boolean).length;

  const getUserInfo = (userId: string) =>
    users.find((user) => user._id === userId);
  const getCycleInfo = (cycleId: string) =>
    cycles.find((cycle) => cycle._id === cycleId);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* En-tête */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={1}>
              {t("components.scoresSection.heading")}
            </Heading>
            {pagination && (
              <Text fontSize="sm" color="gray.500">
                {pagination.totalCount.toLocaleString()} {t("components.scoresSection.scoresCount")}
              </Text>
            )}
          </Box>
          {(isAdmin || isGuildManager) && (
            <HStack spacing={3}>
              <Button
                colorScheme="blue"
                onClick={() => scoreManagement.setIsOCRModalOpen(true)}
                isDisabled={!currentUser}
                size="lg"
              >
                {t("components.scoresSection.buttonAutoEntry")}
              </Button>
              <Button
                colorScheme="green"
                onClick={() => scoreManagement.setIsBulkModalOpen(true)}
                isDisabled={!currentUser}
                size="lg"
              >
                {t("components.scoresSection.buttonManualEntry")}
              </Button>
              {isAdmin && (
                <Tooltip
                  label="Outils de debug OCR"
                  aria-label="Outils de debug OCR"
                >
                  <IconButton
                    aria-label="OCR Debug"
                    icon={<FiTool />}
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/ocr-debug")}
                  />
                </Tooltip>
              )}
            </HStack>
          )}
        </Flex>

        {/* Stats rapides */}
        <ScoresStatsCards
          pagination={pagination}
          activeFiltersCount={activeFiltersCount}
          isLoadingScores={isLoadingScores}
          onRefresh={mutateScores}
        />

        {/* Section Filtres */}
        <ScoresFilters
          scoreSearchQuery={scoreSearchQuery}
          filterCycleId={filterCycleId}
          filterRotationId={filterRotationId}
          filterGuildId={filterGuildId}
          cycles={cycles}
          guilds={guilds}
          availableRotations={availableRotations}
          activeFiltersCount={activeFiltersCount}
          isLoadingCycles={isLoadingCycles}
          pagination={pagination}
          onSearchChange={handleSearchChange}
          onCycleChange={handleCycleFilterChange}
          onRotationChange={handleRotationFilterChange}
          onGuildChange={handleGuildFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Liste des scores */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {isLoadingScores ? (
                <Flex justify="center" p={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : !Array.isArray(scores) || scores.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  {t("components.scoresSection.noScores")}
                </Alert>
              ) : (
                <ScoresTable
                  scores={scores}
                  users={users}
                  cycles={cycles}
                  isAdmin={isAdmin}
                  isGuildManager={isGuildManager}
                  onEditScore={scoreManagement.handleEditScore}
                  onDeleteScore={(score: IScore) => {
                    scoreManagement.setScoreToDelete(score);
                    scoreManagement.setIsDeleteModalOpen(true);
                  }}
                />
              )}

              {/* Pagination */}
              {pagination && (
                <PaginationComponent
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasPrevPage={pagination.hasPrevPage}
                  hasNextPage={pagination.hasNextPage}
                  onPageChange={handlePageChange}
                  totalCount={pagination.totalCount}
                  itemsOnPage={pagination.itemsOnPage}
                />
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Modals */}
        <ScoreModals
          isOpen={isOpen}
          onClose={onClose}
          isEditModalOpen={scoreManagement.isEditModalOpen}
          onEditModalClose={() => {
            scoreManagement.setIsEditModalOpen(false);
            scoreManagement.resetForm();
          }}
          isDeleteModalOpen={scoreManagement.isDeleteModalOpen}
          onDeleteModalClose={() => {
            scoreManagement.setIsDeleteModalOpen(false);
            scoreManagement.setScoreToDelete(null);
          }}
          onDeleteConfirm={scoreManagement.handleDeleteScore}
          isDeleting={scoreManagement.isDeleting}
          scoreToDelete={scoreManagement.scoreToDelete}
          isBulkModalOpen={scoreManagement.isBulkModalOpen}
          onBulkModalClose={() => scoreManagement.setIsBulkModalOpen(false)}
          onBulkSubmit={scoreManagement.handleBulkScoreSubmit}
          isBulkSubmitting={scoreManagement.isBulkSubmitting}
          isGuildRestricted={!isAdmin && isGuildManager}
          userGuildId={currentUser?.guilde_id}
          isOCRModalOpen={scoreManagement.isOCRModalOpen}
          onOCRModalClose={() => scoreManagement.setIsOCRModalOpen(false)}
          users={users}
          cycles={cycles}
          guilds={guilds}
          isLoadingCycles={isLoadingCycles}
          selectedUserId={scoreManagement.selectedUserId}
          setSelectedUserId={scoreManagement.setSelectedUserId}
          selectedCycleId={scoreManagement.selectedCycleId}
          setSelectedCycleId={scoreManagement.setSelectedCycleId}
          selectedRotationId={scoreManagement.selectedRotationId}
          setSelectedRotationId={scoreManagement.setSelectedRotationId}
          scoreValue={scoreManagement.scoreValue}
          setScoreValue={scoreManagement.setScoreValue}
          userSearchQuery={scoreManagement.userSearchQuery}
          setUserSearchQuery={scoreManagement.setUserSearchQuery}
          onSubmitScore={() => scoreManagement.handleSubmitScore(currentUser)}
          onUpdateScore={scoreManagement.handleUpdateScore}
          isSubmitting={scoreManagement.isSubmitting}
          isUpdating={scoreManagement.isUpdating}
          getUserInfo={getUserInfo}
          getCycleInfo={getCycleInfo}
        />
      </VStack>
    </Container>
  );
};

export default ScoresSection;
