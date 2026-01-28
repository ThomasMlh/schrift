import {
  Container,
  VStack,
  Heading,
  Box,
  Button,
  HStack,
  useToast,
  Flex,
  useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { SEOHead } from "../components/SEOHead";
import { GuildOrgChart } from "../components/GuildOrgChart";
import { useGuilds } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import type { IUser, IGuild } from "../interfaces";

const GuildesPage = () => {
  const { getAuthHeaders } = useAuth();
  const { guilds } = useGuilds(true);
  const [selectedGuild, setSelectedGuild] = useState<IGuild | null>(null);
  const [members, setMembers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const buttonBg = useColorModeValue("white", "gray.800");
  const buttonHoverBg = useColorModeValue("blue.50", "blue.900");
  const selectedBg = useColorModeValue("blue.500", "blue.600");
  const selectedColor = "white";

  // Sélectionner la première guilde par défaut
  useEffect(() => {
    if (guilds.length > 0 && !selectedGuild) {
      setSelectedGuild(guilds[0]);
    }
  }, [guilds, selectedGuild]);

  // Charger les membres de la guilde sélectionnée
  useEffect(() => {
    if (!selectedGuild || !apiUrl) return;

    setIsLoading(true);
    fetch(`${apiUrl}/api/guildes/${selectedGuild._id}/membres`, {
      headers: getAuthHeaders()
    })
      .then((res) => res.json())
      .then((data) => {
        const membersList = data.data || data;
        const membersArray = Array.isArray(membersList) ? membersList : [];
        setMembers(membersArray);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des membres:", error);
        setMembers([]);
        toast({
          title: "Erreur",
          description: "Impossible de charger les membres de la guilde",
          status: "error",
          duration: 3000
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedGuild, apiUrl, toast, getAuthHeaders]);

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
                  bg: selectedGuild?._id === guild._id ? selectedBg : buttonHoverBg
                }}
                fontWeight="bold"
                px={8}
              >
                {guild.name}
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
