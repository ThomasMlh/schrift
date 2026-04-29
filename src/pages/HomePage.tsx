import { Container, VStack, Flex } from "@chakra-ui/react";
import { CurrentInfoSection } from "../components/CurrentInfoSection";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "../components/SEOHead";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Schrift BBS",
    "description": "Guildes communautaires pour Bleach Brave Souls - Classements, rotations et statistiques",
    "url": "https://bbs-schrift.fr",
    "publisher": {
      "@type": "Organization",
      "name": "Schrift BBS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bbs-schrift.fr/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bbs-schrift.fr/personnages?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "about": {
      "@type": "Game",
      "name": "Bleach Brave Souls"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Navigation principale",
      "numberOfItems": 8,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Personnages",
          "url": "https://bbs-schrift.fr/personnages"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Podium",
          "url": "https://bbs-schrift.fr/podium"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Cycles",
          "url": "https://bbs-schrift.fr/cycles"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Scores",
          "url": "https://bbs-schrift.fr/scores"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Joueurs",
          "url": "https://bbs-schrift.fr/joueurs"
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Guildes",
          "url": "https://bbs-schrift.fr/guildes"
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "Comparateur",
          "url": "https://bbs-schrift.fr/comparateur"
        },
        {
          "@type": "ListItem",
          "position": 8,
          "name": "Guides",
          "url": "https://bbs-schrift.fr/guides"
        }
      ]
    }
  };

  return (
    <>
      <SEOHead
        title="Schrift BBS - Guildes Bleach Brave Souls"
        description="Découvrez les guildes Schrift A, B, C et D pour Bleach Brave Souls. Rejoignez notre communauté et participez aux classements et rotations."
        keywords="Bleach Brave Souls, BBS, guildes, Schrift, communauté, classement"
        url="https://bbs-schrift.fr"
        structuredData={structuredData}
      />

      <HeroSection
        title={t("pages.home.heroTitle")}
        description={t("pages.home.heroDescription")}
      />

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={10}>
        <VStack spacing={10} w="100%">
          <Flex w="100%" direction="column">
            <CurrentInfoSection />
          </Flex>
        </VStack>
      </Container>
    </>
  );
}

export default HomePage;