import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Avatar,
  Badge,
  Spinner,
  useColorModeValue,
  Button,
  Flex,
  Divider,
  useToast,
  Image
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";

import { AffinityIcon } from "../components/ui/AffinityIcon";
import { KillerIcon } from "../components/ui/KillerIcon";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import { getStatIcon } from "@/utils/characterIcons";
import { SEOHead } from "../components/SEOHead";
import { useCharacter } from "@/hooks/useAPI";

const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const bucketUrl = import.meta.env.VITE_BUCKET_URL;

  // Utiliser useSWR pour le personnage (cache automatique)
  const { character, isLoading, error: fetchError } = useCharacter(id);
  const [error, setError] = useState<string | null>(null);

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const buttonColor = useColorModeValue("black", "white");
  const textSecondary = useColorModeValue("gray.700", "gray.300");

  useEffect(() => {
    if (fetchError) {
      setError("Erreur lors du chargement du personnage");
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du personnage",
        status: "error",
        duration: 5000
      });
    }
  }, [fetchError, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  if (error || !character) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="center">
          <Text fontSize="xl" color="red.500">
            {error || "Personnage introuvable"}
          </Text>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
            onClick={() => navigate("/personnages")}
          >
            Retour aux personnages
          </Button>
        </VStack>
      </Container>
    );
  }

  // Génération des métadonnées SEO dynamiques
  const generateSEOData = () => {
    const title = `${character.name} - Détails et Statistiques | Schrift BBS`;
    const description = `Découvrez ${character.name} de Bleach Brave Souls : statistiques, affinité ${character.affinity || ""}, type d'attaque ${character.attack_type || ""}, catégories et informations complètes.`;
    const keywords = `${character.name}, Bleach Brave Souls, BBS, personnage, ${character.affinity || ""}, ${character.attack_type || ""}, statistiques${character.categories ? ", " + character.categories.join(", ") : ""}${character.killers ? ", " + character.killers.join(", ") : ""}, ${character.search_name || ""}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: character.name,
      description: description,
      url: `https://bbs-schrift.fr/personnage/${character._id}`,
      image: "https://bbs-schrift.fr/logo.png",
      additionalProperty: [
        ...(character.affinity
          ? [
              {
                "@type": "PropertyValue",
                name: "Affinité",
                value: character.affinity
              }
            ]
          : []),
        ...(character.attack_type
          ? [
              {
                "@type": "PropertyValue",
                name: "Type d'attaque",
                value: character.attack_type
              }
            ]
          : []),
        ...(character.stats
          ? [
              ...(character.stats.atk
                ? [
                    {
                      "@type": "PropertyValue",
                      name: "Attaque",
                      value: character.stats.atk
                    }
                  ]
                : []),
              ...(character.stats.def
                ? [
                    {
                      "@type": "PropertyValue",
                      name: "Défense",
                      value: character.stats.def
                    }
                  ]
                : []),
              ...(character.stats.end
                ? [
                    {
                      "@type": "PropertyValue",
                      name: "Endurance",
                      value: character.stats.end
                    }
                  ]
                : [])
            ]
          : [])
      ],
      isPartOf: {
        "@type": "WebPage",
        name: "Base de données des personnages Bleach Brave Souls",
        url: "https://bbs-schrift.fr/personnages"
      }
    };

    return { title, description, keywords, structuredData };
  };

  const { title, description, keywords, structuredData } = generateSEOData();

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        image={
          character._id
            ? `${bucketUrl}/characters/thumb/${character._id}.png`
            : "https://bbs-schrift.fr/logo.png"
        }
        url={`https://bbs-schrift.fr/personnage/${character._id}`}
        type="article"
        structuredData={structuredData}
      />
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Bouton de retour */}
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            alignSelf="flex-start"
            onClick={() => navigate("/personnages")}
          >
            Retour aux personnages
          </Button>

          {/* Carte principale du personnage */}
          <Box
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow={shadowColor}
            p={8}
          >
            <VStack spacing={8} align="stretch">
              {/* En-tête avec image et informations principales */}
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={8}
                align={{ base: "center", md: "flex-start" }}
              >
                {/* Image du personnage */}
                <VStack flexShrink={0}>
                  {character._id ? (
                    <Avatar
                      size="2xl"
                      src={`${bucketUrl}/characters/thumb/${character._id}.png`}
                      name={character.name}
                      borderWidth="2px"
                      borderColor={borderColor}
                    />
                  ) : (
                    <Box
                      w="128px"
                      h="128px"
                      bg="gray.200"
                      _dark={{ bg: "gray.600" }}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="2xl"
                      color={textSecondary}
                      borderWidth="2px"
                      borderColor={borderColor}
                    >
                      ?
                    </Box>
                  )}
                  <Badge
                    mt={2}
                    colorScheme="purple"
                    fontSize="xs"
                    fontWeight="bold"
                    px={3}
                    py={1}
                    borderRadius="full"
                    textAlign="center"
                    variant="solid"
                    boxShadow="sm"
                  >
                    {character.rarity}
                  </Badge>
                </VStack>

                {/* Informations principales */}
                <VStack
                  spacing={4}
                  align={{ base: "center", md: "flex-start" }}
                  flex={1}
                >
                  <Heading size="xl" textAlign={{ base: "center", md: "left" }}>
                    {character.name}
                  </Heading>

                  {/* Grille des informations principales */}
                  <Box w="100%">
                    <VStack
                      spacing={4}
                      align={{ base: "center", md: "stretch" }}
                    >
                      {/* Affinité */}
                      {character.affinity && (
                        <Flex
                          direction={{ base: "column", md: "row" }}
                          justify={{ base: "center", md: "flex-start" }}
                          align="center"
                          gap={{ base: 2, md: 3 }}
                        >
                          <Text
                            fontWeight="semibold"
                            color="gray.600"
                            fontSize={{ base: "sm", md: "md" }}
                            minW={{ base: "auto", md: "100px" }}
                          >
                            Affinité
                            {/* Ajout des deux points uniquement sur desktop */}
                            <Text
                              as="span"
                              display={{ base: "none", md: "inline" }}
                            >
                              :
                            </Text>
                          </Text>
                          <AffinityIcon
                            affinity={character.affinity}
                            size="24px"
                            showLabel={true}
                          />
                        </Flex>
                      )}

                      {/* Type d'attaque */}
                      {character.attack_type && (
                        <Flex
                          direction={{ base: "column", md: "row" }}
                          justify={{ base: "center", md: "flex-start" }}
                          align="center"
                          gap={{ base: 2, md: 3 }}
                        >
                          <Text
                            fontWeight="semibold"
                            color={textSecondary}
                            fontSize={{ base: "sm", md: "md" }}
                            minW={{ base: "auto", md: "100px" }}
                          >
                            Type
                            <Text
                              as="span"
                              display={{ base: "none", md: "inline" }}
                            >
                              :
                            </Text>
                          </Text>
                          <AttackTypeBadge
                            attackType={character.attack_type}
                            size="24px"
                          />
                        </Flex>
                      )}

                      {/* Nom de recherche */}
                      {character.search_name && (
                        <Flex
                          direction={{ base: "column", md: "row" }}
                          justify={{ base: "center", md: "flex-start" }}
                          align="center"
                          gap={{ base: 2, md: 3 }}
                        >
                          <Text
                            fontWeight="semibold"
                            color={textSecondary}
                            fontSize={{ base: "sm", md: "md" }}
                            minW={{ base: "auto", md: "100px" }}
                          >
                            Recherche
                            <Text
                              as="span"
                              display={{ base: "none", md: "inline" }}
                            >
                              :
                            </Text>
                          </Text>
                          <Text
                            fontFamily="mono"
                            fontSize="sm"
                            color={textSecondary}
                            textAlign={{ base: "center", md: "left" }}
                          >
                            {character.search_name}
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </Flex>

              <Divider />

              {/* Grille des caractéristiques détaillées */}
              <Flex
                direction={{ base: "column", lg: "row" }}
                gap={8}
                align="stretch"
              >
                {/* Colonne gauche */}
                <VStack spacing={6} flex={1} align="stretch">
                  {/* Catégories */}
                  {character.categories && character.categories.length > 0 && (
                    <Box>
                      <Heading size="md" color="purple.500" mb={4}>
                        Catégories ({character.categories.length})
                      </Heading>
                      <VStack spacing={1} align="left">
                        {character.categories.map((category, index) => (
                          <Box key={index}>
                            <HStack spacing={2}>
                              <CategoryIcon
                                category={category}
                                size="20px"
                                showLabel={false}
                              />
                              <Badge colorScheme="purple" variant="subtle">
                                {category}
                              </Badge>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Tueurs */}
                  {character.killers && character.killers.length > 0 && (
                    <Box>
                      <Heading size="md" color="orange.500" mb={4}>
                        Tueurs ({character.killers.length})
                      </Heading>
                      <VStack spacing={1} align="left">
                        {character.killers.map((killer, index) => (
                          <HStack key={index} spacing={2}>
                            <KillerIcon
                              killer={killer}
                              size="24px"
                              showLabel={false}
                            />
                            <Badge colorScheme="orange" variant="subtle">
                              {killer}
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Traits d'âme */}
                  {character.soul_traits &&
                    character.soul_traits.length > 0 && (
                      <Box>
                        <Heading size="md" color="pink.500" mb={4}>
                          Traits d'âme ({character.soul_traits.length})
                        </Heading>
                        <VStack spacing={1} align="left">
                          {character.soul_traits.map(
                            (trait: string, index: number) => (
                              <Badge
                                key={index}
                                colorScheme="pink"
                                variant="subtle"
                                fontSize="sm"
                                px={3}
                                py={1}
                                width="fit-content"
                              >
                                {trait}
                              </Badge>
                            )
                          )}
                        </VStack>
                      </Box>
                    )}
                </VStack>

                {/* Colonne droite */}
                <VStack spacing={6} flex={1} align="stretch">
                  {/* Statistiques */}
                  {character.stats && (
                    <Box>
                      <Heading size="md" color="blue.500" mb={4}>
                        Statistiques
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        {character.stats.end && (
                          <HStack justify="space-between">
                            <HStack>
                              <Image
                                src={getStatIcon("end")!}
                                alt="Endurance"
                                boxSize="20px"
                              />
                              <Text fontWeight="medium">Endurance:</Text>
                            </HStack>
                            <Badge colorScheme="green" variant="solid">
                              {character.stats.end}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.atk && (
                          <HStack justify="space-between">
                            <HStack>
                              <Image
                                src={getStatIcon("atk")!}
                                alt="Attaque"
                                boxSize="20px"
                              />
                              <Text fontWeight="medium">Attaque:</Text>
                            </HStack>
                            <Badge colorScheme="red" variant="solid">
                              {character.stats.atk}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.def && (
                          <HStack justify="space-between">
                            <HStack>
                              <Image
                                src={getStatIcon("def")!}
                                alt="Défense"
                                boxSize="20px"
                              />
                              <Text fontWeight="medium">Défense:</Text>
                            </HStack>
                            <Badge colorScheme="blue" variant="solid">
                              {character.stats.def}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.cct && (
                          <HStack justify="space-between">
                            <HStack>
                              <Image
                                src={getStatIcon("cct")!}
                                alt="Concentration"
                                boxSize="20px"
                              />
                              <Text fontWeight="medium">Concentration:</Text>
                            </HStack>
                            <Badge colorScheme="yellow" variant="solid">
                              {character.stats.cct}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.pre && (
                          <HStack justify="space-between">
                            <HStack>
                              <Image
                                src={getStatIcon("pre")!}
                                alt="Préssion Spirituelle"
                                boxSize="20px"
                              />
                              <Text fontWeight="medium">
                                Préssion Spirituelle:
                              </Text>
                            </HStack>
                            <Badge colorScheme="purple" variant="solid">
                              {character.stats.pre}
                            </Badge>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  )}

                  {/* Immunités */}
                  {character.immunities && character.immunities.length > 0 && (
                    <Box>
                      <Heading size="md" color="teal.500" mb={4}>
                        Immunités
                      </Heading>
                      <Flex wrap="wrap" gap={2}>
                        {character.immunities.map(
                          (immunity: string, index: number) => (
                            <Badge
                              key={index}
                              colorScheme="teal"
                              variant="outline"
                            >
                              {immunity}
                            </Badge>
                          )
                        )}
                      </Flex>
                    </Box>
                  )}

                  {/* Autres informations */}
                  <Box>
                    <Heading size="md" color={textSecondary} mb={4}>
                      Informations
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      {character.created_at && (
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Créé le:</Text>
                          <Text fontSize="sm" color={textSecondary}>
                            {character.release_date}
                          </Text>
                        </HStack>
                      )}
                      {character.resurrection_release && (
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Résurrection:</Text>
                          <Text fontSize="sm" color={textSecondary}>
                            {character.resurrection_release}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </Flex>

              <>
                <Divider />
                <Box>
                  <Heading size="md" color="cyan.500" mb={4}>
                    Ressources visuelles
                  </Heading>

                  {/* Bannière */}
                  {character.banner_id && (
                    <Box mb={6}>
                      <Text fontWeight="medium" mb={3}>
                        Bannière:
                      </Text>
                      <Box
                        borderRadius="lg"
                        overflow="hidden"
                        borderWidth="1px"
                        borderColor={borderColor}
                        maxW="400px"
                      >
                        <Image
                          src={`${bucketUrl}/banners/${character.banner_id}.png`}
                          alt={`Bannière de ${character.name}`}
                          w="100%"
                          h="auto"
                          objectFit="cover"
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Attack URL */}
                  <Box mb={6}>
                    <Text fontWeight="medium" mb={3}>
                      Attaque spéciale:
                    </Text>
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor={borderColor}
                      maxW="300px"
                    >
                      <Image
                        src={`${bucketUrl}/characters/attack/${character._id}.png`}
                        alt={`Attaque de ${character.name}`}
                        w="100%"
                        h="auto"
                        objectFit="cover"
                      />
                    </Box>
                  </Box>
                  {/* Artwork */}
                  <Box mb={6}>
                    <Text fontWeight="medium" mb={3}>
                      Artwork:
                    </Text>
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor={borderColor}
                      maxW="100%"
                    >
                      <Image
                        src={`${bucketUrl}/characters/artwork/${character._id}.png`}
                        alt={`Image de ${character.name}`}
                        w="100%"
                        h="auto"
                        objectFit="cover"
                      />
                    </Box>
                  </Box>
                  <Box mb={6}>
                    <Text fontWeight="medium" mb={3}>
                      Phrase:
                    </Text>
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor={borderColor}
                      maxW="100%"
                    >
                      <Image
                        src={`${bucketUrl}/characters/phrase/${character._id}.png`}
                        alt={`Image de ${character.name}`}
                        w="100%"
                        h="auto"
                        objectFit="cover"
                      />
                    </Box>
                  </Box>
                </Box>
              </>
            </VStack>
          </Box>
          <Flex justify="center" gap={4}>
            <Button
              as={RouterLink}
              to="/personnages"
              colorScheme={buttonColor}
              variant="outline"
              border={"1px"}
              _hover={{
                color: buttonColor === "black" ? "white" : "gray.300",
                bgColor: "gray.700"
              }}
            >
              Voir tous les personnages
            </Button>
          </Flex>
        </VStack>
      </Container>
    </>
  );
};

export default CharacterDetailPage;
