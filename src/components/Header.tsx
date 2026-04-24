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
  useColorModeValue,
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
    <Button onClick={toggleColorMode} variant="ghost" ml={2}>
      {colorMode === "light" ? "🌙" : "☀️"}
    </Button>
  );
};

const LANGUAGES = [
  { code: "fr", label: "Français", flagSrc: "https://flagcdn.com/20x15/fr.png", short: "FR" },
  { code: "en", label: "English",  flagSrc: "https://flagcdn.com/20x15/gb.png", short: "EN" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const activeColor = useColorModeValue("blue.600", "blue.200");

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
        borderColor={borderColor}
        rightIcon={<ChevronDownIcon />}
        fontWeight="semibold"
        fontSize="sm"
        px={3}
        _hover={{ bg: hoverBg }}
      >
        <HStack spacing={1.5}>
          <img src={current.flagSrc} width={20} height={15} alt={current.short} style={{ borderRadius: 2 }} />
          <Text>{current.short}</Text>
        </HStack>
      </MenuButton>
      <MenuList minW="140px" borderColor={borderColor} py={1} overflow="hidden">
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            fontSize="sm"
            fontWeight={lang.code === current.code ? "bold" : "normal"}
            bg={lang.code === current.code ? activeBg : undefined}
            color={lang.code === current.code ? activeColor : undefined}
            _hover={{ bg: hoverBg }}
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
  const guildsHoverBg = useColorModeValue("yellow.50", "yellow.900");
  const guildsHoverColor = useColorModeValue("yellow.600", "yellow.200");
  const bgColor = useColorModeValue("white", "gray.800");

  const menuItems = [
    {
      name: t("nav.home"),
      path: "/",
      icon: "🏠",
      hoverBg: homeHoverBg,
      hoverColor: homeHoverColor
    },
    {
      name: t("nav.guilds"),
      path: "/guildes",
      icon: "🛡️",
      hoverBg: guildsHoverBg,
      hoverColor: guildsHoverColor
    },
    {
      name: t("nav.characters"),
      path: "/personnages",
      icon: "📖",
      hoverBg: charactersHoverBg,
      hoverColor: charactersHoverColor
    },
    {
      name: t("nav.cycles"),
      path: "/cycles",
      icon: "🔄",
      hoverBg: cyclesHoverBg,
      hoverColor: cyclesHoverColor
    },
    {
      name: t("nav.players"),
      path: "/joueurs",
      icon: "👥",
      hoverBg: usersHoverBg,
      hoverColor: usersHoverColor
    },
    {
      name: t("nav.podium"),
      path: "/podium",
      icon: "🏆",
      hoverBg: podiumHoverBg,
      hoverColor: podiumHoverColor
    },
    {
      name: t("nav.comparator"),
      path: "/comparateur",
      icon: "⚔️",
      hoverBg: comparatorHoverBg,
      hoverColor: comparatorHoverColor
    },
    {
      name: t("nav.guides"),
      path: "/guides",
      icon: "📚",
      hoverBg: guidesHoverBg,
      hoverColor: guidesHoverColor
    },
    {
      name: t("nav.admin"),
      path: "/admin",
      icon: "⚙️",
      hoverBg: adminHoverBg,
      hoverColor: adminHoverColor,
      adminOrGuildManagerOnly: true
    }
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
                <Text fontSize="xs" color="orange.500" lineHeight="short">
                  Admin
                </Text>
              )}
            </VStack>
          </HStack>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            {t("auth.logout")}
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
          {t("auth.login")}
        </Button>
      );
    }
  };

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
          <LanguageSwitcher />
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
          <LanguageSwitcher />
          <ColorModeSwitcher />
          <IconButton
            aria-label={t("nav.openMenu")}
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
                aria-label={t("nav.closeMenu")}
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
                    {t("auth.logout")}
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
                  {t("auth.login")}
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
