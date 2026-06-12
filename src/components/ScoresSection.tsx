import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
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
  const [filterCycleId, setFilterCycleId]       = useState("");
  const [filterRotationId, setFilterRotationId] = useState("");
  const [filterGuildId, setFilterGuildId]       = useState("");
  const [currentPage, setCurrentPage]           = useState(1);
  const { t } = useTranslation();

  const router = useRouter();
  const { cycles, isLoading: isLoadingCycles } = useCycles({ authenticated: true });
  const { users }  = useUsers({ authenticated: true, limit: 1000 });
  const { guilds } = useGuilds(true);
  const { scores, pagination, isLoading: isLoadingScores } = useScores({
    page: currentPage,
    limit: 20,
    search: scoreSearchQuery,
    cycle_id:    filterCycleId    || undefined,
    rotation_id: filterRotationId || undefined,
    guild_id:    filterGuildId    || undefined,
    authenticated: true
  });

  const { isOpen, onClose }                     = useDisclosure();
  const { isOpen: isTransferModalOpen, onOpen: onTransferModalOpen, onClose: onTransferModalClose } = useDisclosure();
  const { currentUser, isAdmin, isGuildManager } = useAuth();
  const scoreManagement = useScoreManagement({ users, cycles, onClose });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCycleFilterChange    = (id: string) => { setFilterCycleId(id); setFilterRotationId(""); setCurrentPage(1); };
  const handleRotationFilterChange = (id: string) => { setFilterRotationId(id); setCurrentPage(1); };
  const handleSearchChange         = (s: string)  => { setScoreSearchQuery(s); setCurrentPage(1); };
  const handleGuildFilterChange    = (id: string) => { setFilterGuildId(id); setCurrentPage(1); };
  const handleResetFilters         = () => { setFilterCycleId(""); setFilterRotationId(""); setFilterGuildId(""); setScoreSearchQuery(""); setCurrentPage(1); };

  // ── Données dérivées ─────────────────────────────────────────────────────────
  const selectedCycle      = cycles.find((c) => c._id === filterCycleId);
  const availableRotations = selectedCycle?.rotations || [];
  const activeFiltersCount = [scoreSearchQuery, filterCycleId, filterRotationId, filterGuildId].filter(Boolean).length;

  const getUserInfo  = (userId: string)  => users.find((u) => u._id === userId);
  const getCycleInfo = (cycleId: string) => cycles.find((c) => c._id === cycleId);

  // ── Couleurs ─────────────────────────────────────────────────────────────────
  const cardBg      = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText   = useColorModeValue("gray.500", "gray.400");
  const tableBg     = useColorModeValue("white", "gray.800");

  return (
    <Box w="100%" maxW="container.xl" mx="auto">
      <VStack spacing={5} align="stretch">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <Box
          bg={cardBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          {/* Barre accent */}
          <Box h="3px" bgGradient="linear(to-r, purple.400, indigo.400, blue.400)" />

          <Flex
            px={5}
            py={4}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={0.5}>
                {t("components.scoresSection.heading")}
              </Text>
              <Text fontSize="sm" color={mutedText}>
                {pagination
                  ? `${pagination.totalCount.toLocaleString()} ${t("components.scoresSection.scoresCount")}`
                  : "Chargement…"}
              </Text>
            </Box>

            {(isAdmin || isGuildManager) && (
              <HStack spacing={2} flexWrap="wrap">
                <Button
                  size="sm"
                  colorScheme="blue"
                  borderRadius="lg"
                  onClick={() => scoreManagement.setIsOCRModalOpen(true)}
                  isDisabled={!currentUser}
                >
                  {t("components.scoresSection.buttonAutoEntry")}
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  borderRadius="lg"
                  leftIcon={<Text fontSize="sm">📝</Text>}
                  onClick={() => scoreManagement.setIsBulkModalOpen(true)}
                  isDisabled={!currentUser}
                >
                  {t("components.scoresSection.buttonManualEntry")}
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      borderRadius="lg"
                      leftIcon={<Text fontSize="sm">🔄</Text>}
                      onClick={onTransferModalOpen}
                    >
                      Transférer rotation
                    </Button>
                    <Tooltip label="Outils de debug OCR" hasArrow>
                      <IconButton
                        aria-label="OCR Debug"
                        icon={<FiTool />}
                        size="sm"
                        variant="outline"
                        borderRadius="lg"
                        onClick={() => router.push("/ocr-debug")}
                      />
                    </Tooltip>
                  </>
                )}
              </HStack>
            )}
          </Flex>
        </Box>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <ScoresStatsCards
          pagination={pagination}
          activeFiltersCount={activeFiltersCount}
          isLoading={isLoadingScores}
        />

        {/* ── Filtres ───────────────────────────────────────────────────────── */}
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

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <Box
          bg={tableBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          {isLoadingScores ? (
            <PageLoader label={t("components.scoresSection.loading")} color="purple.400" height="250px" />
          ) : !Array.isArray(scores) || scores.length === 0 ? (
            <Flex justify="center" align="center" py={16}>
              <VStack spacing={3}>
                <Text fontSize="3xl">📊</Text>
                <Text fontWeight="medium">Aucun score trouvé</Text>
                {activeFiltersCount > 0 ? (
                  <HStack>
                    <Text fontSize="sm" color={mutedText}>
                      {activeFiltersCount} filtre(s) actif(s) —
                    </Text>
                    <Button size="xs" variant="link" colorScheme="purple" onClick={handleResetFilters}>
                      Réinitialiser
                    </Button>
                  </HStack>
                ) : (
                  <Alert status="info" borderRadius="lg" fontSize="sm" mt={2}>
                    <AlertIcon />
                    {t("components.scoresSection.noScores")}
                  </Alert>
                )}
              </VStack>
            </Flex>
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
          {pagination && pagination.totalPages > 1 && (
            <Box
              px={4}
              py={3}
              borderTopWidth="1px"
              borderColor={borderColor}
            >
              <PaginationComponent
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasPrevPage={pagination.hasPrevPage}
                hasNextPage={pagination.hasNextPage}
                onPageChange={setCurrentPage}
                totalCount={pagination.totalCount}
                itemsOnPage={pagination.itemsOnPage}
              />
            </Box>
          )}
        </Box>

        {/* ── Modals ────────────────────────────────────────────────────────── */}
        <ScoreModals
          isOpen={isOpen}
          onClose={onClose}
          isEditModalOpen={scoreManagement.isEditModalOpen}
          onEditModalClose={() => { scoreManagement.setIsEditModalOpen(false); scoreManagement.resetForm(); }}
          isDeleteModalOpen={scoreManagement.isDeleteModalOpen}
          onDeleteModalClose={() => { scoreManagement.setIsDeleteModalOpen(false); scoreManagement.setScoreToDelete(null); }}
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
          isTransferModalOpen={isTransferModalOpen}
          onTransferModalClose={onTransferModalClose}
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
    </Box>
  );
};

export default ScoresSection;
