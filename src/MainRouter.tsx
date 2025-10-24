import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import {  useColorMode, Button, Box, Flex, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerBody, useDisclosure, VStack, HStack, Text, useToast, Avatar } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaDiscord } from 'react-icons/fa';
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import App from "./App";
import AdminPage from "./pages/AdminPage";
import DiscordCallback from "./pages/DiscordCallback";


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

export default function MainRouter() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{username: string, avatar?: string} | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // État de chargement
  const toast = useToast();
  const placement = "left";

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
    const redirectUri = encodeURIComponent(`${window.location.origin}/discord-callback`);
    const scope = encodeURIComponent('identify email guilds connections guilds.members.read');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
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
            username: decoded.username || decoded.name || 'Utilisateur',
            avatar: avatarUrl || undefined
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
                {userInfo?.username}
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
          <Flex gap={4} align="center">
            <Button as={Link} to="/" colorScheme="blue" variant="ghost">
              Accueil
            </Button>
            {isAdmin && (
              <Button as={Link} to="/admin" colorScheme="orange" variant="ghost">
                Admin
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
              <VStack spacing={4} align="stretch" p={4}>
                <Button as={Link} to="/" colorScheme="blue" variant="ghost" onClick={onClose}>
                  Accueil
                </Button>
                {isAdmin && (
                  <Button as={Link} to="/admin" colorScheme="orange" variant="ghost" onClick={onClose}>
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
                          {userInfo?.username}
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
          <Route path="/" element={<App />} />
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
        </Routes>
      </Box>
    </Router>
  );
}
