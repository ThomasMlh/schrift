import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../providers/AuthProvider";
import { BrandLogo } from "./nav/BrandLogo";
import { MobileNavDrawer } from "./nav/MobileNavDrawer";
import { UserMenu } from "./nav/UserMenu";
import { ColorModeToggle, LanguageMenu } from "./nav/preferences";
import { NAV_ITEMS, isActivePath, type NavItem } from "./nav/navConfig";

// Top bar link: the active tab is underlined in purple along the bar's bottom edge
const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => {
  const { t } = useTranslation();
  return (
    <HStack
      as={Link}
      to={item.path}
      spacing={1.5}
      position="relative"
      h="100%"
      px={{ xl: 2.5, "2xl": 3.5 }}
      fontSize="sm"
      fontWeight={active ? "bold" : "medium"}
      color={active ? "accent" : "text.secondary"}
      transition="color 0.15s"
      _hover={{ color: active ? "accent" : "text.strong" }}
      aria-current={active ? "page" : undefined}
      _after={{
        content: '""',
        position: "absolute",
        left: 2,
        right: 2,
        bottom: "-1px",
        h: "2px",
        borderRadius: "full",
        bg: active ? "accent" : "transparent",
      }}
    >
      <Icon as={item.icon} boxSize={4} aria-hidden />
      <Box as="span" whiteSpace="nowrap">{t(item.labelKey)}</Box>
    </HStack>
  );
};

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAdmin, isGuildManager } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const items = NAV_ITEMS.filter(
    (item) => !item.footerOnly && (!item.adminOrGuildManagerOnly || isAdmin || isGuildManager)
  );
  const primary = items.filter((item) => item.primary);
  const more = items.filter((item) => !item.primary);
  const moreActive = more.some((item) => isActivePath(pathname, item.path));

  return (
    <Box
      as="nav"
      w="100%"
      px={{ base: 3, md: 5 }}
      id="main-navbar"
      zIndex={10}
      position="sticky"
      top="var(--sait, 0px)"
      // Same tint as bg.card, slightly translucent under the blur
      bg="rgba(255,255,255,0.9)"
      _dark={{ bg: "rgba(26,32,44,0.9)" }}
      sx={{ backdropFilter: "blur(12px)" }}
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Flex h={16} align="center" justify="space-between" gap={4}>
        <BrandLogo />

        <HStack as="ul" listStyleType="none" spacing={0} h="100%" flex={1} minW={0} display={{ base: "none", xl: "flex" }}>
          {primary.map((item) => (
            <Box as="li" key={item.path} h="100%">
              <NavLink item={item} active={isActivePath(pathname, item.path)} />
            </Box>
          ))}
          {more.length > 0 && (
            <Box as="li" h="100%" display="flex" alignItems="center" pl={1}>
              <Menu placement="bottom-start">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                  fontWeight={moreActive ? "bold" : "medium"}
                  color={moreActive ? "accent" : "text.secondary"}
                  rightIcon={<ChevronDownIcon />}
                >
                  {t("nav.more")}
                </MenuButton>
                <MenuList minW="200px" borderRadius="xl" py={1}>
                  {more.map((item) => {
                    const active = isActivePath(pathname, item.path);
                    return (
                      <MenuItem
                        key={item.path}
                        as={Link}
                        to={item.path}
                        icon={<Icon as={item.icon} boxSize={4} />}
                        fontSize="sm"
                        fontWeight={active ? "bold" : "normal"}
                        color={active ? "accent" : undefined}
                      >
                        {t(item.labelKey)}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
            </Box>
          )}
        </HStack>

        <HStack spacing={1} flexShrink={0} display={{ base: "none", xl: "flex" }}>
          <LanguageMenu />
          <ColorModeToggle />
          <Box w="1px" h={6} bg="border.subtle" mx={2} />
          <UserMenu />
        </HStack>

        <IconButton
          display={{ base: "inline-flex", xl: "none" }}
          aria-label={t("nav.openMenu")}
          icon={<HamburgerIcon boxSize={5} />}
          variant="ghost"
          borderRadius="full"
          onClick={onOpen}
        />
      </Flex>

      <MobileNavDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};
