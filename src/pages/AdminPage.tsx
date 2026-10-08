import { Box, Flex, Heading, HStack, VStack, Text, Button, Select, useToast, useColorMode } from "@chakra-ui/react";
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

type TabGroup = 'guilds' | 'scores' | 'players' | 'content' | 'communication';

// Groupes de la navigation (dans l'ordre d'affichage)
const tabGroups: { key: TabGroup; label: string }[] = [
  { key: 'guilds', label: 'Guildes' },
  { key: 'scores', label: 'Scores' },
  { key: 'players', label: 'Joueurs' },
  { key: 'content', label: 'Contenu' },
  { key: 'communication', label: 'Communication' },
];

const tabConfig: { key: IAdminPage; label: string; icon: string; group: TabGroup }[] = [
  { key: 'guilds',  label: 'Guildes',  icon: '🏰', group: 'guilds' },
  { key: 'draft',   label: 'Draft',    icon: '🔀', group: 'guilds' },
  { key: 'cycles',  label: 'Cycles',   icon: '🔄', group: 'scores' },
  { key: 'scores',  label: 'Scores',   icon: '📊', group: 'scores' },
  { key: 'score-control', label: 'Contrôle des scores', icon: '🔎', group: 'scores' },
  { key: 'preparation', label: 'Préparation', icon: '🎯', group: 'scores' },
  { key: 'alerts',  label: 'Baisses de régime', icon: '📉', group: 'scores' },
  { key: 'users',   label: 'Joueurs',  icon: '👥', group: 'players' },
  { key: 'banned',  label: 'Bannis',   icon: '🚫', group: 'players' },
  { key: 'guides',  label: 'Guides',   icon: '📚', group: 'content' },
  { key: 'images',  label: 'Images',   icon: '🖼️', group: 'content' },
  { key: 'notifications', label: 'Notifications', icon: '🔔', group: 'communication' },
  { key: 'activity', label: 'Activité', icon: '📜', group: 'communication' },
  { key: 'messages', label: 'Messages', icon: '💬', group: 'communication' },
];

