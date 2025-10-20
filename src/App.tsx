
import { Container, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import { GuildTabsList } from "./components/GuildTabsList";

function App() {
  const bgColor = useColorModeValue('white', 'gray.800');

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
        <Heading mb={8} textAlign="center">Guildes Ṣčhrīft</Heading>
        <GuildTabsList />
      </Container>
    </Flex>
  );
}

export default App;
