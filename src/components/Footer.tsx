import { Box, Button, ButtonGroup, Flex, HStack, Link as ChakraLink, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../providers/AuthProvider";
import { BrandLogo } from "./nav/BrandLogo";
import { ColorModeToggle } from "./nav/preferences";
import { useLanguage } from "./nav/useLanguage";
import { NAV_GROUP_LABELS, NAV_ITEMS, type NavGroup } from "./nav/navConfig";

const GROUPS: NavGroup[] = ["explore", "compete", "resources"];

export const Footer = () => {
  const { t } = useTranslation();
  const { isAdmin, isGuildManager } = useAuth();
  const { current, setLanguage, languages } = useLanguage();

  // Home is already the logo; admin stays in the account menu
  const links = NAV_ITEMS.filter((item) => item.path !== "/" && !item.adminOrGuildManagerOnly);
  const canSeeAdmin = isAdmin || isGuildManager;

  return (
    <Box as="footer" w="100%" mt="auto" bg="bg.card" borderTopWidth="1px" borderColor="border.subtle">
      <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 6 }} pt={{ base: 8, md: 10 }} pb={6}>
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 8, lg: 16 }}>
          <VStack align="start" spacing={3} maxW={{ lg: "sm" }}>
            <BrandLogo label="Schrift BBS" />
            <Text fontSize="sm" color="text.secondary">{t("footer.tagline")}</Text>
            <Text fontSize="xs" color="text.muted" lineHeight="tall">{t("footer.disclaimer")}</Text>
          </VStack>

          <SimpleGrid columns={{ base: 2, sm: 3 }} spacingX={8} spacingY={6} flex={1}>
            {GROUPS.map((group) => (
              <VStack key={group} as="nav" align="start" spacing={2.5} aria-label={t(NAV_GROUP_LABELS[group])}>
                <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.muted">
                  {t(NAV_GROUP_LABELS[group])}
                </Text>
                {links
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <ChakraLink key={item.path} as={Link} to={item.path} fontSize="sm" color="text.secondary" _hover={{ color: "accent" }}>
                      {t(item.labelKey)}
                    </ChakraLink>
                  ))}
                {group === "resources" && canSeeAdmin && (
                  <ChakraLink as={Link} to="/admin" fontSize="sm" color="text.secondary" _hover={{ color: "accent" }}>
                    {t("nav.admin")}
                  </ChakraLink>
                )}
              </VStack>
            ))}
          </SimpleGrid>
        </Flex>

        <Stack
          direction={{ base: "column-reverse", sm: "row" }}
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          spacing={3}
          mt={8}
          pt={5}
          borderTopWidth="1px"
          borderColor="border.subtle"
        >
          <Text fontSize="xs" color="text.muted">
            © {new Date().getFullYear()} Schrift BBS · {t("footer.copyrights")}
          </Text>
          <HStack spacing={2}>
            <ButtonGroup size="xs" variant="ghost" spacing={0}>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  color={lang.code === current.code ? "accent" : "text.muted"}
                  fontWeight={lang.code === current.code ? "bold" : "medium"}
                  aria-pressed={lang.code === current.code}
                >
                  {lang.short}
                </Button>
              ))}
            </ButtonGroup>
            <Box w="1px" h={4} bg="border.subtle" />
            <ColorModeToggle size="xs" />
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
};
