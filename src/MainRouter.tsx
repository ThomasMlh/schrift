import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useColorMode, Button, Box, Flex, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerBody, useDisclosure, VStack, HStack, Text, useToast, Avatar, useColorModeValue } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaDiscord } from 'react-icons/fa';
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import HomePage from "./pages/HomePage";
import CharactersPage from "./pages/CharactersPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import { CyclesPage } from "./pages/CyclesPage";
import CycleDetailPage from "./pages/CycleDetailPage";
import DiscordCallback from "./pages/DiscordCallback";
import UserPage from "./pages/UserPage";
import type { User } from "./interfaces";
import UsersPage from "./pages/UsersPage";
import AdminPage from "./pages/AdminPage";
import ScoresPage from "./pages/ScoresPage";


function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode} variant="ghost" ml={2}>
      {colorMode === "light" ? "🌙" : "☀️"}
    </Button>
  );
}

// Composant pour protéger les routes admin
function ProtectedRoute({
  isAuthenticated,
  isAdmin,
  isLoading,
  children
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  // Pendant le chargement, ne pas rediriger
  if (isLoading) {
    return (
      <Flex w="100%" h="60vh" align="center" justify="center">
        <Text>Vérification des droits d'accès...</Text>
      </Flex>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const MainRouter = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const toast = useToast();
  const placement = "left";

  // Tous les hooks de couleur en haut
  const linkColor = useColorModeValue('black.500', 'white.500');
  const homeHoverBg = useColorModeValue('blue.50', 'blue.900');
  const homeHoverColor = useColorModeValue('blue.600', 'blue.200');
  const charactersHoverBg = useColorModeValue('green.50', 'green.900');
  const charactersHoverColor = useColorModeValue('green.600', 'green.200');
  const cyclesHoverBg = useColorModeValue('purple.50', 'purple.900');
  const cyclesHoverColor = useColorModeValue('purple.600', 'purple.200');
  const adminHoverBg = useColorModeValue('orange.50', 'orange.900');
  const adminHoverColor = useColorModeValue('orange.600', 'orange.200');
  const usersHoverBg = useColorModeValue('teal.50', 'teal.900');
  const usersHoverColor = useColorModeValue('teal.600', 'teal.200');
  const scoresHoverBg = useColorModeValue('pink.50', 'pink.900');
  const scoresHoverColor = useColorModeValue('pink.600', 'pink.200');

  // Fonction pour construire l'URL de l'avatar Discord
  const getDiscordAvatarUrl = (userId: string, avatarHash: string, size: number = 128) => {
    if (!avatarHash) return null;
    // Format: https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.{format}
    // Les avatars animés ont un hash qui commence par "a_"
    const format = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=${size}`;
  };

  // Fonction utilitaire pour vérifier la validité du token
  const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Fonction pour initier l'authentification Discord
  const handleDiscordAuth = () => {
    const discordClientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

    // Utiliser l'URL de redirection depuis les variables d'environnement si disponible
    let redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;

    // Sinon, définir selon l'environnement
    if (!redirectUri) {
      if (window.location.hostname === 'localhost') {
        redirectUri = 'http://localhost:5173/discord-callback';
      } else if (window.location.hostname === 'www.bbs-schrift.fr') {
        redirectUri = 'https://www.bbs-schrift.fr/discord-callback';
      } else if (window.location.hostname === 'bbs-schrift.fr') {
        redirectUri = 'https://bbs-schrift.fr/discord-callback';
      } else {
        // Fallback pour autres domaines
        redirectUri = `${window.location.origin}/discord-callback`;
      }
    }

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const scope = encodeURIComponent('identify email guilds connections guilds.members.read');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}`;

    window.location.href = discordAuthUrl;
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setIsLoggedIn(false);
    setUserInfo(null);

    // Déclencher l'événement de changement d'état
    window.dispatchEvent(new Event('authStateChange'));

    toast({ title: "Déconnexion réussie", status: "info" });
  };

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (token && isTokenValid(token)) {
        try {
          const decoded = jwtDecode(token) as any;
          setIsLoggedIn(true);
          setIsAdmin(decoded.isAdmin || false);

          // Construire l'URL de l'avatar Discord si disponible
          let avatarUrl = null;
          if (decoded.avatar && decoded.discord_id) {
            avatarUrl = getDiscordAvatarUrl(decoded.discord_id, decoded.avatar);
          }

          setUserInfo({
            ...decoded,
            avatar: avatarUrl || undefined,
          });

          if (localStorage.getItem('adminToken')) {
            localStorage.setItem('userToken', token);
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Erreur décodage token:', error);
          localStorage.removeItem('userToken');
          localStorage.removeItem('adminToken');
          setIsLoggedIn(false);
          setIsAdmin(false);
          setUserInfo(null);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserInfo(null);
      }
      // Marquer le chargement comme terminé
      setIsAuthLoading(false);
    };

    // Vérifier l'état au chargement
    checkAuthState();

    // Écouter les changements d'état d'authentification
    const handleAuthStateChange = () => {
      checkAuthState();
    };

    window.addEventListener('authStateChange', handleAuthStateChange);
    window.addEventListener('storage', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChange', handleAuthStateChange);
      window.removeEventListener('storage', handleAuthStateChange);
    };
  }, []);

  const renderAuthButton = () => {
    if (isLoggedIn) {
      return (
        <HStack spacing={3}>
          <HStack spacing={2}>
            <Avatar
              size="sm"
              src={userInfo?.avatar}
              name={userInfo?.username}
            />
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="medium" lineHeight="short">
                {userInfo?.global_name}
              </Text>
              {isAdmin && (
                <Text fontSize="xs" color="orange.500" lineHeight="short">
                  Admin
                </Text>
              )}
            </VStack>
          </HStack>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </HStack>
      );
    } else {
      return (
        <Button
          leftIcon={<FaDiscord />}
          colorScheme="purple"
          variant="ghost"
          onClick={handleDiscordAuth}
        >
          Se connecter
        </Button>
      );
    }
  };
  return (
    <Router>
      <Box
        as="nav"
        w="100%"
        px={4}
        py={2}
        id="main-navbar"
        boxShadow={{ base: "none", md: "lg" }}
        zIndex={10}
        position="sticky"
        top={0}
        bg="inherit"
      >
        <Flex display={{ base: "none", md: "flex" }} justify="space-between" align="center" w="100%">
          <Flex gap={2} align="center">
            <Button
              as={Link}
              to="/"
              variant="ghost"
              color={linkColor}
              borderRadius="md"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{
                bg: homeHoverBg,
                color: homeHoverColor,
                transform: "translateY(-1px)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
            >
              🏠 Accueil
            </Button>
            <Button
              as={Link}
              to="/personnages"
              variant="ghost"
              color={linkColor}
              borderRadius="md"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{
                bg: charactersHoverBg,
                color: charactersHoverColor,
                transform: "translateY(-1px)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
            >
              📖 Personnages
            </Button>
            <Button
              as={Link}
              to="/cycles"
              variant="ghost"
              color={linkColor}
              borderRadius="md"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{
                bg: cyclesHoverBg,
                color: cyclesHoverColor,
                transform: "translateY(-1px)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
            >
              🔄 Cycles
            </Button>
            <Button
              as={Link}
              to="/users"
              variant="ghost"
              color={linkColor}
              borderRadius="md"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{
                bg: usersHoverBg,
                color: usersHoverColor,
                transform: "translateY(-1px)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
            >
              👥 Joueurs
            </Button>
            <Button
              as={Link}
              to="/scores"
              variant="ghost"
              color={linkColor}
              borderRadius="md"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{
                bg: scoresHoverBg,
                color: scoresHoverColor,
                transform: "translateY(-1px)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
            >
              📊 Scores
            </Button>
            {isAdmin && (
              <Button
                as={Link}
                to="/admin"
                variant="ghost"
                color="orange.500"
                borderRadius="md"
                px={4}
                py={2}
                fontSize="sm"
                fontWeight="medium"
                transition="all 0.2s"
                _hover={{
                  bg: adminHoverBg,
                  color: adminHoverColor,
                  transform: "translateY(-1px)"
                }}
                _active={{
                  transform: "translateY(0px)"
                }}
              >
                ⚙️ Admin
              </Button>
            )}
          </Flex>
          <Flex gap={2} align="center">
            {renderAuthButton()}
            <ColorModeSwitcher />
          </Flex>
        </Flex>
        <Flex display={{ base: "flex", md: "none" }} align="center" justify="space-between">
          <Box fontWeight="bold">Schrift</Box>
          <HStack>
            <ColorModeSwitcher />
            <IconButton
              aria-label="Ouvrir le menu"
              icon={<HamburgerIcon />}
              variant="outline"
              onClick={onOpen}
            />
          </HStack>
        </Flex>
        <Drawer placement={placement} onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody p={0}>
              <Flex justify="flex-end" p={2}>
                <IconButton
                  aria-label="Fermer le menu"
                  icon={<CloseIcon />}
                  variant="ghost"
                  onClick={onClose}
                />
              </Flex>
              <VStack spacing={3} align="stretch" p={4}>
                <Button
                  as={Link}
                  to="/"
                  variant="ghost"
                  onClick={onClose}
                  leftIcon={<Text>🏠</Text>}
                  justifyContent="flex-start"
                  px={4}
                  py={3}
                  fontSize="md"
                  fontWeight="medium"
                  borderRadius="lg"
                  _hover={{
                    bg: homeHoverBg,
                    color: homeHoverColor,
                  }}
                >
                  Accueil
                </Button>
                <Button
                  as={Link}
                  to="/personnages"
                  variant="ghost"
                  onClick={onClose}
                  leftIcon={<Text>📖</Text>}
                  justifyContent="flex-start"
                  px={4}
                  py={3}
                  fontSize="md"
                  fontWeight="medium"
                  borderRadius="lg"
                  _hover={{
                    bg: charactersHoverBg,
                    color: charactersHoverColor,
                  }}
                >
                  Personnages
                </Button>
                <Button
                  as={Link}
                  to="/cycles"
                  variant="ghost"
                  onClick={onClose}
                  leftIcon={<Text>🔄</Text>}
                  justifyContent="flex-start"
                  px={4}
                  py={3}
                  fontSize="md"
                  fontWeight="medium"
                  borderRadius="lg"
                  _hover={{
                    bg: cyclesHoverBg,
                    color: cyclesHoverColor,
                  }}
                >
                  Cycles
                </Button>
                <Button
                  as={Link}
                  to="/users"
                  variant="ghost"
                  onClick={onClose}
                  leftIcon={<Text>👥</Text>}
                  justifyContent="flex-start"
                  px={4}
                  py={3}
                  fontSize="md"
                  fontWeight="medium"
                  borderRadius="lg"
                  _hover={{
                    bg: usersHoverBg,
                    color: usersHoverColor,
                  }}
                >
                  Joueurs
                </Button>
                <Button
                  as={Link}
                  to="/scores"
                  variant="ghost"
                  onClick={onClose}
                  leftIcon={<Text>📊</Text>}
                  justifyContent="flex-start"
                  px={4}
                  py={3}
                  fontSize="md"
                  fontWeight="medium"
                  borderRadius="lg"
                  _hover={{
                    bg: scoresHoverBg,
                    color: scoresHoverColor,
                  }}
                >
                  Scores
                </Button>
                {isAdmin && (
                  <Button
                    as={Link}
                    to="/admin"
                    variant="ghost"
                    onClick={onClose}
                    leftIcon={<Text>⚙️</Text>}
                    justifyContent="flex-start"
                    px={4}
                    py={3}
                    fontSize="md"
                    fontWeight="medium"
                    borderRadius="lg"
                    color="orange.500"
                    _hover={{
                      bg: adminHoverBg,
                      color: adminHoverColor,
                    }}
                  >
                    Admin
                  </Button>
                )}
                {isLoggedIn ? (
                  <VStack spacing={3}>
                    <HStack spacing={2}>
                      <Avatar
                        size="sm"
                        src={userInfo?.avatar}
                        name={userInfo?.username}
                      />
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="medium">
                          {userInfo?.global_name}
                        </Text>
                        {isAdmin && (
                          <Text fontSize="xs" color="orange.500">
                            Admin
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <Button variant="outline" onClick={() => { handleLogout(); onClose(); }}>
                      Déconnexion
                    </Button>
                  </VStack>
                ) : (
                  <Button
                    leftIcon={<FaDiscord />}
                    colorScheme="purple"
                    variant="ghost"
                    onClick={() => { handleDiscordAuth(); onClose(); }}
                  >
                    Se connecter
                  </Button>
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
      <Box h="calc(100dvh - var(--navbar-height, 60px))" px={4} py={2} overflow="auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/personnages" element={<CharactersPage />} />
          <Route path="/personnage/:id" element={<CharacterDetailPage />} />
          <Route path="/cycles" element={<CyclesPage />} />
          <Route path="/cycle/:id" element={<CycleDetailPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                isAuthenticated={isLoggedIn}
                isAdmin={isAdmin}
                isLoading={isAuthLoading}
              >
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/discord-callback" element={<DiscordCallback />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/scores" element={<ScoresPage />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default MainRouter;