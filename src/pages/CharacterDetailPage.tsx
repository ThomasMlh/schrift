import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Avatar,
  Badge,
  useColorMode,
  Button,
  Flex,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { BuildDetailModal } from "@/components/ui/BuildDetailModal";
import type { IBuild } from "@/interfaces";

import { AffinityIcon } from "../components/ui/AffinityIcon";
import { KillerIcon } from "../components/ui/KillerIcon";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import { getStatIcon } from "@/utils/characterIcons";
import { SEOHead } from "../components/SEOHead";
import { useCharacter, useBuilds } from "@/hooks/useAPI";
import { PageLoader } from "@/components/ui/PageLoader";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { bucketUrl } from "@/utils/apiRequest";
import { SectionCard } from "@/components/character/SectionCard";
import { CharacterVisuals } from "@/components/character/CharacterVisuals";
import { CharacterBuilds } from "@/components/character/CharacterBuilds";

const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  // Utiliser useSWR pour le personnage (cache automatique)
  const { character, isLoading, error: fetchError } = useCharacter(id);
  const { builds: characterBuilds, isLoading: buildsLoading } = useBuilds({
    character_id: id,
    isValid: true,
    limit: 20
  });

  // Hooks UI
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<IBuild | null>(null);

  const openLightbox = useCallback((src: string, label: string) => {
    setLightbox({ src, label });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const handleDownload = useCallback(async (src: string, filename: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  }, []);

  useEffect(() => {
    if (fetchError) {
      toast({
        title: t("pages.characterDetail.errorTitle"),
        description: t("pages.characterDetail.errorDesc"),
        status: "error",
        duration: 5000
      });
    }
  }, [fetchError, toast, t]);

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <PageLoader color="purple.500" height="200px" />
      </Container>
    );
  }

  if (fetchError || !character) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="center">
          <Text fontSize="xl" color="red.500">
            {fetchError ? t("pages.characterDetail.errorLoading") : t("pages.characterDetail.notFound")}
          </Text>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="purple"
            variant="outline"
            borderRadius="full"
            onClick={() => navigate("/personnages")}
          >
            {t("pages.characterDetail.backToCharacters")}
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
          {/* Back button */}
          <Breadcrumbs items={[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.characters"), to: "/personnages" },
            { label: character.name },
          ]} />
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            colorScheme="purple"
            alignSelf="flex-start"
            borderRadius="full"
            onClick={() => navigate("/personnages")}
          >
            {t("pages.characterDetail.backToCharacters")}
          </Button>

          {/* Main card */}
          <Box
            bg={isDark ? 'gray.800' : 'white'}
            borderRadius="2xl"
            border="1px solid"
            borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
            overflow="hidden"
            boxShadow={isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)'}
          >
            {/* Hero */}
            <Box
              position="relative"
              overflow="hidden"
              py={10}
              px={8}
              bg={isDark ? 'rgba(124,58,237,0.10)' : 'purple.50'}
              borderBottom="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
            >
              {/* Blurred artwork background */}
              {character._id && (
                <Box
                  position="absolute"
                  top={0} left={0} right={0} bottom={0}
                  backgroundImage={`url(${bucketUrl}/characters/artwork/${character._id}.png)`}
                  backgroundSize="cover"
                  backgroundPosition="center top"
                  opacity={isDark ? 0.06 : 0.08}
                  sx={{ filter: 'blur(24px)' }}
                />
              )}
              <VStack spacing={4} position="relative">
                {/* Avatar with gradient ring */}
                <Box
                  p="3px"
                  borderRadius="full"
                  bg="linear-gradient(135deg, #7C3AED, #4F46E5)"
                  boxShadow="0 0 30px rgba(124,58,237,0.35)"
                >
                  {character._id ? (
                    <Avatar
                      size="2xl"
                      src={`${bucketUrl}/characters/thumb/${character._id}.png`}
                      name={character.name}
                      border="3px solid"
                      borderColor={isDark ? 'gray.800' : 'white'}
                    />
                  ) : (
                    <Box
                      w="96px" h="96px"
                      bg={isDark ? 'gray.700' : 'gray.200'}
                      borderRadius="full"
                      display="flex" alignItems="center" justifyContent="center"
                      fontSize="2xl"
                      border="3px solid"
                      borderColor={isDark ? 'gray.800' : 'white'}
                    >
                      ?
                    </Box>
                  )}
                </Box>

                {/* Name */}
                <Heading
                  size="xl"
                  textAlign="center"
                  bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
                  bgClip="text"
                >
                  {character.name}
                </Heading>

                {/* Badges row */}
                <Flex flexWrap="wrap" gap={2} justify="center" align="center">
                  {character.rarity && (
                    <Badge
                      px={3} py={1} borderRadius="full"
                      bg="linear-gradient(135deg, #7C3AED, #4F46E5)"
                      color="white" fontWeight="bold" fontSize="xs"
                    >
                      {character.rarity}
                    </Badge>
                  )}
                  {character.affinity && (
                    <AffinityIcon affinity={character.affinity} size="20px" showLabel={true} />
                  )}
                  {character.attack_type && (
                    <AttackTypeBadge attackType={character.attack_type} size="20px" />
                  )}
                  {character.search_name && (
                    <Badge px={3} py={1} borderRadius="full" variant="outline"
                      colorScheme="gray" fontFamily="mono" fontSize="xs">
                      {character.search_name}
                    </Badge>
                  )}
                </Flex>
              </VStack>
            </Box>

            {/* Body */}
            <Box p={6}>
              <Flex direction={{ base: "column", lg: "row" }} gap={5} align="stretch">
                {/* Left column */}
                <VStack spacing={4} flex={1} align="stretch">
                  {character.categories && character.categories.length > 0 && (
                    <SectionCard
                      label={`${t("pages.characterDetail.headingCategories")} (${character.categories.length})`}
                      accentColor="purple.400"
                      isDark={isDark}
                    >
                      <Flex wrap="wrap" gap={2}>
                        {character.categories.map((category, index) => (
                          <HStack
                            key={index} spacing={1}
                            bg={isDark ? 'whiteAlpha.50' : 'purple.50'}
                            px={3} py={1} borderRadius="full"
                          >
                            <CategoryIcon category={category} size="16px" showLabel={false} />
                            <Text fontSize="sm" color={isDark ? 'purple.300' : 'purple.700'}>
                              {t(`factions.${category}`, category)}
                            </Text>
                          </HStack>
                        ))}
                      </Flex>
                    </SectionCard>
                  )}

                  {character.killers && character.killers.length > 0 && (
                    <SectionCard
                      label={`${t("pages.characterDetail.headingKillers")} (${character.killers.length})`}
                      accentColor="orange.400"
                      isDark={isDark}
                    >
                      <Flex wrap="wrap" gap={2}>
                        {character.killers.map((killer, index) => (
                          <HStack
                            key={index} spacing={1}
                            bg={isDark ? 'whiteAlpha.50' : 'orange.50'}
                            px={3} py={1} borderRadius="full"
                          >
                            <KillerIcon killer={killer} size="20px" showLabel={false} />
                            <Text fontSize="sm" color={isDark ? 'orange.300' : 'orange.700'}>
                              {t(`factions.${killer}`, killer)}
                            </Text>
                          </HStack>
                        ))}
                      </Flex>
                    </SectionCard>
                  )}

                  {character.soul_traits && character.soul_traits.length > 0 && (
                    <SectionCard
                      label={`${t("pages.characterDetail.headingSoulTraits")} (${character.soul_traits.length})`}
                      accentColor="pink.400"
                      isDark={isDark}
                    >
                      <Flex wrap="wrap" gap={2}>
                        {character.soul_traits.map((trait: string, index: number) => (
                          <Badge key={index} colorScheme="pink" variant="subtle"
                            borderRadius="full" px={3} py={1} fontSize="sm">
                            {trait}
                          </Badge>
                        ))}
                      </Flex>
                    </SectionCard>
                  )}
                </VStack>

                {/* Right column */}
                <VStack spacing={4} flex={1} align="stretch">
                  {character.stats && (
                    <SectionCard
                      label={t("pages.characterDetail.headingStats")}
                      accentColor="blue.400"
                      isDark={isDark}
                    >
                      <VStack spacing={3} align="stretch">
                        {character.stats.end && (
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Image src={getStatIcon("end")!} alt={t("stats.end")} boxSize="20px" />
                              <Text fontSize="md" fontWeight="medium">{t("stats.end")}</Text>
                            </HStack>
                            <Badge colorScheme="green" variant="solid" borderRadius="full" px={3}>
                              {character.stats.end}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.atk && (
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Image src={getStatIcon("atk")!} alt={t("stats.atk")} boxSize="20px" />
                              <Text fontSize="md" fontWeight="medium">{t("stats.atk")}</Text>
                            </HStack>
                            <Badge colorScheme="red" variant="solid" borderRadius="full" px={3}>
                              {character.stats.atk}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.def && (
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Image src={getStatIcon("def")!} alt={t("stats.def")} boxSize="20px" />
                              <Text fontSize="md" fontWeight="medium">{t("stats.def")}</Text>
                            </HStack>
                            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3}>
                              {character.stats.def}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.cct && (
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Image src={getStatIcon("cct")!} alt={t("stats.cct")} boxSize="20px" />
                              <Text fontSize="md" fontWeight="medium">{t("stats.cct")}</Text>
                            </HStack>
                            <Badge colorScheme="yellow" variant="solid" borderRadius="full" px={3}>
                              {character.stats.cct}
                            </Badge>
                          </HStack>
                        )}
                        {character.stats.pre && (
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Image src={getStatIcon("pre")!} alt={t("stats.pre")} boxSize="20px" />
                              <Text fontSize="md" fontWeight="medium">{t("stats.pre")}</Text>
                            </HStack>
                            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3}>
                              {character.stats.pre}
                            </Badge>
                          </HStack>
                        )}
                      </VStack>
                    </SectionCard>
                  )}

                  {character.immunities && character.immunities.length > 0 && (
                    <SectionCard
                      label={t("pages.characterDetail.headingImmunities")}
                      accentColor="teal.400"
                      isDark={isDark}
                    >
                      <Flex wrap="wrap" gap={2}>
                        {character.immunities.map((immunity: string, index: number) => (
                          <Badge key={index} colorScheme="teal" variant="subtle"
                            borderRadius="full" px={3} py={1} fontSize="sm">
                            {immunity}
                          </Badge>
                        ))}
                      </Flex>
                    </SectionCard>
                  )}

                  <SectionCard
                    label={t("pages.characterDetail.headingInfo")}
                    accentColor="gray.400"
                    isDark={isDark}
                  >
                    <VStack spacing={2} align="stretch">
                      {character.created_at && (
                        <HStack justify="space-between">
                          <Text fontSize="md" color={isDark ? 'gray.400' : 'gray.500'}>
                            {t("pages.characterDetail.labelCreatedAt")}
                          </Text>
                          <Text fontSize="md" fontWeight="medium">{character.release_date}</Text>
                        </HStack>
                      )}
                      {character.resurrection_release && (
                        <HStack justify="space-between">
                          <Text fontSize="md" color={isDark ? 'gray.400' : 'gray.500'}>
                            {t("pages.characterDetail.labelResurrection")}
                          </Text>
                          <Text fontSize="md" fontWeight="medium">{character.resurrection_release}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </SectionCard>
                </VStack>
              </Flex>
            </Box>
          </Box>

          <CharacterVisuals character={character} onDownload={handleDownload} onOpen={openLightbox} />

          <CharacterBuilds builds={characterBuilds} isLoading={buildsLoading} onSelect={setSelectedBuild} />

          {/* Bottom navigation */}
          <Flex justify="center">
            <Button
              as={RouterLink}
              to="/personnages"
              colorScheme="purple"
              variant="outline"
              borderRadius="full"
            >
              {t("pages.characterDetail.viewAllCharacters")}
            </Button>
          </Flex>
        </VStack>
      </Container>

      <ImageLightbox
        src={lightbox?.src ?? null}
        label={lightbox?.label ?? ""}
        characterName={character?.name ?? ""}
        onClose={closeLightbox}
        onDownload={handleDownload}
      />

      <BuildDetailModal
        isOpen={!!selectedBuild}
        onClose={() => setSelectedBuild(null)}
        build={selectedBuild}
      />
    </>
  );
};

export default CharacterDetailPage;

