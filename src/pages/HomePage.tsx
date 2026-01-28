import { Container, Flex, Box, VStack } from "@chakra-ui/react";
import { CurrentInfoSection } from "../components/CurrentInfoSection";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "../components/SEOHead";
// const imageSchrift = new URL('../assets/logo.png', import.meta.url).href;

const HomePage = () => {

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Schrift BBS",
    "description": "Guildes communautaires pour Bleach Brave Souls",
    "url": "https://bbs-schrift.fr",
    "logo": "https://bbs-schrift.fr/logo.png",
    "sameAs": [],
    "memberOf": {
      "@type": "Game",
      "name": "Bleach Brave Souls"
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
      <Flex w="100%" align="center" justify="center" flexDir="column">
        <HeroSection
          title="Guildes Ṣčhrīft"
          description="Rejoignez notre communauté Bleach Brave Souls et dominez les classements avec les meilleures guildes"
        />

        <Container
          maxW="container.xl"
          px={{ base: 4, md: 6 }}
          py={8}
        >
          <VStack spacing={8} w="100%">
            <Box w="100%">
              <CurrentInfoSection />
            </Box>
          </VStack>
        </Container>
      </Flex>
    </>
  );
}

export default HomePage;