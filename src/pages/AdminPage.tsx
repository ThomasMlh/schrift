import {
  Box, Flex, Heading, HStack, VStack, Text, Button, Menu, MenuButton, MenuList, MenuItem, Icon, Tooltip, useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiCpu, FiImage, FiRefreshCw, FiTool } from "react-icons/fi";
import { useAdminMutations } from "@/hooks/mutations/useAdminMutations";
import GuildsAdminSection from "../components/GuildsAdminSection";
import DraftSection from "../components/DraftSection";
import DraftProposalSection from "../components/DraftProposalSection";
import CyclesSection from "../components/CyclesSection";
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
import { useDeclineAlerts, useGuilds, useScoreAnomalies, useUsers } from "@/hooks/useAPI";
import { ADMIN_TABS } from "@/components/admin/adminTabs";
import { AdminSidebar, AdminSectionSelect } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { useBotHealth } from "@/components/admin/useBotHealth";

const AdminPage = () => {
  // Détection des permissions utilisateur
  const { isAdmin: isFullAdmin, isGuildManager, managedGuildIds } = useAuth();
  const { updateCharacters, uploadImages } = useAdminMutations();

  // Onglets autorisés selon le rôle : tout pour un admin, sinon les onglets non réservés
  const visibleTabs = useMemo(
    () => (isFullAdmin ? ADMIN_TABS : isGuildManager ? ADMIN_TABS.filter((tab) => !tab.adminOnly) : []),
    [isFullAdmin, isGuildManager]
  );
  const allowedPages = useMemo(() => visibleTabs.map((tab) => tab.key), [visibleTabs]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Onglet initial : celui de l'URL (?tab=...) s'il est autorisé pour ce rôle, sinon la vue
  // d'ensemble. AdminPage ne monte qu'une fois l'auth résolue (ProtectedRoute attend isAuthLoading),
  // donc allowedPages est déjà fiable ici — pas besoin d'un effet de correction après coup.
  const [currentPage, setCurrentPage] = useState<IAdminPage>(() => {
    const urlTab = searchParams.get('tab') as IAdminPage | null;
    if (urlTab && allowedPages.includes(urlTab)) return urlTab;
    return "overview";
  });

  // Change l'onglet et persiste le choix dans l'URL pour survivre à un refresh.
  const handleTabChange = (page: IAdminPage) => {
    setCurrentPage(page);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', page);
      return next;
    }, { replace: true });
  };
  const [isUpdatingCharacters, setIsUpdatingCharacters] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const toast = useToast();

  // État du bot (admins) et compteurs de la navigation
  const bot = useBotHealth(isFullAdmin);
  const { guilds: allGuilds } = useGuilds(true);
  const managedGuilds = isFullAdmin ? allGuilds : allGuilds.filter((g) => managedGuildIds.includes(g._id));
  const { alerts } = useDeclineAlerts();
  const { anomalies } = useScoreAnomalies();
  const { pagination: bannedPagination } = useUsers({ is_banned: 'true', limit: 1, enabled: isFullAdmin });
  const counters: Partial<Record<IAdminPage, number>> = {
    alerts: alerts.length,
    "score-control": anomalies.length,
    banned: bannedPagination?.totalCount ?? 0,
  };

  const handleUpdateCharacters = async () => {
    setIsUpdatingCharacters(true);
    try {
      const data = await updateCharacters();
      toast({ title: (data as { message?: string }).message || "Personnages mis à jour", status: "success" });
    } catch (error: unknown) {
      toast({ title: (error as Error).message || "Erreur lors de la mise à jour des personnages", status: "error" });
    } finally {
      setIsUpdatingCharacters(false);
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
        return <CyclesSection />;
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
      case "guilds":
      default:
        return <GuildsAdminSection />;
    }
  };

  const botDot = { online: "green.400", offline: "red.400", checking: "gray.400", unknown: "gray.400" }[bot.status];
  const botLabel = { online: "Bot en ligne", offline: "Bot hors ligne", checking: "Vérification du bot…", unknown: "Bot" }[bot.status];

  return (
    <Box minH="calc(100vh - 60px)" bg="bg.page">
      {/* En-tête */}
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
                  isLoading={isUpdatingCharacters || isUploadingImages}
                  loadingText="En cours…"
                >
                  Outils
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<Icon as={FiRefreshCw} />} onClick={handleUpdateCharacters}>
                    Synchroniser les personnages
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiImage} />} onClick={handleUploadImages}>
                    Envoyer les images
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

      {/* Navigation groupée : colonne à gauche sur grand écran, liste déroulante sur mobile/tablette */}
      <Flex align="flex-start" gap={6} pt={6} pb={10} px={{ base: 3, md: 6 }}>
        <AdminSidebar tabs={visibleTabs} current={currentPage} onChange={handleTabChange} counters={counters} />

        <Box flex={1} minW={0}>
          <AdminSectionSelect tabs={visibleTabs} current={currentPage} onChange={handleTabChange} counters={counters} />
          <VStack align="stretch" spacing={0}>{renderPage()}</VStack>
        </Box>
      </Flex>
    </Box>
  );
}

export default AdminPage;
