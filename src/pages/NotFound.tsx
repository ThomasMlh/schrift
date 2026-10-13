import { Box, Button, Container, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiHome, FiAward, FiCalendar, FiShield } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const QUICK_LINKS = [
  { to: "/podium", icon: FiAward, key: "linkPodium" },
  { to: "/cycles", icon: FiCalendar, key: "linkCycles" },
  { to: "/guildes", icon: FiShield, key: "linkGuilds" },
] as const;

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container maxW="container.md" py={{ base: 16, md: 24 }}>
      <VStack spacing={6} textAlign="center">
        <Box position="relative">
          <Box
            position="absolute"
            inset="15%"
            bgGradient="radial(purple.500, transparent 70%)"
            opacity={0.25}
            filter="blur(40px)"
            pointerEvents="none"
            aria-hidden
          />
          <Text
            position="relative"
            fontSize={{ base: "7xl", md: "9xl" }}
            fontWeight="black"
            lineHeight={1}
            letterSpacing="tighter"
            bgGradient="linear(to-r, purple.300, blue.400)"
            bgClip="text"
          >
            404
          </Text>
        </Box>

        <VStack spacing={2}>
          <Text as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="text.strong">
            {t("pages.notFound.title")}
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} color="text.secondary" maxW="md">
            {t("pages.notFound.message")}
          </Text>
        </VStack>

        <Button as={Link} to="/" colorScheme="purple" size="lg" leftIcon={<Icon as={FiHome} />}>
          {t("pages.notFound.backHome")}
        </Button>

        <Flex direction="column" align="center" gap={3} pt={4}>
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.muted">
            {t("pages.notFound.orGoTo")}
          </Text>
          <HStack spacing={2} flexWrap="wrap" justify="center">
            {QUICK_LINKS.map(({ to, icon, key }) => (
              <Button
                key={to}
                as={Link}
                to={to}
                variant="outline"
                size="sm"
                borderRadius="full"
                leftIcon={<Icon as={icon} />}
              >
                {t(`pages.notFound.${key}`)}
              </Button>
            ))}
          </HStack>
        </Flex>
      </VStack>
    </Container>
  );
};

export default NotFound;