const AdminPage = () => {
  // Détection des permissions utilisateur
  const { isAdmin: isFullAdmin, isGuildManager } = useAuth();
  const { updateCharacters, checkBotHealth, uploadImages } = useAdminMutations();
  const { colorMode } = useColorMode();
  
  // Pages autorisées selon le rôle
  const allowedPages = useMemo(() => {
    if (isFullAdmin) {
      return ['guilds', 'draft', 'cycles', 'scores', 'score-control', 'preparation', 'alerts', 'users', 'banned', 'guides', 'images', 'notifications', 'activity', 'messages'] as IAdminPage[];
    } else if (isGuildManager) {
      return ['scores', 'score-control', 'preparation', 'alerts', 'notifications', 'activity', 'messages'] as IAdminPage[];
    }
    return [] as IAdminPage[];
  }, [isFullAdmin, isGuildManager]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Onglet initial : celui de l'URL (?tab=...) s'il est autorisé pour ce rôle, sinon le défaut
  // habituel. AdminPage ne monte qu'une fois l'auth résolue (ProtectedRoute attend isAuthLoading),
  // donc allowedPages est déjà fiable ici — pas besoin d'un effet de correction après coup.
  const [currentPage, setCurrentPage] = useState<IAdminPage>(() => {
    const urlTab = searchParams.get('tab') as IAdminPage | null;
    if (urlTab && allowedPages.includes(urlTab)) return urlTab;
    return isFullAdmin ? allowedPages[0] : "scores";
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
  const [isCheckingBot, setIsCheckingBot] = useState(false);
  const toast = useToast();

  const isDark = colorMode === 'dark';
  const pageBg       = isDark ? 'gray.900'       : 'gray.50';
  const headerBg     = isDark ? 'gray.800'       : 'white';
  const headerBorder = isDark ? 'whiteAlpha.100' : 'gray.200';
  const tabInactiveColor  = isDark ? 'gray.400' : 'gray.500';
  const tabInactiveBorder = isDark ? 'whiteAlpha.200' : 'gray.200';
  const tabInactiveHoverBg = isDark ? 'whiteAlpha.100' : 'gray.100';
  const separatorColor = isDark ? 'whiteAlpha.100' : 'gray.200';

  const visibleTabs = tabConfig.filter(t => allowedPages.includes(t.key));
  // Groupes non vides pour ce rôle (un chef ne voit que les siens)
  const visibleGroups = tabGroups
    .map(group => ({ ...group, tabs: visibleTabs.filter(t => t.group === group.key) }))
    .filter(group => group.tabs.length > 0);

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

  const handleBotHealth = async () => {
    setIsCheckingBot(true);
    try {
      const data = await checkBotHealth();
      if (data.online) {
        toast({
          title: '🤖 Bot en ligne',
          description: `status: ${data.data?.status ?? '?'} · bot: ${data.data?.bot ?? '?'}`,
          status: 'success',
          duration: 4000,
        });
      } else {
        toast({
          title: '🤖 Bot hors ligne',
          description: data.error === 'timeout' ? 'Timeout (5s)' : data.error || 'Aucune réponse',
          status: 'error',
          duration: 4000,
        });
      }
    } catch (err: unknown) {
      toast({ title: (err as Error).message || 'Erreur vérification bot', status: 'error' });
    } finally {
      setIsCheckingBot(false);
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

  return (
    <Box minH="calc(100vh - 60px)" bg={pageBg} position="relative">

      {/* Decorative gradient blob */}
      <Box
        position="absolute"
        top={0} left={0} right={0}
        h="220px"
        bgGradient="linear(to-b, purple.900, transparent)"
        opacity={isDark ? 0.45 : 0.15}
        pointerEvents="none"
        zIndex={0}
      />

      {/* Header card */}
      <Box
        position="relative"
        zIndex={1}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={headerBorder}
        px={{ base: 4, md: 8 }}
        pt={7}
        pb={0}
        boxShadow={isDark ? '0 1px 20px rgba(0,0,0,0.4)' : '0 1px 8px rgba(0,0,0,0.06)'}
      >
        {/* Top row: title + actions */}
        <Flex align="flex-start" justify="space-between" mb={5} wrap="wrap" gap={3}>
          <Box>
            {/* Badge label */}
            <Box
              display="inline-flex"
              alignItems="center"
              gap={1}
              px={3}
              py={0.5}
              mb={2}
              borderRadius="full"
              bg={isDark ? 'purple.900' : 'purple.50'}
              border="1px solid"
              borderColor={isDark ? 'purple.700' : 'purple.200'}
              fontSize="2xs"
              color={isDark ? 'purple.300' : 'purple.600'}
              fontWeight="semibold"
              letterSpacing="widest"
              textTransform="uppercase"
            >
              ⚙ Panel d'administration
            </Box>
            <Heading
              size="xl"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #C4B5FD, #818CF8)'
                  : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {isFullAdmin ? "Ṣčhrīft Admin" : "Gestion des Scores"}
            </Heading>
          </Box>

          {/* Admin utility buttons */}
          {isFullAdmin && (
            <HStack spacing={2} flexWrap="wrap" pt={1}>
              <Button
                size="sm"
                variant="outline"
                borderColor={isDark ? 'purple.600' : 'purple.300'}
                color={isDark ? 'purple.300' : 'purple.600'}
                _hover={{ bg: isDark ? 'purple.900' : 'purple.50' }}
                onClick={handleUpdateCharacters}
                isLoading={isUpdatingCharacters}
                loadingText="Sync…"
                borderRadius="full"
              >
                🔄 Sync personnages
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor={isDark ? 'teal.600' : 'teal.400'}
                color={isDark ? 'teal.300' : 'teal.600'}
                _hover={{ bg: isDark ? 'teal.900' : 'teal.50' }}
                onClick={handleUploadImages}
                isLoading={isUploadingImages}
                loadingText="Upload…"
                borderRadius="full"
              >
                🖼️ Upload images
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor={isDark ? 'green.600' : 'green.400'}
                color={isDark ? 'green.300' : 'green.600'}
                _hover={{ bg: isDark ? 'green.900' : 'green.50' }}
                onClick={handleBotHealth}
                isLoading={isCheckingBot}
                loadingText="Ping…"
                borderRadius="full"
              >
                🤖 Bot health
              </Button>
            </HStack>
          )}
        </Flex>

      </Box>

      {/* Navigation groupée : colonne à gauche sur grand écran, liste déroulante sur mobile/tablette.
          (L'ancienne barre d'onglets horizontale débordait sans pouvoir défiler à la souris.) */}
      <Flex position="relative" zIndex={1} align="flex-start" gap={6} pt={6} px={{ base: 3, md: 6 }}>
        <Box
          as="nav"
          aria-label="Sections de l'administration"
          display={{ base: 'none', lg: 'block' }}
          w="230px"
          flexShrink={0}
          position="sticky"
          top="16px"
          bg={headerBg}
          border="1px solid"
          borderColor={separatorColor}
          borderRadius="xl"
          p={3}
        >
          <VStack align="stretch" spacing={4}>
            {visibleGroups.map(group => (
              <Box key={group.key}>
                <Text
                  fontSize="2xs"
                  fontWeight="semibold"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  color={tabInactiveColor}
                  px={3}
                  mb={1}
                >
                  {group.label}
                </Text>
                <VStack align="stretch" spacing={0.5}>
                  {group.tabs.map(tab => {
                    const isActive = currentPage === tab.key;
                    const isBanned = tab.key === 'banned';
                    return (
                      <Button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        aria-current={isActive ? 'page' : undefined}
                        size="sm"
                        h="36px"
                        justifyContent="flex-start"
                        borderRadius="lg"
                        transition="all 0.15s ease"
                        sx={isActive ? {
                          background: isBanned
                            ? 'linear-gradient(135deg, #DC2626, #9B1C1C)'
                            : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                          color: 'white',
                          _hover: {
                            background: isBanned
                              ? 'linear-gradient(135deg, #B91C1C, #7F1D1D)'
                              : 'linear-gradient(135deg, #6D28D9, #4338CA)',
                          },
                        } : {
                          background: 'transparent',
                          color: tabInactiveColor,
                          _hover: { background: tabInactiveHoverBg, color: isDark ? 'gray.100' : 'gray.700' },
                        }}
                      >
                        <HStack spacing={2}>
                          <Text as="span" fontSize="sm">{tab.icon}</Text>
                          <Text as="span" fontSize="sm" fontWeight={isActive ? 'semibold' : 'normal'}>{tab.label}</Text>
                        </HStack>
                      </Button>
                    );
                  })}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box flex={1} minW={0}>
          {/* Mobile / tablette : choix de la section dans une liste groupée */}
          <Box display={{ base: 'block', lg: 'none' }} mb={4}>
            <Select
              id="admin-section"
              aria-label="Section de l'administration"
              value={currentPage}
              onChange={(e) => handleTabChange(e.target.value as IAdminPage)}
              bg={headerBg}
              borderColor={tabInactiveBorder}
              borderRadius="lg"
            >
              {visibleGroups.map(group => (
                <optgroup key={group.key} label={group.label}>
                  {group.tabs.map(tab => (
                    <option key={tab.key} value={tab.key}>{tab.icon} {tab.label}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Box>

          {renderPage()}
        </Box>
      </Flex>
    </Box>
  );
}

export default AdminPage;
