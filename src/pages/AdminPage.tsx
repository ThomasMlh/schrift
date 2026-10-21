import {
  Box, Flex, Heading, HStack, VStack, Text, Button, Menu, MenuButton, MenuList, MenuItem, Icon, Tooltip, useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiCpu, FiDatabase, FiImage, FiRefreshCw, FiTool, FiUsers } from "react-icons/fi";
import { useAdminMutations } from "@/hooks/mutations/useAdminMutations";
import GuildsAdminSection from "../components/GuildsAdminSection";
import DraftSection from "../components/DraftSection";
import DraftProposalSection from "../components/DraftProposalSection";
import CyclesSection from "../components/CyclesSection";
import { ScoreLockSetting } from "../components/admin/ScoreLockSetting";
import ScoresSection from "../components/ScoresSection";
import UsersTable from "../components/UsersTable";
import BannedUsersSection from "../components/BannedUsersSection";
import GuidesAdminSection from "../components/GuidesAdminSection";
import ImageBankSection from "../components/ImageBankSection";
import NotificationSettingsSection from "../components/NotificationSettingsSection";
import ActivityLogSection from "../components/ActivityLogSection";
import DiscordMessageSection from "../components/DiscordMessageSection";
import DeclineAlertsSection from "../components/DeclineAlertsSection";
import ScoreControlSection from "../components/ScoreControlSection";
import RotationPreparationSection from "../components/RotationPreparationSection";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminPage as IAdminPage } from "../interfaces";
import { useAuth } from "../providers/AuthProvider";
import { useApplications, useDeclineAlerts, useGuilds, useScoreAnomalies, useUsers } from "@/hooks/useAPI";
import { ADMIN_SECTION_DESCRIPTIONS, ADMIN_TABS, getAdminTab } from "@/components/admin/adminTabs";
import { DataHealthSection } from "@/components/admin/DataHealthSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AdminSidebar, AdminSectionSelect } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { useBotHealth } from "@/components/admin/useBotHealth";
import { ApplicationsSection } from "../components/admin/ApplicationsSection";
import { CharacterSyncModal } from "@/components/admin/CharacterSyncModal";
import type { ICharacterSyncResult } from "@/types/character";

