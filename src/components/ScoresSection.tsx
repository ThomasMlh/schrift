import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
import { FiBarChart2, FiCamera, FiEdit3, FiMoreHorizontal, FiPlus, FiRepeat, FiShuffle, FiTool } from "react-icons/fi";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { IScore } from "../interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import ScoresTable from "./ui/ScoresTable";
import { useCycles, useUsers, useGuilds, useScores } from "@/hooks/useAPI";
import { useScoreManagement } from "@/hooks/useScoreManagement";
import { ScoresFilters } from "./scores/ScoresFilters";
import { ScoreModals } from "./scores/ScoreModals";
import { TransferScoreModal } from "./ui/TransferScoreModal";
import { useTranslation } from "react-i18next";

const ScoresSection = () => {
  const [scoreSearchQuery, setScoreSearchQuery] = useState("");
  const [filterCycleId, setFilterCycleId]       = useState("");
  const [filterRotationId, setFilterRotationId] = useState("");
  const [filterGuildId, setFilterGuildId]       = useState("");
  const [currentPage, setCurrentPage]           = useState(1);
  const { t } = useTranslation();

  const navigate = useNavigate();
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

  const { isOpen: isTransferModalOpen, onOpen: onTransferModalOpen, onClose: onTransferModalClose } = useDisclosure();
  const { isOpen: isTransferScoreModalOpen, onOpen: onTransferScoreModalOpen, onClose: onTransferScoreModalClose } = useDisclosure();
  const { currentUser, isAdmin, isGuildManager, managedGuildIds } = useAuth();
  const scoreManagement = useScoreManagement({ users, cycles });

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
  const borderColor = "border.subtle";
  const mutedText = "text.muted";
  const tableBg = "bg.card";

  return (
    <Box w="100%" maxW="container.xl" mx="auto">
      <VStack spacing={5} align="stretch">

        <SectionHeader
          title={t("components.scoresSection.heading")}
          icon={FiBarChart2}
          description={pagination
            ? `${pagination.totalCount.toLocaleString("fr-FR")} ${t("components.scoresSection.scoresCount")}`
            : "Chargement…"}
          actions={(isAdmin || isGuildManager) ? (
            <>
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  size="sm"
                  colorScheme="purple"
                  leftIcon={<Icon as={FiPlus} />}
                  rightIcon={<ChevronDownIcon />}
                  isDisabled={!currentUser}
                >
                  Saisir des scores
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<Icon as={FiCamera} />} onClick={() => scoreManagement.setIsOCRModalOpen(true)}>
                    {t("components.scoresSection.buttonAutoEntry")}
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiEdit3} />} onClick={() => scoreManagement.setIsBulkModalOpen(true)}>
                    {t("components.scoresSection.buttonManualEntry")}
                  </MenuItem>
                </MenuList>
              </Menu>
              {isAdmin && (
                <Menu placement="bottom-end">
                  <MenuButton as={IconButton} icon={<FiMoreHorizontal />} size="sm" variant="outline" aria-label="Autres actions" />
                  <MenuList>
                    <MenuItem icon={<Icon as={FiRepeat} />} onClick={onTransferModalOpen}>Transférer une rotation</MenuItem>
                    <MenuItem icon={<Icon as={FiShuffle} />} onClick={onTransferScoreModalOpen}>Transférer un score</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<Icon as={FiTool} />} onClick={() => navigate("/ocr-debug")}>Debug OCR</MenuItem>
                  </MenuList>
                </Menu>
              )}
            </>
          ) : undefined}
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
                <Icon as={FiBarChart2} boxSize={8} color="text.muted" />
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
              hideCycle={!!filterCycleId}
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
          isEditModalOpen={scoreManagement.isEditModalOpen}
          editingScore={scoreManagement.editingScore}
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
          // Compte principal + comptes chef/sous-chef confondus, cas rare (multi-guildes via alts) : on
          // ne propose pour l'instant que la première guilde gérée, pas de sélecteur multi-guildes.
          userGuildId={managedGuildIds[0] || currentUser?.guilde_id}
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
          onUpdateScore={scoreManagement.handleUpdateScore}
          isUpdating={scoreManagement.isUpdating}
          getUserInfo={getUserInfo}
          getCycleInfo={getCycleInfo}
        />

        <TransferScoreModal
          isOpen={isTransferScoreModalOpen}
          onClose={onTransferScoreModalClose}
          cycles={cycles}
          guilds={guilds}
        />
      </VStack>
    </Box>
  );
};

export default ScoresSection;
