import { Container, VStack, Box } from "@chakra-ui/react";
import UsersTable from "../components/UsersTable";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "@/components/SEOHead";

const UsersPage = () => {

    const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Liste des joueurs - Bleach Brave Souls | Schrift BBS",
    "description": "Cycles de rotation et événements pour Bleach Brave Souls avec détails des rotations et classements",
    "url": "https://bbs-schrift.fr/joueurs",
  };

  return (
    <>
      <SEOHead
        title="Schrift BBS - Liste des joueurs"
        description="Découvrez tous les joueurs de Bleach Brave Souls. Consultez leurs statistiques, classements et informations de guilde."
        keywords="joueurs, classements, statistiques"
        url="https://bbs-schrift.fr/joueurs"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title="Liste des joueurs"
          description="Liste de tous les joueurs avec leurs informations"
          badge={{ text: "Joueurs", icon: "👥" }}
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            <UsersTable />
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default UsersPage;
