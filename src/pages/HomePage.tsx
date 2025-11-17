import { Container, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import { GuildTabsList } from "../components/GuildTabsList";
import { PodiumSection } from "../components/PodiumSection";
import { CurrentInfoSection } from "../components/CurrentInfoSection";
import { SEOHead } from "../components/SEOHead";
// const imageSchrift = new URL('../assets/logo.png', import.meta.url).href;

export default function HomePage() {
  const bgColor = useColorModeValue('white', 'gray.800');

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
      <Flex w="100%" align="center" justify="center" flexDir={"column"} bg={useColorModeValue('gray.50', 'gray.900')}>
        {/* <Image 
          src={imageSchrift} 
          alt="Logo de Ṣčhrīft" 
          w="100%" 
          h="auto" 
          objectFit="cover" 
          background="unset"
        /> */}
        <Container
          maxW="100vw"
          w="100%"
          px={0}
          py={8}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-start"
          bg={bgColor}
          boxShadow="none"
          gap={8}
        >
          <Heading mb={2} textAlign="center">Guildes Ṣčhrīft</Heading>
          
          {/* Section Informations Actuelles */}
          <CurrentInfoSection />
          
          <GuildTabsList />
          
          {/* Section Podium */}
          <PodiumSection />
        </Container>
      </Flex>
    </>
  );
}
