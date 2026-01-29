import {
  Container,
  VStack,
  Heading,
  Box,
  Button,
  HStack,
  Flex,
  useColorModeValue,
  Image,
  Text,
  Badge
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { SEOHead } from "../components/SEOHead";
import { GuildOrgChart } from "../components/GuildOrgChart";
import { useGuilds, useAllGuildsMemberCounts } from "@/hooks/useAPI";
import type { IGuild } from "../interfaces";

const GuildesPage = () => {
  const { guilds } = useGuilds(true);
  const [selectedGuild, setSelectedGuild] = useState<IGuild | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const bucketUrl = import.meta.env.VITE_BUCKET_URL;

  const buttonBg = useColorModeValue("white", "gray.700");
  const buttonHoverBg = useColorModeValue("blue.50", "blue.900");
  const selectedBg = useColorModeValue("blue.500", "blue.600");
  const selectedColor = "white";
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const selectedBorderColor = useColorModeValue("blue.600", "blue.400");

  // Sélectionner la première guilde par défaut
  useEffect(() => {
    if (guilds.length > 0 && !selectedGuild) {
      setSelectedGuild(guilds[0]);
    }
  }, [guilds, selectedGuild]);

  // Récupérer le nombre de membres et les membres pour toutes les guildes via useAPI
  const { memberCounts: guildMemberCounts, membersByGuild, isLoading } = useAllGuildsMemberCounts(guilds, true);
  
  // Récupérer les membres de la guilde sélectionnée depuis les données déjà chargées
  const members = selectedGuild ? (membersByGuild[selectedGuild._id] || []) : [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Guildes Schrift BBS",
    "description": "Découvrez l'organisation des guildes Schrift pour Bleach Brave Souls",
    "url": "https://bbs-schrift.fr/guildes"
  };

  return (
    <>
      <SEOHead
        title="Guildes - Schrift BBS"
        description="Découvrez l'organisation des guildes Schrift A, B, C et D pour Bleach Brave Souls. Consultez la hiérarchie et les membres de chaque guilde."
        keywords="Bleach Brave Souls, BBS, guildes, Schrift, organisation, membres"
        url="https://bbs-schrift.fr/guildes"
        structuredData={structuredData}
      />

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} w="100%">
          <Heading as="h1" size="xl" textAlign="center">
            Guildes Ṣčhrīft
          </Heading>

          {/* Sélecteur de guilde - Système de boutons */}
          <HStack spacing={4} wrap="wrap" justify="center">
            {guilds.map((guild) => (
              <Button
                key={guild._id}
                size="lg"
                onClick={() => setSelectedGuild(guild)}
                bg={selectedGuild?._id === guild._id ? selectedBg : buttonBg}
                color={selectedGuild?._id === guild._id ? selectedColor : undefined}
                _hover={{
                  bg: selectedGuild?._id === guild._id ? selectedBg : buttonHoverBg,
                  transform: "scale(1.05)",
                  boxShadow: "lg"
                }}
                border="3px solid"
                borderColor={selectedGuild?._id === guild._id ? selectedBorderColor : borderColor}
                boxShadow={selectedGuild?._id === guild._id ? "xl" : "md"}
                fontWeight="bold"
                px={8}
                py={6}
                h="auto"
                transition="all 0.2s"
                position="relative"
              >
                <VStack spacing={2}>
                  {!imageErrors[guild._id] ? (
                    <Image 
                      src={`${bucketUrl}/guilds/${guild.name}.png`} 
                      alt={guild.name} 
                      height="50px" 
                      width="auto"
                      onError={() => setImageErrors(prev => ({ ...prev, [guild._id]: true }))}
                    />
                  ) : (
                    <Text fontSize="xl">{guild.name}</Text>
                  )}
                  <Badge 
                    colorScheme={selectedGuild?._id === guild._id ? "white" : "blue"}
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {guildMemberCounts?.[guild._id] || 0} joueur{guildMemberCounts?.[guild._id] !== 1 ? 's' : ''}
                  </Badge>
                </VStack>
              </Button>
            ))}
          </HStack>

          {/* Organigramme */}
          <Box w="100%" minH="400px">
            {isLoading ? (
              <Flex justify="center" align="center" h="400px">
                <Heading size="md" color="gray.500">
                  Chargement...
                </Heading>
              </Flex>
            ) : (
              <GuildOrgChart members={members} />
            )}
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default GuildesPage;
