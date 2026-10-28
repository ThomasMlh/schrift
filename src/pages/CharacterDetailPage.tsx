import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Badge,
  Button,
  Grid,
  Icon,
  Flex,
  useToast,
  Image,
  Tooltip,
  ButtonGroup,
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
import { SEOHead } from "../components/SEOHead";
import { useCharacter, useBuilds } from "@/hooks/useAPI";
import { PageLoader } from "@/components/ui/PageLoader";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { bucketUrl } from "@/utils/apiRequest";
import { Pill, SectionCard, TraitRow } from "@/components/character/SectionCard";
import { CharacterStats } from "@/components/character/CharacterStats";
import { CharacterRotations } from "@/components/character/CharacterRotations";
import { FiActivity, FiBarChart2, FiCrosshair, FiShield, FiStar } from "react-icons/fi";
import { CharacterGameTraits } from "@/components/character/CharacterGameTraits";
import { CharacterVisuals } from "@/components/character/CharacterVisuals";
import { CharacterBuilds } from "@/components/character/CharacterBuilds";
import { characterImageUrl, REBIRTH_STAR_URL } from "@/utils/characterImages";

const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const { character, isLoading, error: fetchError } = useCharacter(id);
  const { builds: characterBuilds, isLoading: buildsLoading } = useBuilds({
    character_id: id,
    isValid: true,
    limit: 20
  });


  const [lightbox, setLightbox] = useState<{ src: string; label: string; caption?: string } | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<IBuild | null>(null);
  const [showResurrected, setShowResurrected] = useState(true);

  const openLightbox = useCallback((src: string, label: string, caption?: string) => {
    setLightbox({ src, label, caption });
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

  // Dynamic SEO metadata
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

  const resurrection = character.resurrection ?? null;
  const resurrected = Boolean(resurrection) && showResurrected;
  const shownStats = resurrected ? resurrection!.stats : (character.base_stats ?? character.stats ?? null);
  const shownTraits = resurrected ? resurrection!.traits : (character.traits ?? null);

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
          <Breadcrumbs items={[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.characters"), to: "/personnages" },
            { label: character.name },
          ]} />

          {/* Header: artwork banner, thumbnail, name and badges */}
          <Box bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" overflow="hidden" boxShadow="md">
            {/* Full artwork (contain) over a blurred copy of itself, so nothing is cropped */}
            <Box
              h={{ base: "180px", sm: "240px", md: "320px" }}
              bgGradient="linear(to-r, purple.600, blue.500)"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                inset="-20px"
                backgroundImage={`url(${characterImageUrl(character, "artwork")})`}
                backgroundSize="cover"
                backgroundPosition="center"
                filter="blur(18px) brightness(0.6)"
                aria-hidden
              />
              <Image
                src={characterImageUrl(character, "artwork")}
                alt={`Artwork ${character.name}`}
                position="absolute"
                inset={0}
                w="100%"
                h="100%"
                objectFit="contain"
                fallback={<Box />}
              />
            </Box>
            <Flex
              px={{ base: 4, md: 6 }}
              pb={5}
              gap={4}
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "flex-end" }}
              justify="space-between"
            >
              <Flex gap={4} align="flex-end" minW={0}>
                <Box position="relative" zIndex={1} flexShrink={0} mt={{ base: -10, md: -14 }}>
                  <Image
                    src={characterImageUrl(character, "thumb")}
                    alt={character.name}
                    boxSize={{ base: "88px", md: "112px" }}
                    borderRadius="xl"
                    borderWidth="4px"
                    borderColor="bg.card"
                    bg="bg.inset"
                    objectFit="cover"
                    fallback={<Box boxSize={{ base: "88px", md: "112px" }} borderRadius="xl" bg="bg.inset" />}
                  />
                  {character.resurrection_release && (
                    <Tooltip label={t("components.characterCard.rebirth", { date: character.resurrection_release })} hasArrow>
                      <Image
                        src={REBIRTH_STAR_URL}
                        alt={t("components.characterCard.rebirthAlt")}
                        position="absolute"
                        top="-10px"
                        left="-10px"
                        w="38%"
                        filter="drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6))"
                      />
                    </Tooltip>
                  )}
                </Box>
                <VStack align="start" spacing={2} minW={0} pt={2}>
                  <Heading as="h1" size={{ base: "md", md: "lg" }} letterSpacing="tight" color="text.strong">
                    {character.name}
                  </Heading>
                  <Flex wrap="wrap" gap={2} align="center">
                    {character.rarity && (
                      <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2.5}>{character.rarity}</Badge>
                    )}
                    {character.affinity && <AffinityIcon affinity={character.affinity} size="18px" showLabel />}
                    {character.attack_type && (
                      <HStack spacing={1.5}>
                        <AttackTypeBadge attackType={character.attack_type} size="14px" />
                        <Text fontSize="sm" color="text.secondary">{t(`attackTypes.${character.attack_type}`, character.attack_type)}</Text>
                      </HStack>
                    )}
                    {character.release_date && (
                      <Text fontSize="sm" color="text.muted">· {t("pages.characterDetail.releasedOn", { date: character.release_date })}</Text>
                    )}
                  </Flex>
                </VStack>
              </Flex>
              <Button
                as={RouterLink}
                to={`/comparateur?type=characters&characters=${character._id}`}
                size="sm"
                variant="outline"
                leftIcon={<Icon as={FiBarChart2} />}
                flexShrink={0}
              >
                {t("pages.characterDetail.compare")}
              </Button>
            </Flex>
          </Box>

          {/* Base or resurrected form: stats and game traits follow the choice */}
          {resurrection && (
            <Flex justify="flex-end">
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button onClick={() => setShowResurrected(false)} isActive={!showResurrected}>
                  {t("pages.characterDetail.formBase")}
                </Button>
                <Button
                  onClick={() => setShowResurrected(true)}
                  isActive={showResurrected}
                  leftIcon={<Image src={REBIRTH_STAR_URL} alt="" aria-hidden boxSize="14px" />}
                >
                  {t("pages.characterDetail.formResurrected")}
                </Button>
              </ButtonGroup>
            </Flex>
          )}

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5} alignItems="start">
            {shownStats && (
              <SectionCard title={t("pages.characterDetail.headingStats")} icon={FiActivity}>
                <CharacterStats stats={shownStats} />
              </SectionCard>
            )}

            <SectionCard title={t("pages.characterDetail.headingCombat")} icon={FiShield}>
              <VStack align="stretch" spacing={4}>
                {(character.killers?.length ?? 0) > 0 && (
                  <TraitRow label={t("pages.characterDetail.headingKillers")}>
                    {character.killers!.map((killer) => (
                      <Pill key={killer} icon={<KillerIcon killer={killer} size="18px" showLabel={false} />}>
                        {t(`factions.${killer}`, killer)}
                      </Pill>
                    ))}
                  </TraitRow>
                )}
                {(character.categories?.length ?? 0) > 0 && (
                  <TraitRow label={t("pages.characterDetail.headingCategories")}>
                    {character.categories!.map((category) => (
                      <Pill key={category} icon={<CategoryIcon category={category} size="16px" showLabel={false} />}>
                        {t(`factions.${category}`, category)}
                      </Pill>
                    ))}
                  </TraitRow>
                )}
                {!shownTraits && (character.soul_traits?.length ?? 0) > 0 && (
                  <TraitRow label={t("pages.characterDetail.headingSoulTraits")}>
                    {character.soul_traits!.map((trait) => <Pill key={trait}>{trait}</Pill>)}
                  </TraitRow>
                )}
                {(character.immunities?.length ?? 0) > 0 && (
                  <TraitRow label={t("pages.characterDetail.headingImmunities")}>
                    {character.immunities!.map((immunity) => <Pill key={immunity}>{immunity}</Pill>)}
                  </TraitRow>
                )}
                {character.resurrection_release && (
                  <TraitRow label={t("pages.characterDetail.labelResurrection")}>
                    <HStack spacing={1.5}>
                      <Image src={REBIRTH_STAR_URL} alt="" aria-hidden boxSize="16px" />
                      <Text fontSize="sm" color="text.body">{character.resurrection_release}</Text>
                    </HStack>
                  </TraitRow>
                )}
              </VStack>
            </SectionCard>
          </Grid>

          {shownTraits && (
            <SectionCard title={t("pages.characterDetail.headingGameTraits")} icon={FiStar}>
              <CharacterGameTraits traits={shownTraits} special={character.special} profile={character.profile} />
            </SectionCard>
          )}

          {/* Rotations of the current cycle where its killers are useful */}
          {(character.killers?.length ?? 0) > 0 && (
            <SectionCard title={t("pages.characterDetail.headingRotations")} icon={FiCrosshair}>
              <CharacterRotations character={character} />
            </SectionCard>
          )}

          <CharacterVisuals key={character._id} character={character} onDownload={handleDownload} onOpen={openLightbox} />
          <CharacterBuilds builds={characterBuilds} isLoading={buildsLoading} onSelect={setSelectedBuild} />
        </VStack>
      </Container>

      <ImageLightbox
        src={lightbox?.src ?? null}
        label={lightbox?.label ?? ""}
        caption={lightbox?.caption}
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

