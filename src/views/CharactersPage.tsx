'use client';
import { Box, Container, VStack } from "@chakra-ui/react";
import { CharactersTable } from "../components/CharactersTable";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { useTranslation } from "react-i18next";

const CharactersPage = () => {
  const { t } = useTranslation();

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
      <Box mb="150px">
        <Box w="100%">
          <HeroSection
            title={t("pages.characters.heroTitle")}
            description={t("pages.characters.heroDescription")}
            badge={{ text: t("pages.characters.heroBadge"), icon: "⚔️" }}
          />
          <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
              <CharactersTable />
            </VStack>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default CharactersPage;