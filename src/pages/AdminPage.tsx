import { Container, Heading, Flex, useColorModeValue, Button, HStack, useToast } from "@chakra-ui/react";
import { GuildsAdminSection } from "../components/GuildsAdminSection";
import { CyclesSection } from "../components/CyclesSection";
import { ScoresSection } from "../components/ScoresSection";
import { useState } from "react";
import type { AdminPage as IAdminPage } from "../interfaces";

const AdminPage = () => {
  const [currentPage, setCurrentPage] = useState<IAdminPage>("guilds");
  const [isUpdatingCharacters, setIsUpdatingCharacters] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const handleUpdateCharacters = () => {
    const token = localStorage.getItem('userToken');
    // En utilisant Toast pour les notifications
    setIsUpdatingCharacters(true);

    fetch(`${apiUrl}/api/characters/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message || "Erreur lors de la mise à jour des personnages");
      toast({ title: data.message || "Personnages mis à jour", status: "success" });
    })
    .catch((error) => {
      toast({ title: error.message || "Erreur lors de la mise à jour des personnages", status: "error" });
    })
    .finally(() => setIsUpdatingCharacters(false));
  }

  const renderPage = () => {
    switch (currentPage) {
      case "cycles":
        return <CyclesSection />;
      case "scores":
        return <ScoresSection />;
      case "guilds":
      default:
        return <GuildsAdminSection />;
    }
  };

  return (
    <Flex w="100%" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
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
      >
        {/* En-tête */}
        <Heading mb={6} textAlign="center">Administration Ṣčhrīft</Heading>
        
        {/* Navigation */}
        <HStack spacing={4} mb={6}>
          <Button
            variant={currentPage === "guilds" ? "solid" : "outline"}
            colorScheme="orange"
            onClick={() => setCurrentPage("guilds")}
          >
            🏰 Guildes
          </Button>
          <Button
            variant={currentPage === "cycles" ? "solid" : "outline"}
            colorScheme="orange"
            onClick={() => setCurrentPage("cycles")}
          >
            🔄 Cycles
          </Button>
          <Button
            variant={currentPage === "scores" ? "solid" : "outline"}
            colorScheme="orange"
            onClick={() => setCurrentPage("scores")}
          >
            📊 Scores
          </Button>
          {/* // Un bouton qui fait un call post vers /api/characters/update */}
          <Button
            variant="outline"
            colorScheme="orange"
            onClick={handleUpdateCharacters}
            isLoading={isUpdatingCharacters}
            loadingText="Mise à jour..."
          >
            🔄 Mettre à jour les personnages
          </Button>
        </HStack>

        {renderPage()}
      </Container>
    </Flex>
  );
}

export default AdminPage;
