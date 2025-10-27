import { Container, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import { GuildTabsList } from "../components/GuildTabsList";
// const imageSchrift = new URL('../assets/logo.png', import.meta.url).href;

export default function HomePage() {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Flex w="100%" align="center" justify="center" flexDir={"column"} bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* <Image 
        src={imageSchrift} 
        alt="Logo de Ṣčhrīft" 
        w="100%" 
        h="auto" 
        objectFit="cover" 
        background="unset"
      /> */}
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
