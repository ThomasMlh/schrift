import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { startDiscordLogin } from "@/utils/discordAuth";
import { BRAND_GRADIENT } from "./navConfig";
import { useNavAccount } from "./useNavAccount";

export const LoginButton = ({ fullWidth = false }: { fullWidth?: boolean }) => {
  const { t } = useTranslation();
  return (
    <Button
      leftIcon={<FaDiscord />}
      size="sm"
      borderRadius="full"
      color="white"
      bgGradient={BRAND_GRADIENT}
      _hover={{ bgGradient: "linear(to-br, #6D28D9, #4338CA)" }}
      _active={{ bgGradient: "linear(to-br, #5B21B6, #3730A3)" }}
      w={fullWidth ? "100%" : undefined}
      onClick={startDiscordLogin}
    >
      {t("auth.login")}
    </Button>
  );
};

// Avatar cliquable de la barre du haut : profil, admin et déconnexion dans un menu
export const UserMenu = () => {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, canSeeAdmin, avatar, displayName, roleLabel, profileUrl, handleLogout } = useNavAccount();

  if (!isLoggedIn) return <LoginButton />;

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        h={9}
        pl={1}
        pr={2}
        borderRadius="full"
        aria-label={t("nav.accountMenu")}
        rightIcon={<ChevronDownIcon color="text.muted" />}
      >
        <HStack spacing={2}>
          <Avatar size="xs" src={avatar} name={displayName} />
          <Text
            display={{ base: "none", "2xl": "block" }}
            fontSize="sm"
            fontWeight="semibold"
            color="text.strong"
            maxW="140px"
            noOfLines={1}
          >
            {displayName}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList minW="230px" borderRadius="xl" py={2}>
        <HStack spacing={3} px={3} pb={2}>
          <Avatar size="sm" src={avatar} name={displayName} />
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="bold" color="text.strong" noOfLines={1}>{displayName}</Text>
            <Text fontSize="xs" fontWeight="semibold" color={isAdmin ? "accent" : "text.muted"}>{roleLabel}</Text>
          </Box>
        </HStack>
        <MenuDivider my={1} />
        {profileUrl && (
          <MenuItem as={Link} to={profileUrl} icon={<Icon as={FiUser} boxSize={4} />} fontSize="sm">
            {t("nav.myProfile")}
          </MenuItem>
        )}
        {canSeeAdmin && (
          <MenuItem as={Link} to="/admin" icon={<Icon as={FiSettings} boxSize={4} />} fontSize="sm">
            {t("nav.admin")}
          </MenuItem>
        )}
        {(profileUrl || canSeeAdmin) && <MenuDivider my={1} />}
        <MenuItem
          icon={<Icon as={FiLogOut} boxSize={4} />}
          fontSize="sm"
          color="red.500"
          _dark={{ color: "red.300" }}
          onClick={handleLogout}
        >
          {t("auth.logout")}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
