import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { LoginButton } from "./UserMenu";
import { useLanguage } from "./useLanguage";
import { NAV_GROUP_LABELS, NAV_ITEMS, isActivePath, type NavGroup } from "./navConfig";
import { useNavAccount } from "./useNavAccount";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SectionLabel = ({ children }: { children: string }) => (
  <Text px={3} pt={3} pb={1} fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.muted">
    {children}
  </Text>
);

// Menu latéral mobile : compte en tête, liens par groupe, puis langue, thème et déconnexion
export const MobileNavDrawer = ({ isOpen, onClose }: MobileNavDrawerProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { colorMode, setColorMode } = useColorMode();
  const { current, setLanguage, languages } = useLanguage();
  const { isLoggedIn, isAdmin, canSeeAdmin, avatar, displayName, roleLabel, profileUrl, handleLogout } = useNavAccount();

  const groups: NavGroup[] = ["explore", "compete", "resources"];
  const visible = NAV_ITEMS.filter((item) => !item.footerOnly && !item.adminOrGuildManagerOnly);
  const adminItem = NAV_ITEMS.find((item) => item.adminOrGuildManagerOnly);

  const renderLink = (item: (typeof NAV_ITEMS)[number]) => {
    const active = isActivePath(pathname, item.path);
    return (
      <Button
        key={item.path}
        as={Link}
        to={item.path}
        onClick={onClose}
        variant="ghost"
        display="flex"
        w="100%"
        justifyContent="flex-start"
        h={10}
        flexShrink={0}
        px={3}
        borderRadius="lg"
        fontSize="sm"
        fontWeight={active ? "bold" : "medium"}
        color={active ? "accent" : "text.body"}
        bg={active ? "rgba(124,58,237,0.12)" : undefined}
        _hover={{ bg: "bg.hover" }}
        leftIcon={<Icon as={item.icon} boxSize={4} color={active ? "accent" : "text.muted"} />}
      >
        {t(item.labelKey)}
      </Button>
    );
  };

  return (
    <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
      <DrawerOverlay sx={{ backdropFilter: "blur(4px)" }} />
      <DrawerContent bg="bg.card" borderRightWidth="1px" borderColor="border.subtle" pt="var(--sait, 0px)">
        <Flex justify="space-between" align="center" px={4} h={16} borderBottomWidth="1px" borderColor="border.subtle" flexShrink={0}>
          <BrandLogo onClick={onClose} />
          <IconButton
            aria-label={t("nav.closeMenu")}
            icon={<CloseIcon boxSize={3} />}
            variant="ghost"
            borderRadius="full"
            size="sm"
            onClick={onClose}
          />
        </Flex>

        <DrawerBody px={3} py={3}>
          {/* Compte */}
          {isLoggedIn ? (
            <HStack
              as={profileUrl ? Link : "div"}
              {...(profileUrl ? { to: profileUrl } : {})}
              onClick={onClose}
              spacing={3}
              p={3}
              borderRadius="xl"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={profileUrl ? { borderColor: "border.strong" } : undefined}
            >
              <Avatar size="md" src={avatar} name={displayName} />
              <Box flex={1} minW={0}>
                <Text fontWeight="bold" color="text.strong" noOfLines={1}>{displayName}</Text>
                <Text fontSize="xs" fontWeight="semibold" color={isAdmin ? "accent" : "text.muted"}>{roleLabel}</Text>
              </Box>
              {profileUrl && <Icon as={FiChevronRight} color="text.muted" />}
            </HStack>
          ) : (
            <VStack spacing={3} p={3} borderRadius="xl" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle" align="stretch">
              <Text fontSize="sm" color="text.secondary">{t("nav.loginHint")}</Text>
              <LoginButton fullWidth />
            </VStack>
          )}

          {/* Liens */}
          <Box mt={2}>
            {groups.map((group) => {
              const items = visible.filter((item) => item.group === group);
              if (!items.length) return null;
              return (
                <Box key={group}>
                  <SectionLabel>{t(NAV_GROUP_LABELS[group])}</SectionLabel>
                  {items.map(renderLink)}
                </Box>
              );
            })}
            {canSeeAdmin && adminItem && (
              <Box>
                <SectionLabel>{t("nav.groupAccount")}</SectionLabel>
                {renderLink(adminItem)}
              </Box>
            )}
          </Box>

          {/* Préférences */}
          <VStack spacing={3} align="stretch" mt={4} pt={4} px={1} borderTopWidth="1px" borderColor="border.subtle">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium" color="text.secondary">{t("nav.language")}</Text>
              <ButtonGroup size="sm" isAttached variant="outline">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    isActive={lang.code === current.code}
                    _active={{ bg: "rgba(124,58,237,0.15)", color: "accent", borderColor: "accent" }}
                  >
                    {lang.short}
                  </Button>
                ))}
              </ButtonGroup>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium" color="text.secondary">{t("nav.theme")}</Text>
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  leftIcon={<FiSun />}
                  onClick={() => setColorMode("light")}
                  isActive={colorMode === "light"}
                  _active={{ bg: "rgba(124,58,237,0.15)", color: "accent", borderColor: "accent" }}
                >
                  {t("nav.themeLight")}
                </Button>
                <Button
                  leftIcon={<FiMoon />}
                  onClick={() => setColorMode("dark")}
                  isActive={colorMode === "dark"}
                  _active={{ bg: "rgba(124,58,237,0.15)", color: "accent", borderColor: "accent" }}
                >
                  {t("nav.themeDark")}
                </Button>
              </ButtonGroup>
            </HStack>
          </VStack>
        </DrawerBody>

        {isLoggedIn && (
          <DrawerFooter px={3} pb="calc(12px + var(--saib, 0px))" borderTopWidth="1px" borderColor="border.subtle">
            <Button
              w="100%"
              variant="ghost"
              colorScheme="red"
              borderRadius="lg"
              leftIcon={<FiLogOut />}
              onClick={() => { handleLogout(); onClose(); }}
            >
              {t("auth.logout")}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
