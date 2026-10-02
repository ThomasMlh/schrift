import { Box, Flex, Heading, HStack, VStack, Text, Button, useToast, useColorMode } from "@chakra-ui/react";
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
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminPage as IAdminPage } from "../interfaces";
import { useAuth } from "../providers/AuthProvider";

const tabConfig: { key: IAdminPage; label: string; icon: string }[] = [
  { key: 'guilds',  label: 'Guildes',  icon: '🏰' },
  { key: 'draft',   label: 'Draft',    icon: '🔀' },
  { key: 'cycles',  label: 'Cycles',   icon: '🔄' },
  { key: 'scores',  label: 'Scores',   icon: '📊' },
  { key: 'users',   label: 'Joueurs',  icon: '👥' },
  { key: 'banned',  label: 'Bannis',   icon: '🚫' },
  { key: 'guides',  label: 'Guides',   icon: '📚' },
  { key: 'images',  label: 'Images',   icon: '🖼️' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'activity', label: 'Activité', icon: '📜' },
  { key: 'messages', label: 'Messages', icon: '💬' },
];

const AdminPage = () => {
  // Détection des permissions utilisateur
  const { isAdmin: isFullAdmin, isGuildManager } = useAuth();
  const { updateCharacters, checkBotHealth, uploadImages } = useAdminMutations();
  const { colorMode } = useColorMode();
  
  // Pages autorisées selon le rôle
  const allowedPages = useMemo(() => {
    if (isFullAdmin) {
      return ['guilds', 'draft', 'cycles', 'scores', 'users', 'banned', 'guides', 'images', 'notifications', 'activity', 'messages'] as IAdminPage[];
    } else if (isGuildManager) {
      return ['scores', 'notifications', 'activity', 'messages'] as IAdminPage[];
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

        {/* Tab navigation */}
        <HStack
          spacing={1}
          overflowX="auto"
          py="4px"
          mx="-2px"
          px="2px"
          sx={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
        >
          {visibleTabs.map(tab => {
            const isActive = currentPage === tab.key;
            const isBanned = tab.key === 'banned';
            return (
              <Button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                size="sm"
                px={4}
                h="36px"
                borderRadius="full"
                flexShrink={0}
                mb={0}
                transition="all 0.18s ease"
                sx={isActive ? {
                  background: isBanned
                    ? 'linear-gradient(135deg, #DC2626, #9B1C1C)'
                    : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: 'white',
                  boxShadow: isBanned
                    ? '0 0 16px rgba(220,38,38,0.35)'
                    : '0 0 16px rgba(124,58,237,0.35)',
                  border: 'none',
                  _hover: {
                    background: isBanned
                      ? 'linear-gradient(135deg, #B91C1C, #7F1D1D)'
                      : 'linear-gradient(135deg, #6D28D9, #4338CA)',
                  },
                } : {
                  background: 'transparent',
                  color: tabInactiveColor,
                  border: '1px solid',
                  borderColor: tabInactiveBorder,
                  _hover: {
                    background: tabInactiveHoverBg,
                    color: isDark ? 'gray.100' : 'gray.700',
                    borderColor: isDark ? 'whiteAlpha.300' : 'gray.300',
                  },
                }}
              >
                <HStack spacing={1.5}>
                  <Text as="span" fontSize="sm">{tab.icon}</Text>
                  <Text as="span" fontSize="sm" fontWeight={isActive ? 'semibold' : 'normal'}>
                    {tab.label}
                  </Text>
                </HStack>
              </Button>
            );
          })}
        </HStack>

        {/* Active tab underline indicator */}
        <Box h="2px" bg={separatorColor} />
      </Box>

      {/* Page content */}
      <Box position="relative" zIndex={1} pt={6} px={{ base: 3, md: 6 }}>
        {renderPage()}
      </Box>
    </Box>
  );
}

export default AdminPage;
