
import { Container, Heading, Flex, useColorModeValue, Button, HStack } from "@chakra-ui/react";
import { GuildTabsList } from "./components/GuildTabsList";
import { CharactersTable } from "./components/CharactersTable";
import { useState } from "react";
import type { Page } from "./interfaces";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("guilds");
  const bgColor = useColorModeValue('white', 'gray.800');
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const renderPage = () => {
    switch (currentPage) {
      case "characters":
        return (
          <>
            <Heading mb={8} textAlign="center">Base de données des personnages Ṣčhrīft</Heading>
            <CharactersTable apiUrl={apiUrl} />
          </>
        );
      case "guilds":
      default:
        return (
          <>
            <Heading mb={8} textAlign="center">Guildes Ṣčhrīft</Heading>
            <GuildTabsList />
          </>
        );
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
        {/* Navigation */}
        <HStack spacing={4} mb={6}>
          <Button
            variant={currentPage === "guilds" ? "solid" : "outline"}
            onClick={() => setCurrentPage("guilds")}
          >
            🏰 Guildes
          </Button>
          <Button
            variant={currentPage === "characters" ? "solid" : "outline"}
            onClick={() => setCurrentPage("characters")}
          >
            📖 Personnages
          </Button>
        </HStack>

        {renderPage()}
      </Container>
    </Flex>
  );
}

export default App;
