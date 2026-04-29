import { Box, Container, Flex, Text, VStack, Badge, useColorMode } from "@chakra-ui/react";
import { CharactersTable } from "../components/CharactersTable";
import { SEOHead } from "../components/SEOHead";
import { useTranslation } from "react-i18next";

const CharactersPage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Personnages Bleach Brave Souls",
    "description": "Base de données complète des personnages de Bleach Brave Souls avec leurs statistiques, affinités et informations détaillées",
    "url": "https://bbs-schrift.fr/personnages",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Liste des personnages BBS",
      "description": "Tous les personnages jouables de Bleach Brave Souls"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://bbs-schrift.fr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Personnages",
          "item": "https://bbs-schrift.fr/personnages"
        }
      ]
    },
    "about": {
      "@type": "Game",
      "name": "Bleach Brave Souls"
    }
  };

  return (
    <>
      <SEOHead
        title={t("pages.characters.seoTitle")}
        description={t("pages.characters.seoDescription")}
        keywords="Bleach Brave Souls, BBS, personnages, statistiques, affinités, base de données, characters"
        url="https://bbs-schrift.fr/personnages"
        structuredData={structuredData}
      />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Flex align="center" gap={3} mb={1}>
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
                bgClip="text"
              >
                {t("pages.characters.heading")}
              </Text>
              <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3} fontSize="xs">
                BBS
              </Badge>
            </Flex>
            <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
              {t("pages.characters.seoDescription")}
            </Text>
          </Box>

          <CharactersTable apiUrl={apiUrl} />
        </VStack>
      </Container>
    </>
  );
}

export default CharactersPage;