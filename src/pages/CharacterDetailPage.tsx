import {
    Container, VStack, HStack, Heading, Text, Box, Avatar, Badge, Spinner,
    useColorModeValue, Button, Flex, Divider, useToast, Image
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import type { Character } from "../interfaces";
import { AffinityIcon } from "../components/ui/AffinityIcon";
import { KillerIcon } from "../components/ui/KillerIcon";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import { getStatIcon } from "@/utils/characterIcons";

const CharacterDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const shadowColor = useColorModeValue('lg', 'dark-lg');

    useEffect(() => {
        if (id) {
            loadCharacter();
        }
    }, [id]);

    const loadCharacter = async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/api/characters/${id}`);

            if (response.ok) {
                const { data } = await response.json();
                setCharacter(data);
            } else if (response.status === 404) {
                setError("Personnage introuvable");
            } else {
                setError("Erreur lors du chargement du personnage");
            }
        } catch (error) {
            setError("Erreur de connexion");
            toast({
                title: "Erreur",
                description: "Impossible de charger les informations du personnage",
                status: "error",
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                        onClick={() => navigate('/personnages')}
                    >
                        Retour aux personnages
                    </Button>
                </VStack>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Bouton de retour */}
                <Button
                    leftIcon={<ArrowBackIcon />}
                    variant="outline"
                    alignSelf="flex-start"
                    onClick={() => navigate('/personnages')}
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
                            <Box flexShrink={0}>
                                {character.link ? (
                                    <Avatar
                                        size="2xl"
                                        src={character.link}
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
                                        color="gray.500"
                                        borderWidth="2px"
                                        borderColor={borderColor}
                                    >
                                        ?
                                    </Box>
                                )}
                            </Box>

                            {/* Informations principales */}
                            <VStack spacing={4} align={{ base: "center", md: "flex-start" }} flex={1}>
                                <Heading size="xl" textAlign={{ base: "center", md: "left" }}>
                                    {character.name}
                                </Heading>

                                {/* Grille des informations principales */}
                                <Box w="100%">
                                    <VStack spacing={3} align="stretch">
                                        {/* Affinité */}
                                        {character.affinity && (
                                            <HStack spacing={3} justify={{ base: "center", md: "flex-start" }}>
                                                <Text fontWeight="semibold" color="gray.600" minW="100px">
                                                    Affinité:
                                                </Text>
                                                <AffinityIcon
                                                    affinity={character.affinity}
                                                    size="24px"
                                                    showLabel={true}
                                                />
                                            </HStack>
                                        )}

                                        {/* Type d'attaque */}
                                        {character.attack_type && (
                                            <HStack spacing={3} justify={{ base: "center", md: "flex-start" }}>
                                                <Text fontWeight="semibold" color="gray.600" minW="100px">
                                                    Type:
                                                </Text>
                                                <AttackTypeBadge
                                                    attackType={character.attack_type}
                                                    size="24px"
                                                />
                                            </HStack>
                                        )}

                                        {/* Nom de recherche */}
                                        {character.search_name && (
                                            <HStack spacing={3} justify={{ base: "center", md: "flex-start" }}>
                                                <Text fontWeight="semibold" color="gray.600" minW="100px">
                                                    Recherche:
                                                </Text>
                                                <Text fontFamily="mono" fontSize="sm" color="gray.500">
                                                    {character.search_name}
                                                </Text>
                                            </HStack>
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
                                        <Flex wrap="wrap" gap={3}>
                                            {character.categories.map((category, index) => (
                                                <HStack key={index} spacing={2}>
                                                    <CategoryIcon
                                                        category={category}
                                                        size="20px"
                                                        showLabel={false}
                                                    />
                                                    <Badge colorScheme="purple" variant="subtle">
                                                        {category}
                                                    </Badge>
                                                </HStack>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* Tueurs */}
                                {character.killers && character.killers.length > 0 && (
                                    <Box>
                                        <Heading size="md" color="orange.500" mb={4}>
                                            Tueurs ({character.killers.length})
                                        </Heading>
                                        <Flex wrap="wrap" gap={3}>
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
                                        </Flex>
                                    </Box>
                                )}

                                {/* Traits d'âme */}
                                {character.soul_traits && character.soul_traits.length > 0 && (
                                    <Box>
                                        <Heading size="md" color="pink.500" mb={4}>
                                            Traits d'âme ({character.soul_traits.length})
                                        </Heading>
                                        <Flex wrap="wrap" gap={3}>
                                            {character.soul_traits.map((trait: string, index: number) => (
                                                <Badge key={index} colorScheme="pink" variant="subtle" fontSize="sm" px={3} py={1}>
                                                    {trait}
                                                </Badge>
                                            ))}
                                        </Flex>
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
                                                        <Image src={getStatIcon("end")!} alt="Endurance" boxSize="20px" />
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
                                                        <Image src={getStatIcon("atk")!} alt="Attaque" boxSize="20px" />
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
                                                        <Image src={getStatIcon("def")!} alt="Défense" boxSize="20px" />
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
                                                        <Image src={getStatIcon("cct")!} alt="Concentration" boxSize="20px" />
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
                                                        <Image src={getStatIcon("pre")!} alt="Préssion Spirituelle" boxSize="20px" />
                                                        <Text fontWeight="medium">Préssion Spirituelle:</Text>
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
                                            {character.immunities.map((immunity: string, index: number) => (
                                                <Badge key={index} colorScheme="teal" variant="outline">
                                                    {immunity}
                                                </Badge>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* Autres informations */}
                                <Box>
                                    <Heading size="md" color="gray.500" mb={4}>
                                        Informations
                                    </Heading>
                                    <VStack spacing={3} align="stretch">
                                        {character.created_at && (
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Créé le:</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {new Date(character.created_at).toLocaleDateString('fr-FR')}
                                                </Text>
                                            </HStack>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        </Flex>

                        {/* Section liens si présents */}
                        {(character.link || character.artwork || character.attack_url || character.banner_url) && (
                            <>
                                <Divider />
                                <Box>
                                    <Heading size="md" color="cyan.500" mb={4}>
                                        Ressources visuelles
                                    </Heading>

                                    {/* Bannière */}
                                    {character.banner_url && (
                                        <Box mb={6}>
                                            <Text fontWeight="medium" mb={3}>Bannière:</Text>
                                            <Box
                                                borderRadius="lg"
                                                overflow="hidden"
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                maxW="400px"
                                            >
                                                <Image
                                                    src={character.banner_url}
                                                    alt={`Bannière de ${character.name}`}
                                                    w="100%"
                                                    h="auto"
                                                    objectFit="cover"
                                                />
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Attack URL */}
                                    {character.attack_url && (
                                        <Box mb={6}>
                                            <Text fontWeight="medium" mb={3}>Attaque spéciale:</Text>
                                            <Box
                                                borderRadius="lg"
                                                overflow="hidden"
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                maxW="300px"
                                            >
                                                <Image
                                                    src={character.attack_url}
                                                    alt={`Attaque de ${character.name}`}
                                                    w="100%"
                                                    h="auto"
                                                    objectFit="cover"
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                    {/* Artwork */}
                                    {character.artwork && (
                                        <Box mb={6}>
                                            <Text fontWeight="medium" mb={3}>Artwork:</Text>
                                            <Box
                                                borderRadius="lg"
                                                overflow="hidden"
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                maxW="100%"
                                            >
                                                <Image
                                                    src={character.artwork}
                                                    alt={`Image de ${character.name}`}
                                                    w="100%"
                                                    h="auto"
                                                    objectFit="cover"
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                    {character.phrase_url && (
                                        <Box mb={6}>
                                            <Text fontWeight="medium" mb={3}>Phrase:</Text>
                                            <Box
                                                borderRadius="lg"
                                                overflow="hidden"
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                maxW="100%"
                                            >
                                                <Image
                                                    src={character.phrase_url}
                                                    alt={`Image de ${character.name}`}
                                                    w="100%"
                                                    h="auto"
                                                    objectFit="cover"
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        )}
                    </VStack>
                </Box>

                {/* Actions */}
                <Flex justify="center" gap={4}>
                    <Button
                        as={RouterLink}
                        to="/personnages"
                        colorScheme="blue"
                        variant="outline"
                    >
                        Voir tous les personnages
                    </Button>
                </Flex>
            </VStack>
        </Container>
    );
};

export default CharacterDetailPage;