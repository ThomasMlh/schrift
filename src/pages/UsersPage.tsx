import { Container, VStack, Heading, Text } from "@chakra-ui/react";
import { UsersTable } from "../components/UsersTable";

const UsersPage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <VStack spacing={2} textAlign="center">
          <Heading size="xl">Gestion des Utilisateurs</Heading>
          <Text color="gray.600">
            Liste de tous les utilisateurs avec leurs informations
          </Text>
        </VStack>
        <UsersTable apiUrl={apiUrl} />
      </VStack>
    </Container>
  );
};

export default UsersPage;