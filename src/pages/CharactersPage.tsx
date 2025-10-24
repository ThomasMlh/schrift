import { Container, Heading, VStack } from "@chakra-ui/react";
import { CharactersTable } from "../components/CharactersTable";

export default function CharactersPage() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">
          Base de données des personnages Ṣčhrīft
        </Heading>
        
        <CharactersTable apiUrl={apiUrl} />
      </VStack>
    </Container>
  );
}