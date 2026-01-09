import { Container, Heading, VStack } from "@chakra-ui/react";
import { CharactersTable } from "../components/CharactersTable";
import { SEOHead } from "../components/SEOHead";

const CharactersPage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Personnages Bleach Brave Souls",
    "description": "Base de données complète des personnages de Bleach Brave Souls avec leurs statistiques, affinités et informations détaillées",
    "url": "https://bbs-schrift.fr/personnages"
  };

  return (
    <>
      <SEOHead
        title="Schrift BBS - Base de données complète"
        description="Découvrez tous les personnages de Bleach Brave Souls avec leurs statistiques, affinités, types d'attaque et informations détaillées. Base de données mise à jour régulièrement."
        keywords="Bleach Brave Souls, BBS, personnages, statistiques, affinités, base de données, characters"
        url="https://bbs-schrift.fr/personnages"
        structuredData={structuredData}
      />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center">
            Base de données des personnages Ṣčhrīft
          </Heading>
          
          <CharactersTable apiUrl={apiUrl} />
        </VStack>
      </Container>
    </>
  );
}

export default CharactersPage;