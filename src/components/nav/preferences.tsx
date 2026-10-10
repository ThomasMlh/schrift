import {
  Button,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useLanguage } from "./useLanguage";

const Flag = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} width={18} height={13} alt={alt} style={{ borderRadius: 2 }} />
);

export const LanguageMenu = () => {
  const { t } = useTranslation();
  const { current, setLanguage, languages } = useLanguage();

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        borderRadius="full"
        rightIcon={<ChevronDownIcon />}
        fontWeight="semibold"
        color="text.secondary"
        px={2.5}
        aria-label={t("nav.language")}
      >
        <HStack spacing={1.5}>
          <Flag src={current.flagSrc} alt={current.short} />
          <Text>{current.short}</Text>
        </HStack>
      </MenuButton>
      <MenuList minW="150px" borderRadius="xl" py={1}>
        <MenuOptionGroup type="radio" value={current.code} onChange={(v) => setLanguage(v as string)}>
          {languages.map((lang) => (
            <MenuItemOption key={lang.code} value={lang.code} fontSize="sm">
              <HStack spacing={2}>
                <Flag src={lang.flagSrc} alt={lang.short} />
                <Text>{lang.label}</Text>
              </HStack>
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

export const ColorModeToggle = ({ size = "sm" }: { size?: "xs" | "sm" | "md" }) => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const Icon = colorMode === "light" ? FiMoon : FiSun;

  return (
    <IconButton
      aria-label={t("nav.toggleTheme")}
      title={t("nav.toggleTheme")}
      onClick={toggleColorMode}
      variant="ghost"
      borderRadius="full"
      color="text.secondary"
      icon={<Icon />}
      size={size}
    />
  );
};
