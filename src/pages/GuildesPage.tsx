import {
  Container,
  VStack,
  Heading,
  Box,
  Flex,
  useColorModeValue,
  Image,
  Text,
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

  const cardBg = useColorModeValue("white", "rgba(26, 32, 44, 0.6)");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const countColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const selectedRing = "linear-gradient(135deg, #9F7AEA, #ED64A6)";

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

          {/* Sélecteur de guilde */}
          <Flex gap={3} wrap="wrap" justify="center">
            {guilds.map((guild) => {
              const isSelected = selectedGuild?._id === guild._id;
              const memberCount = guildMemberCounts?.[guild._id] || 0;
              return (
                <Box
                  key={guild._id}
                  as="button"
                  onClick={() => setSelectedGuild(guild)}
                  position="relative"
                  role="group"
                  transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{ transform: "translateY(-2px)" }}
                >
                  {/* Gradient border for selected */}
                  {isSelected && (
                    <Box
                      position="absolute"
                      inset="-1px"
                      borderRadius="xl"
                      background={selectedRing}
                      opacity={0.9}
                      zIndex={0}
                    />
                  )}
                  {/* Glow behind selected */}
                  {isSelected && (
                    <Box
                      position="absolute"
                      inset="-4px"
                      borderRadius="xl"
                      background={selectedRing}
                      opacity={0.15}
                      filter="blur(10px)"
                      zIndex={0}
                    />
                  )}
                  <Flex
                    direction="column"
                    align="center"
                    gap={2}
                    bg={cardBg}
                    backdropFilter="blur(12px)"
                    borderRadius="lg"
                    borderWidth={isSelected ? 0 : "1px"}
                    borderColor={cardBorder}
                    px={5}
                    py={3}
                    position="relative"
                    zIndex={1}
                    _groupHover={{
                      bg: isSelected ? cardBg : hoverBg,
                    }}
                  >
                    {!imageErrors[guild._id] ? (
                      <Image
                        src={`${bucketUrl}/guilds/${guild.name}.png`}
                        alt={guild.name}
                        height="40px"
                        width="auto"
                        onError={() => setImageErrors(prev => ({ ...prev, [guild._id]: true }))}
                      />
                    ) : (
                      <Text fontSize="lg" fontWeight="bold">{guild.name}</Text>
                    )}
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      letterSpacing="wide"
                      color={isSelected ? "purple.300" : countColor}
                    >
                      {memberCount} joueur{memberCount !== 1 ? "s" : ""}
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </Flex>

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
