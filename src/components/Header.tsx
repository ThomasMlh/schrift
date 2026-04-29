import { Link, useLocation } from "react-router-dom";
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FaDiscord } from "react-icons/fa";
import CustomLink from "./ui/CustomLink";
import { useAuth } from "../providers/AuthProvider";
import { useTranslation } from "react-i18next";

const ColorModeSwitcher = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      variant="ghost"
      colorScheme="purple"
      borderRadius="full"
      icon={<Text fontSize="md">{colorMode === "light" ? "🌙" : "☀️"}</Text>}
      size="sm"
    />
  );
};

const LANGUAGES = [
  { code: "fr", label: "Français", flagSrc: "https://flagcdn.com/20x15/fr.png", short: "FR" },
  { code: "en", label: "English",  flagSrc: "https://flagcdn.com/20x15/gb.png", short: "EN" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("schrift-lang", code);
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="outline"
        size="sm"
        borderRadius="full"
        borderColor={isDark ? 'whiteAlpha.200' : 'gray.200'}
        rightIcon={<ChevronDownIcon />}
        fontWeight="semibold"
        fontSize="sm"
        px={3}
        _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.50' }}
      >
        <HStack spacing={1.5}>
          <img src={current.flagSrc} width={20} height={15} alt={current.short} style={{ borderRadius: 2 }} />
          <Text>{current.short}</Text>
        </HStack>
      </MenuButton>
      <MenuList
        minW="140px"
        bg={isDark ? 'gray.800' : 'white'}
        borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
        py={1}
        overflow="hidden"
        borderRadius="xl"
        boxShadow={isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)'}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            fontSize="sm"
            fontWeight={lang.code === current.code ? "semibold" : "normal"}
            bg={lang.code === current.code ? (isDark ? 'rgba(124,58,237,0.15)' : 'purple.50') : undefined}
            color={lang.code === current.code ? (isDark ? 'purple.300' : 'purple.600') : undefined}
            _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.50' }}
            px={4}
          >
            <HStack spacing={2}>
              <img src={lang.flagSrc} width={20} height={15} alt={lang.short} style={{ borderRadius: 2 }} />
              <Text>{lang.label}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentUser, isLoggedIn, isAdmin, isGuildManager, logout: authLogout } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const location = useLocation();

  const menuItems = [
    { name: t("nav.home"), path: "/", icon: "🏠" },
    { name: t("nav.guilds"), path: "/guildes", icon: "🛡️" },
    { name: t("nav.characters"), path: "/personnages", icon: "📖" },
    { name: t("nav.cycles"), path: "/cycles", icon: "🔄" },
    { name: t("nav.players"), path: "/joueurs", icon: "👥" },
    { name: t("nav.podium"), path: "/podium", icon: "🏆" },
    { name: t("nav.comparator"), path: "/comparateur", icon: "⚔️" },
    { name: t("nav.guides"), path: "/guides", icon: "📚" },
    { name: t("nav.admin"), path: "/admin", icon: "⚙️", adminOrGuildManagerOnly: true },
  ];

  // Fonction pour initier l'authentification Discord
  const handleDiscordAuth = () => {
    const discordClientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/discord-callback`;

    // Générer un state anti-CSRF et le stocker en session
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const scope = encodeURIComponent("identify guilds guilds.members.read");
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}`;

    // Sauvegarder la page actuelle pour y revenir après connexion
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);

    window.location.href = discordAuthUrl;
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    authLogout();
    onClose();
    toast({
      title: t("auth.logoutSuccess"),
      description: t("auth.logoutDescription"),
      status: "success",
      duration: 3000,
      isClosable: true
    });
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderAuthButton = () => {
    if (isLoggedIn) {
      return (
        <HStack spacing={3}>
          <HStack spacing={2}>
            <Avatar
              size="sm"
              src={currentUser?.avatar}
              name={currentUser?.username}
            />
            <VStack spacing={0} align="start">
              <CustomLink
                to={`/joueur/${currentUser?._id}`}
                text={`${currentUser?.global_name}`}
                textSize="sm"
                requireAuth={true}
              />
              {isAdmin && (
                <Text fontSize="xs" color={isDark ? 'purple.400' : 'purple.500'} lineHeight="short">
                  Admin
                </Text>
              )}
            </VStack>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            colorScheme="purple"
            borderRadius="full"
            onClick={handleLogout}
          >
            {t("auth.logout")}
          </Button>
        </HStack>
      );
    } else {
      return (
        <Button
          leftIcon={<FaDiscord />}
          colorScheme="purple"
          variant="solid"
          borderRadius="full"
          size="sm"
          onClick={handleDiscordAuth}
          bgGradient="linear(to-r, #7C3AED, #4F46E5)"
          _hover={{ bgGradient: "linear(to-r, #6D28D9, #4338CA)" }}
        >
          {t("auth.login")}
        </Button>
      );
    }
  };

  return (
    <Box
      as="nav"
      w="100%"
      px={{ base: 3, md: 5 }}
      py={2}
      id="main-navbar"
      zIndex={10}
      position="sticky"
      top={0}
      bg={isDark ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)'}
      sx={{ backdropFilter: 'blur(12px)' }}
      borderBottom="1px solid"
      borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
    >
      {/* Desktop nav */}
      <Flex
        display={{ base: "none", xl: "flex" }}
        justify="space-between"
        align="center"
        w="100%"
      >
        {/* Logo */}
        <Box
          as={Link}
          to="/"
          fontWeight="extrabold"
          fontSize={{ xl: "md", "2xl": "xl" }}
          letterSpacing="tight"
          bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
          bgClip="text"
          flexShrink={0}
          mr={{ xl: 2, "2xl": 4 }}
        >
          Schrift
        </Box>
        <Flex gap={{ xl: 0, "2xl": 1 }} align="center" flex={1} minW={0}>
          {menuItems.map((item) => {
            if (item.adminOrGuildManagerOnly && !isAdmin && !isGuildManager) return null;
            const active = isActive(item.path);
            return (
              <Button
                key={item.name}
                as={Link}
                to={item.path}
                variant="ghost"
                onClick={onClose}
                px={{ xl: 2, "2xl": 3 }}
                py={2}
                fontSize={{ xl: "xs", "2xl": "sm" }}
                fontWeight={active ? "semibold" : "medium"}
                borderRadius="full"
                color={active ? (isDark ? 'purple.300' : 'purple.600') : undefined}
                bg={active ? (isDark ? 'rgba(124,58,237,0.15)' : 'purple.50') : undefined}
                _hover={{
                  bg: isDark ? 'rgba(124,58,237,0.12)' : 'purple.50',
                  color: isDark ? 'purple.300' : 'purple.600',
                }}
              >
                <span style={{ marginRight: '4px', color: 'initial', display: 'inline-block' }}>{item.icon}</span>{item.name}
              </Button>
            );
          })}
        </Flex>
        <Flex gap={1} align="center" flexShrink={0}>
          {renderAuthButton()}
          <LanguageSwitcher />
          <ColorModeSwitcher />
        </Flex>
      </Flex>

      {/* Mobile nav */}
      <Flex display={{ base: "flex", xl: "none" }} align="center" justify="space-between">
        <Box
          as={Link}
          to="/"
          fontWeight="extrabold"
          fontSize="lg"
          bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
          bgClip="text"
        >
          Schrift
        </Box>
        <HStack spacing={1}>
          <LanguageSwitcher />
          <ColorModeSwitcher />
          <IconButton
            aria-label={t("nav.openMenu")}
            icon={<HamburgerIcon />}
            variant="ghost"
            colorScheme="purple"
            borderRadius="full"
            onClick={onOpen}
          />
        </HStack>
      </Flex>

      {/* Mobile drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay sx={{ backdropFilter: 'blur(4px)' }} />
        <DrawerContent
          bg={isDark ? 'gray.900' : 'white'}
          borderRight="1px solid"
          borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
        >
          <DrawerBody p={0}>
            <Flex
              justify="space-between"
              align="center"
              px={4} py={3}
              borderBottom="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
            >
              <Box
                fontWeight="extrabold"
                fontSize="lg"
                bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
                bgClip="text"
              >
                Schrift
              </Box>
              <IconButton
                aria-label={t("nav.closeMenu")}
                icon={<CloseIcon />}
                variant="ghost"
                colorScheme="purple"
                borderRadius="full"
                size="sm"
                onClick={onClose}
              />
            </Flex>

            <VStack spacing={1} align="stretch" p={3}>
              {menuItems.map((item) => {
                if (item.adminOrGuildManagerOnly && !isAdmin && !isGuildManager) return null;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.name}
                    as={Link}
                    to={item.path}
                    variant="ghost"
                    onClick={onClose}
                    justifyContent="flex-start"
                    px={4}
                    py={3}
                    fontSize="sm"
                    fontWeight={active ? "semibold" : "medium"}
                    borderRadius="xl"
                    color={active ? (isDark ? 'purple.300' : 'purple.600') : undefined}
                    bg={active ? (isDark ? 'rgba(124,58,237,0.15)' : 'purple.50') : undefined}
                    _hover={{
                      bg: isDark ? 'rgba(124,58,237,0.12)' : 'purple.50',
                      color: isDark ? 'purple.300' : 'purple.600',
                    }}
                  >
                    <span style={{ marginRight: '8px', color: 'initial' }}>{item.icon}</span>{item.name}
                  </Button>
                );
              })}
            </VStack>

            <Box
              px={4} py={4}
              borderTop="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
            >
              {isLoggedIn ? (
                <VStack spacing={3}>
                  <HStack spacing={2} w="100%">
                    <Avatar size="sm" src={currentUser?.avatar} name={currentUser?.username} />
                    <VStack spacing={0} align="start" flex={1}>
                      <CustomLink
                        to={`/joueur/${currentUser?._id}`}
                        text={`${currentUser?.global_name}`}
                        textSize="sm"
                        requireAuth={true}
                      />
                      {isAdmin && (
                        <Text fontSize="xs" color={isDark ? 'purple.400' : 'purple.500'}>
                          Admin
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <Button
                    variant="outline"
                    colorScheme="purple"
                    borderRadius="full"
                    w="100%"
                    onClick={() => { handleLogout(); onClose(); }}
                  >
                    {t("auth.logout")}
                  </Button>
                </VStack>
              ) : (
                <Button
                  leftIcon={<FaDiscord />}
                  colorScheme="purple"
                  w="100%"
                  borderRadius="full"
                  bgGradient="linear(to-r, #7C3AED, #4F46E5)"
                  _hover={{ bgGradient: "linear(to-r, #6D28D9, #4338CA)" }}
                  onClick={() => {
                    handleDiscordAuth();
                    onClose();
                  }}
                >
                  {t("auth.login")}
                </Button>
              )}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
