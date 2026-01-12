import { Link } from "react-router-dom";
import {
  useColorMode,
  Button,
  Box,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  useDisclosure,
  VStack,
  HStack,
  Text,
  useToast,
  Avatar,
  useColorModeValue
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaDiscord } from "react-icons/fa";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import type { IUser } from "../interfaces";
import { getDiscordAvatarUrl } from "../utils/discord";
import CustomLink from "./ui/CustomLink";

const ColorModeSwitcher = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode} variant="ghost" ml={2}>
      {colorMode === "light" ? "🌙" : "☀️"}
    </Button>
  );
};

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuildManager, setIsGuildManager] = useState(false);
  const toast = useToast();
  const placement = "left";

  // Tous les hooks de couleur en haut
  const homeHoverBg = useColorModeValue("blue.50", "blue.900");
  const homeHoverColor = useColorModeValue("blue.600", "blue.200");
  const charactersHoverBg = useColorModeValue("green.50", "green.900");
  const charactersHoverColor = useColorModeValue("green.600", "green.200");
  const cyclesHoverBg = useColorModeValue("purple.50", "purple.900");
  const cyclesHoverColor = useColorModeValue("purple.600", "purple.200");
  const adminHoverBg = useColorModeValue("orange.50", "orange.900");
  const adminHoverColor = useColorModeValue("orange.600", "orange.200");
  const usersHoverBg = useColorModeValue("teal.50", "teal.900");
  const usersHoverColor = useColorModeValue("teal.600", "teal.200");
  const podiumHoverBg = useColorModeValue("pink.50", "pink.900");
  const podiumHoverColor = useColorModeValue("pink.600", "pink.200");
  const comparatorHoverBg = useColorModeValue("cyan.50", "cyan.900");
  const comparatorHoverColor = useColorModeValue("cyan.600", "cyan.200");
  const guidesHoverBg = useColorModeValue("orange.50", "orange.900");
  const guidesHoverColor = useColorModeValue("orange.600", "orange.200");

  const menuItems = [
    {
      name: "Accueil",
      path: "/",
      icon: "🏠",
      hoverBg: homeHoverBg,
      hoverColor: homeHoverColor
    },
    {
      name: "Personnages",
      path: "/personnages",
      icon: "📖",
      hoverBg: charactersHoverBg,
      hoverColor: charactersHoverColor
    },
    {
      name: "Cycles",
      path: "/cycles",
      icon: "🔄",
      hoverBg: cyclesHoverBg,
      hoverColor: cyclesHoverColor
    },
    {
      name: "Joueurs",
      path: "/joueurs",
      icon: "👥",
      hoverBg: usersHoverBg,
      hoverColor: usersHoverColor
    },
    {
      name: "Podium",
      path: "/podium",
      icon: "🏆",
      hoverBg: podiumHoverBg,
      hoverColor: podiumHoverColor
    },
    {
      name: "Comparateur",
      path: "/comparateur",
      icon: "⚔️",
      hoverBg: comparatorHoverBg,
      hoverColor: comparatorHoverColor
    },
    {
      name: "Guides",
      path: "/guides",
      icon: "📚",
      hoverBg: guidesHoverBg,
      hoverColor: guidesHoverColor
    },
    {
      name: "Admin",
      path: "/admin",
      icon: "⚙️",
      hoverBg: adminHoverBg,
      hoverColor: adminHoverColor,
      adminOrGuildManagerOnly: true
    }
  ];

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

    let redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;

    if (!redirectUri) {
      if (window.location.hostname === "localhost") {
        redirectUri = "http://localhost:5173/discord-callback";
      } else if (window.location.hostname === "www.bbs-schrift.fr") {
        redirectUri = "https://www.bbs-schrift.fr/discord-callback";
      } else if (window.location.hostname === "bbs-schrift.fr") {
        redirectUri = "https://bbs-schrift.fr/discord-callback";
      } else {
        redirectUri = `${window.location.origin}/discord-callback`;
      }
    }

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const scope = encodeURIComponent("identify guilds guilds.members.read");
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}`;

    window.location.href = discordAuthUrl;
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    setIsGuildManager(false);
    setIsLoggedIn(false);
    setUserInfo(null);

    window.dispatchEvent(new Event("authStateChange"));

    toast({ title: "Déconnexion réussie", status: "info" });
  };

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuthState = () => {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("adminToken");
      if (token && isTokenValid(token)) {
        try {
          const decoded = jwtDecode(token) as any;
          setIsLoggedIn(true);
          setIsAdmin(decoded.isAdmin || false);
          setIsGuildManager(
            decoded.role === "chef" || decoded.role === "sous-chef"
          );

          let avatarUrl = null;
          if (decoded.avatar && decoded.discord_id) {
            avatarUrl = getDiscordAvatarUrl(decoded.discord_id, decoded.avatar);
          }

          setUserInfo({
            ...decoded,
            avatar: avatarUrl || undefined
          });

          if (localStorage.getItem("adminToken")) {
            localStorage.setItem("userToken", token);
            localStorage.removeItem("adminToken");
          }
        } catch (error) {
          console.error("Erreur décodage token:", error);
          localStorage.removeItem("userToken");
          localStorage.removeItem("adminToken");
          setIsLoggedIn(false);
          setIsAdmin(false);
          setIsGuildManager(false);
          setUserInfo(null);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsGuildManager(false);
        setUserInfo(null);
      }
    };

    checkAuthState();

    const handleAuthStateChange = () => {
      checkAuthState();
    };

    window.addEventListener("authStateChange", handleAuthStateChange);
    window.addEventListener("storage", handleAuthStateChange);

    return () => {
      window.removeEventListener("authStateChange", handleAuthStateChange);
      window.removeEventListener("storage", handleAuthStateChange);
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
              <CustomLink
                to={`/joueur/${userInfo?.id}`}
                text={`${userInfo?.global_name}`}
                textSize="sm"
              />
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

  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box
      as="nav"
      w="100%"
      px={{ base: 2, md: 4 }}
      py={2}
      id="main-navbar"
      boxShadow={"lg"}
      zIndex={10}
      position="sticky"
      top={0}
      bg={bgColor}
    >
      <Flex
        display={{ base: "none", xl: "flex" }}
        justify="space-between"
        align="center"
        w="100%"
        maxW="100%"
      >
        <Flex gap={1} align="center" flexWrap="wrap" flex={1}>
          {menuItems.map((item) => {
            if (item.adminOrGuildManagerOnly && !isAdmin && !isGuildManager)
              return null;
            return (
              <Button
                key={item.name}
                as={Link}
                to={item.path}
                variant="ghost"
                onClick={onClose}
                justifyContent="flex-start"
                px={3}
                py={2}
                fontSize="sm"
                fontWeight="medium"
                borderRadius="lg"
                leftIcon={item.icon ? <Text>{item.icon}</Text> : undefined}
                _hover={{
                  bg: item.hoverBg,
                  color: item.hoverColor
                }}
              >
                {item.name}
              </Button>
            );
          })}
        </Flex>
        <Flex gap={1} align="center" flexShrink={0}>
          {renderAuthButton()}
          <ColorModeSwitcher />
        </Flex>
      </Flex>
      <Flex
        display={{ base: "flex", xl: "none" }}
        align="center"
        justify="space-between"
      >
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
              {menuItems.map((item) => {
                if (
                  item.adminOrGuildManagerOnly &&
                  !isAdmin &&
                  !isGuildManager
                )
                  return null;
                return (
                  <Button
                    key={item.name}
                    as={Link}
                    to={item.path}
                    variant="ghost"
                    onClick={onClose}
                    leftIcon={
                      item.icon ? <Text>{item.icon}</Text> : undefined
                    }
                    justifyContent="flex-start"
                    px={4}
                    py={3}
                    fontSize="sm"
                    fontWeight="medium"
                    borderRadius="lg"
                    _hover={{
                      bg: item.hoverBg,
                      color: item.hoverColor
                    }}
                  >
                    {item.name}
                  </Button>
                );
              })}
              {isLoggedIn ? (
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      src={userInfo?.avatar}
                      name={userInfo?.username}
                    />
                    <VStack spacing={0} align="start">
                      <CustomLink
                        to={`/joueur/${userInfo?.id}`}
                        text={`${userInfo?.global_name}`}
                        textSize="sm"
                      />
                      {isAdmin && (
                        <Text fontSize="xs" color="orange.500">
                          Admin
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                  >
                    Déconnexion
                  </Button>
                </VStack>
              ) : (
                <Button
                  leftIcon={<FaDiscord />}
                  colorScheme="purple"
                  variant="ghost"
                  onClick={() => {
                    handleDiscordAuth();
                    onClose();
                  }}
                >
                  Se connecter
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
