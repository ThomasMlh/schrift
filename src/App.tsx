import { useEffect, useState } from "react";
import { Container, Heading, Flex, useColorModeValue } from "@chakra-ui/react";

// Types pour usage local si besoin
type GuildAPI = { id: number; name: string };

// ...

export function useGuildes() {
  const [guildes, setGuildes] = useState<GuildAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/guildes")
      .then(res => res.json())
      .then(data => {
        setGuildes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { guildes, loading, error };
}

function GuildesList() {
  const { guildes, loading, error } = useGuildes();
  if (loading) return <Flex minH="100%" w="100%" align="center" justify="center">Chargement...</Flex>;
  if (error) return <Flex minH="100%" w="100%" align="center" justify="center">Erreur : {error.message}</Flex>;
  if (!Array.isArray(guildes)) return <Flex minH="100%" w="100%" align="center" justify="center">Aucunes guildes</Flex>;
  return (
    <ul>
      {guildes.map((g) => (
        <li key={g.id}>Ṣčhrīft {g.name}</li>
      ))}
    </ul>
  );
}

function App() {
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
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="none"
      >
        <Heading mb={8} textAlign="center">Guildes Ṣčhrīft</Heading>
        <GuildesList />
      </Container>
    </Flex>
  );
}

export default App;