const AdminPage = () => {
  const { isAdmin: isFullAdmin, isGuildManager, managedGuildIds } = useAuth();
  const { updateCharacters, uploadImages, syncDiscordProfiles, createIndexes } = useAdminMutations();

  // Tabs allowed for the role: everything for an admin, otherwise the non-restricted tabs
  const visibleTabs = useMemo(
    () => (isFullAdmin ? ADMIN_TABS : isGuildManager ? ADMIN_TABS.filter((tab) => !tab.adminOnly) : []),
    [isFullAdmin, isGuildManager]
  );
  const allowedPages = useMemo(() => visibleTabs.map((tab) => tab.key), [visibleTabs]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Initial tab: the URL one (?tab=...) when allowed for this role, otherwise the overview.
  // AdminPage only mounts once auth is resolved (ProtectedRoute waits for isAuthLoading), so
  // allowedPages is already reliable here.
  const [currentPage, setCurrentPage] = useState<IAdminPage>(() => {
    const urlTab = searchParams.get('tab') as IAdminPage | null;
    if (urlTab && allowedPages.includes(urlTab)) return urlTab;
    return "overview";
  });

  // Changes the tab and stores it in the URL so it survives a refresh.
  const handleTabChange = (page: IAdminPage) => {
    setCurrentPage(page);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', page);
      return next;
    }, { replace: true });
  };
  const [isUpdatingCharacters, setIsUpdatingCharacters] = useState(false);
  const [syncPreview, setSyncPreview] = useState<ICharacterSyncResult | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSyncingProfiles, setIsSyncingProfiles] = useState(false);
  const [isCreatingIndexes, setIsCreatingIndexes] = useState(false);
  const toast = useToast();

  // Bot health (admins) and navigation counters
  const bot = useBotHealth(isFullAdmin);
  const { guilds: allGuilds } = useGuilds(true);
  const managedGuilds = isFullAdmin ? allGuilds : allGuilds.filter((g) => managedGuildIds.includes(g._id));
  const { alerts } = useDeclineAlerts();
  const { anomalies } = useScoreAnomalies();
  const { pagination: bannedPagination } = useUsers({ is_banned: 'true', limit: 1, enabled: isFullAdmin });
  const { applications: newApplications } = useApplications("new", isFullAdmin);
  const counters: Partial<Record<IAdminPage, number>> = {
    alerts: alerts.length,
    "score-control": anomalies.length,
    banned: bannedPagination?.totalCount ?? 0,
    applications: newApplications.length,
  };

  // Dry run first: the modal shows what will change, the sync only runs on "Appliquer"
  const handlePreviewCharacters = async () => {
    setIsUpdatingCharacters(true);
    try {
      setSyncPreview(await updateCharacters({ dryRun: true }));
    } catch (error: unknown) {
      toast({ title: (error as Error).message || "Erreur lors de la simulation", status: "error" });
    } finally {
      setIsUpdatingCharacters(false);
    }
  };

  const handleUpdateCharacters = async () => {
    setIsUpdatingCharacters(true);
    const needsImages = (syncPreview?.statistics.inserted ?? 0) + (syncPreview?.statistics.imagesChanged ?? 0) > 0;
    try {
      const data = await updateCharacters();
      setSyncPreview(null);
      toast({ title: data.message || "Personnages mis à jour", status: "success", duration: 8000, isClosable: true });
      if (needsImages) await handleUploadImages();
    } catch (error: unknown) {
      toast({ title: (error as Error).message || "Erreur lors de la mise à jour des personnages", status: "error" });
    } finally {
      setIsUpdatingCharacters(false);
    }
  };

  const handleSyncProfiles = async () => {
    setIsSyncingProfiles(true);
    const pending = toast({
      title: "Synchronisation des profils Discord…",
      description: "Le bot relit le profil de chaque joueur, cela peut prendre une à deux minutes.",
      status: "loading",
      duration: null,
    });
    try {
      const result = await syncDiscordProfiles();
      toast.close(pending);
      const errors = result.lookup_errors + result.patch_errors;
      toast({
        title: result.updated > 0 ? `${result.updated} profil${result.updated > 1 ? "s" : ""} mis à jour` : "Tous les profils étaient déjà à jour",
        description: [
          `${result.total} joueurs vérifiés`,
          result.null_set > 0 ? `${result.null_set} bannière${result.null_set > 1 ? "s" : ""} retirée${result.null_set > 1 ? "s" : ""}` : null,
          errors > 0 ? `${errors} erreur${errors > 1 ? "s" : ""}` : null,
        ].filter(Boolean).join(" · "),
        status: errors > 0 ? "warning" : "success",
        duration: 8000,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast.close(pending);
      toast({ title: (error as Error).message || "Erreur lors de la synchronisation des profils", status: "error", isClosable: true });
    } finally {
      setIsSyncingProfiles(false);
    }
  };

  const handleCreateIndexes = async () => {
    setIsCreatingIndexes(true);
    try {
      const result = await createIndexes();
      toast({
        title: result.failed.length === 0 ? `${result.created} index à jour` : `${result.failed.length} index en échec sur ${result.total}`,
        description: result.failed.map((f) => `${f.collection} : ${f.error ?? "erreur inconnue"}`).join(" · ") || undefined,
        status: result.failed.length === 0 ? "success" : "warning",
        duration: 8000,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast({ title: (error as Error).message || "Erreur lors de la création des index", status: "error", isClosable: true });
    } finally {
      setIsCreatingIndexes(false);
    }
  };

  const handleUploadImages = async () => {
    setIsUploadingImages(true);
    try {
      const { totalUploaded } = await uploadImages(100, (total, remaining) => {
        toast({ title: `Images: ${total} uploadées, ${remaining} restants...`, status: "info", duration: 2000 });
      });
      toast({ title: `Upload terminé: ${totalUploaded} images`, status: "success" });
    } catch (error: unknown) {
      toast({ title: (error as Error).message || "Erreur upload images", status: "error" });
    } finally {
      setIsUploadingImages(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <AdminOverview guilds={managedGuilds} isAdmin={isFullAdmin} bot={bot} onNavigate={handleTabChange} />;
      case "draft":
        return (
          <VStack align="stretch" spacing={6}>
            <DraftProposalSection />
            <DraftSection onDraftComplete={() => {}} />
          </VStack>
        );
      case "cycles":
        return (
          <VStack align="stretch" spacing={6}>
            <ScoreLockSetting />
            <CyclesSection />
          </VStack>
        );
      case "scores":
        return <ScoresSection />;
      case "score-control":
        return <ScoreControlSection />;
      case "preparation":
        return <RotationPreparationSection />;
      case "alerts":
        return <DeclineAlertsSection />;
      case "users":
        return <UsersTable isAdminMode={true} />;
      case "banned":
        return <BannedUsersSection />;
      case "guides":
        return <GuidesAdminSection />;
      case "images":
        return <ImageBankSection />;
      case "notifications":
        return <NotificationSettingsSection />;
      case "activity":
        return <ActivityLogSection />;
      case "messages":
        return <DiscordMessageSection />;
      case "applications":
        return <ApplicationsSection />;
      case "data-health":
        return <DataHealthSection onNavigate={handleTabChange} />;
      case "guilds":
      default:
        return <GuildsAdminSection />;
    }
  };

  const botDot = { online: "green.400", offline: "red.400", checking: "gray.400", unknown: "gray.400" }[bot.status];
  const botLabel = { online: "Bot en ligne", offline: "Bot hors ligne", checking: "Vérification du bot…", unknown: "Bot" }[bot.status];

  return (
    <Box minH="calc(100vh - 60px)" bg="bg.page">
      <Box borderBottomWidth="1px" borderColor="border.faint" px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Box>
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              bgGradient="linear(to-r, purple.300, blue.400)"
              _light={{ bgGradient: "linear(to-r, #7C3AED, #4F46E5)" }}
              bgClip="text"
              w="fit-content"
            >
              {isFullAdmin ? "Administration" : "Gestion des scores"}
            </Heading>
            <Text fontSize="sm" color="text.muted" mt={1}>
              {isFullAdmin ? "Guildes, scores, joueurs, contenu et communication" : "Saisie et suivi des scores de vos guildes"}
            </Text>
          </Box>

          {isFullAdmin && (
            <HStack spacing={2}>
              <Tooltip label={bot.detail ?? "Cliquer pour vérifier"} hasArrow>
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  onClick={() => void bot.check()}
                  isLoading={bot.status === "checking"}
                  loadingText="Bot…"
                  leftIcon={<Box w="8px" h="8px" borderRadius="full" bg={botDot} />}
                >
                  {botLabel}
                </Button>
              </Tooltip>
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  leftIcon={<Icon as={FiTool} />}
                  rightIcon={<ChevronDownIcon />}
                  isLoading={isUpdatingCharacters || isUploadingImages || isSyncingProfiles || isCreatingIndexes}
                  loadingText="En cours…"
                >
                  Outils
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<Icon as={FiRefreshCw} />} onClick={handlePreviewCharacters}>
                    Synchroniser les personnages
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiUsers} />} onClick={handleSyncProfiles}>
                    Synchroniser les profils Discord
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiImage} />} onClick={handleUploadImages}>
                    Envoyer les images
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiDatabase} />} onClick={handleCreateIndexes}>
                    Créer les index de la base
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiCpu} />} onClick={() => void bot.check()}>
                    Tester le bot
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          )}
        </Flex>
      </Box>

      {/* Grouped navigation: left column on large screens, dropdown on mobile/tablet */}
      <Flex align="flex-start" gap={6} pt={6} pb={10} px={{ base: 3, md: 6 }}>
        <AdminSidebar tabs={visibleTabs} current={currentPage} onChange={handleTabChange} counters={counters} />

        <Box flex={1} minW={0}>
          <AdminSectionSelect tabs={visibleTabs} current={currentPage} onChange={handleTabChange} counters={counters} />
          <VStack align="stretch" spacing={6}>
            {/* Shared header for sections that have none */}
            {ADMIN_SECTION_DESCRIPTIONS[currentPage] && (
              <SectionHeader
                title={getAdminTab(currentPage)?.label ?? ""}
                icon={getAdminTab(currentPage)?.icon}
                description={ADMIN_SECTION_DESCRIPTIONS[currentPage]}
              />
            )}
            {renderPage()}
          </VStack>
        </Box>
      </Flex>

      <CharacterSyncModal
        preview={syncPreview}
        isOpen={syncPreview !== null}
        onClose={() => setSyncPreview(null)}
        onApply={() => void handleUpdateCharacters()}
        isApplying={isUpdatingCharacters}
      />
    </Box>
  );
}

export default AdminPage;
