import { Container, Heading, Flex, useColorModeValue, Image } from "@chakra-ui/react";
import { GuildTabsList } from "../components/GuildTabsList";

export default function HomePage() {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Flex w="100%" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* J'aimerais qu'une grand image soit ici qui prend toute la largeur ainsi que la hauteur */}
      <Image
        src="/home/stormisi/personal/schrift/src/assets/logo.png"
        alt="Description de l'image"
        objectFit="cover"
        width="100%"
        height="100%"
      />

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
