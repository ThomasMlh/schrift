import { Container, Heading, Flex, useColorModeValue, Button, HStack } from "@chakra-ui/react";
import { GuildsAdminSection } from "../components/GuildsAdminSection";
import { CyclesSection } from "../components/CyclesSection";
import { ScoresSection } from "../components/ScoresSection";
import { useState } from "react";
import type { AdminPage as IAdminPage } from "../interfaces";

const AdminPage = () => {
  const [currentPage, setCurrentPage] = useState<IAdminPage>("guilds");
  const bgColor = useColorModeValue('white', 'gray.800');

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
        </HStack>

        {renderPage()}
      </Container>
    </Flex>
  );
}

export default AdminPage;
