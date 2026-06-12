import { Container, VStack, Box } from "@chakra-ui/react";
import UsersTable from "../components/UsersTable";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";

const UsersPage = () => {
  const { t } = useTranslation();

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
        title={t("pages.players.seoTitle")}
        description={t("pages.players.seoDescription")}
        keywords="joueurs, classements, statistiques"
        url="https://bbs-schrift.fr/joueurs"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title={t("pages.players.heroTitle")}
          description={t("pages.players.heroDescription")}
          badge={{ text: t("pages.players.heroBadge"), icon: "👥" }}
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
