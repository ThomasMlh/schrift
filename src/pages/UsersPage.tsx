import { Container, VStack, Box } from "@chakra-ui/react";
import UsersTable from "../components/UsersTable";
import { HeroSection } from "../components/HeroSection";

const UsersPage = () => {

  return (
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
  );
};

export default UsersPage;