import { useEffect, useState } from "react";
import { Container, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import { GuildTabsList, type Guild, type Member } from "../components/ui/GuildTabsList";

export default function HomePage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [membersByGuild, setMembersByGuild] = useState<Record<string, Member[]>>({});
  const bgColor = useColorModeValue('white', 'gray.800');

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setGuilds(data) : setGuilds([]));
  }, []);

  useEffect(() => {
    if (guilds.length > 0) {
      guilds.forEach(guild => {
        fetch(`${apiUrl}/api/guildes/${guild._id}/membres`)
          .then(res => res.json())
          .then(data => {
            setMembersByGuild(prev => ({ ...prev, [guild._id]: Array.isArray(data) ? data : [] }));
          });
      });
    }
  }, [guilds]);

  const sortedGuilds = [...guilds].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

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
        <GuildTabsList guilds={sortedGuilds} membersByGuild={membersByGuild} />
      </Container>
    </Flex>
  );
}
