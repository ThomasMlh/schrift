import {
  Box, Button, ButtonGroup, Flex, Grid, HStack, Input, InputGroup, InputLeftElement, Popover,
  PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Progress, SimpleGrid, Skeleton, Text, VStack,
  useToast,
} from "@chakra-ui/react";
import { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAlbum, useCharacterCatalog } from "@/hooks/useAPI";
import { useAlbumMutations } from "@/hooks/useAPIMutations";
import { AffinityFilter } from "@/components/ui/AffinityFilter";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { KillerFilter } from "@/components/ui/KillerFilter";
import { AttackTypeFilter } from "@/components/ui/AttackTypeFilter";
import { CharactersAffinities, CharactersCategories, CharactersKillers } from "@/utils/chractersData";
import { bucketUrl } from "@/utils/apiRequest";
import type { IAlbumCharacter } from "@/interfaces";

const MAX_SPE = 5;
const SPE_LEVELS = Array.from({ length: MAX_SPE }, (_, i) => i + 1);

type OwnershipFilter = "all" | "owned" | "missing";

// Même logique que le filtre serveur de la page Personnages : sous-chaîne insensible à la casse,
// pour que "Capitaine" retrouve aussi "Capitaine +"
const matchesAny = (values: string[] | undefined, selected: string) =>
  !selected || (values ?? []).some((v) => v.toLowerCase().includes(selected.toLowerCase()));

interface UserAlbumProps {
  // Compte bbs affiché sur la page (un alt si l'URL pointe vers lui)
  bbsId?: string;
  // Propriétaire du compte ou admin : peut cocher les persos et régler leur spé
  canEdit: boolean;
}

// Pastilles de spé (1 à 5) en bas de la vignette
const SpePips = ({ spe }: { spe: number }) => (
  <HStack spacing="3px" justify="center">
    {SPE_LEVELS.map((level) => (
      <Box
        key={level}
        w="7px"
        h="7px"
        borderRadius="full"
        bg={level <= spe ? "yellow.300" : "whiteAlpha.400"}
        boxShadow={level <= spe ? "0 0 4px rgba(250, 204, 21, 0.8)" : undefined}
      />
    ))}
  </HStack>
);

// Vignette d'un perso : en couleur s'il est possédé, grisée sinon.
// <img> natif (pas le Image de Chakra avec fallback, qui précharge chaque vignette en JS).
const AlbumThumb = ({ character, spe }: { character: IAlbumCharacter; spe: number }) => (
  <Box
    position="relative"
    aspectRatio={1}
    borderRadius="lg"
    overflow="hidden"
    bg="bg.inset"
    borderWidth="2px"
    borderColor={spe === MAX_SPE ? "yellow.400" : spe > 0 ? "purple.400" : "border.subtle"}
    transition="transform 0.15s"
    _hover={{ transform: "translateY(-2px)" }}
  >
    <Box
      as="img"
      src={`${bucketUrl}/characters/thumb/${character._id}.png`}
      alt={character.name}
      w="100%"
      h="100%"
      objectFit="cover"
      loading="lazy"
      decoding="async"
      filter={spe > 0 ? undefined : "grayscale(1)"}
      opacity={spe > 0 ? 1 : 0.35}
    />
    {spe > 0 && (
      <Box position="absolute" bottom={0} left={0} right={0} py={1} bgGradient="linear(to-t, blackAlpha.800, transparent)">
        <SpePips spe={spe} />
      </Box>
    )}
  </Box>
);

interface AlbumTileProps {
  character: IAlbumCharacter;
  spe: number;
  canEdit: boolean;
  // Une seule vignette porte un Popover à la fois : celle qu'on vient de cliquer
  isActive: boolean;
  onOpen: (characterId: string) => void;
  onClose: () => void;
  onChange: (characterId: string, spe: number) => void;
}

// Mémoïsée : changer la spé d'un perso ne re-rend que sa vignette, pas les 300 autres
const AlbumTile = memo(({ character, spe, canEdit, isActive, onOpen, onClose, onChange }: AlbumTileProps) => {
  const { t } = useTranslation();
  const label = character.version || character.name;

  if (!canEdit) {
    return (
      <Box as={Link} to={`/personnage/${character._id}`} display="block" title={label}>
        <AlbumThumb character={character} spe={spe} />
      </Box>
    );
  }

  const trigger = (
    <Box as="button" type="button" display="block" w="100%" aria-label={label} title={label} onClick={() => onOpen(character._id)}>
      <AlbumThumb character={character} spe={spe} />
    </Box>
  );

  if (!isActive) return trigger;

  const pick = (level: number) => {
    onClose();
    if (level !== spe) onChange(character._id, level);
  };

  return (
    <Popover isOpen onClose={onClose} placement="top" isLazy>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent w="auto" maxW="280px">
        <PopoverArrow />
        <PopoverBody>
          <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={2} noOfLines={2}>{label}</Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              colorScheme={spe === 0 ? "red" : "gray"}
              variant={spe === 0 ? "solid" : "outline"}
              onClick={() => pick(0)}
            >
              {t("pages.user.albumNotOwned")}
            </Button>
            {SPE_LEVELS.map((level) => (
              <Button
                key={level}
                colorScheme={spe === level ? "purple" : "gray"}
                variant={spe === level ? "solid" : "outline"}
                onClick={() => pick(level)}
              >
                {level}
              </Button>
            ))}
          </ButtonGroup>
          <Text fontSize="xs" color="text.muted" mt={2}>{t("pages.user.albumSpeHelp")}</Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

// Onglet "Album" de la page joueur : persos possédés par le compte et leur spé
export const UserAlbum = ({ bbsId, canEdit }: UserAlbumProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { characters, isLoading: catalogLoading } = useCharacterCatalog();
  const { album, isLoading: albumLoading, mutate } = useAlbum(bbsId);
  const { setCharacterSpe } = useAlbumMutations();
  const [search, setSearch] = useState("");
  const [affinity, setAffinity] = useState("");
  const [category, setCategory] = useState("");
  const [killer, setKiller] = useState("");
  const [attackType, setAttackType] = useState("");
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  // La recherche filtre la grille en différé pour que la saisie reste fluide
  const deferredSearch = useDeferredValue(search);

  const owned = useMemo(() => album?.characters ?? {}, [album]);

  const { ownedCount, maxedCount } = useMemo(() => {
    const speOf = characters.map((c) => owned[c._id] ?? 0);
    return {
      ownedCount: speOf.filter((spe) => spe > 0).length,
      maxedCount: speOf.filter((spe) => spe === MAX_SPE).length,
    };
  }, [characters, owned]);

  const visibleCharacters = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return characters.filter((c) => {
      const spe = owned[c._id] ?? 0;
      if (ownership === "owned" && spe === 0) return false;
      if (ownership === "missing" && spe > 0) return false;
      if (affinity && c.affinity !== affinity) return false;
      if (attackType && c.attack_type !== attackType) return false;
      if (!matchesAny(c.categories, category) || !matchesAny(c.killers, killer)) return false;
      if (!term) return true;
      return [c.name, c.search_name, c.version].some((s) => s?.toLowerCase().includes(term));
    });
  }, [characters, owned, deferredSearch, affinity, category, killer, attackType, ownership]);

  // Dernières valeurs lues par handleChange sans qu'il change d'identité (sinon memo inutile)
  const latest = useRef({ setCharacterSpe, toast, t });
  latest.current = { setCharacterSpe, toast, t };

  const closeTile = useCallback(() => setActiveId(null), []);

  // Mise à jour optimiste : la vignette change tout de suite. La réponse serveur n'est pas
  // réappliquée (évite un second rendu) ; on resynchronise seulement en cas d'erreur.
  const handleChange = useCallback(async (characterId: string, spe: number) => {
    if (!bbsId) return;
    mutate((current) => {
      if (!current) return current;
      const next = { ...current.data.characters };
      if (spe === 0) delete next[characterId];
      else next[characterId] = spe;
      return { ...current, data: { ...current.data, characters: next } };
    }, { revalidate: false });

    try {
      await latest.current.setCharacterSpe(bbsId, characterId, spe);
    } catch (err) {
      mutate();
      const { toast: showToast, t: translate } = latest.current;
      showToast({ status: "error", title: translate("pages.user.albumSaveError"), description: (err as Error).message, duration: 4000 });
    }
  }, [bbsId, mutate]);

  if (catalogLoading || albumLoading) return <Skeleton h="320px" borderRadius="xl" />;

  const hasFilters = Boolean(search || affinity || category || killer || attackType || ownership !== "all");
  const resetFilters = () => {
    setSearch("");
    setAffinity("");
    setCategory("");
    setKiller("");
    setAttackType("");
    setOwnership("all");
  };

  const total = characters.length;
  const percent = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

  return (
    <VStack spacing={5} align="stretch">
      <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={5}>
        <Flex justify="space-between" align="baseline" wrap="wrap" gap={2} mb={2}>
          <Box>
            <Text fontSize="md" fontWeight="bold" color="text.strong">{t("pages.user.albumTitle")}</Text>
            <Text fontSize="sm" color="text.muted">
              {canEdit ? t("pages.user.albumSubtitleEdit") : t("pages.user.albumSubtitle")}
            </Text>
          </Box>
          <HStack spacing={4}>
            <Text fontSize="sm" color="text.muted">
              <Text as="span" fontSize="xl" fontWeight="bold" color="text.strong">{ownedCount}</Text> / {total} ({percent} %)
            </Text>
            <Text fontSize="sm" color="text.muted">
              {t("pages.user.albumMaxed", { count: maxedCount })}
            </Text>
          </HStack>
        </Flex>
        <Progress value={percent} size="sm" colorScheme="purple" borderRadius="full" />
      </Box>

      <Box>
        <Flex gap={3} wrap="wrap">
          <InputGroup flex="1 1 220px">
            <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pages.user.albumSearchPlaceholder")}
            />
          </InputGroup>
          <ButtonGroup size="md" isAttached variant="outline">
            {(["all", "owned", "missing"] as const).map((key) => (
              <Button
                key={key}
                colorScheme={ownership === key ? "purple" : "gray"}
                variant={ownership === key ? "solid" : "outline"}
                onClick={() => setOwnership(key)}
              >
                {t(`pages.user.albumFilter_${key}`)}
              </Button>
            ))}
          </ButtonGroup>
          {hasFilters && (
            <Button variant="ghost" onClick={resetFilters}>{t("common.reset")}</Button>
          )}
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={3}>
          <AffinityFilter selectedAffinity={affinity} affinities={CharactersAffinities} onAffinityChange={setAffinity} />
          <CategoryFilter selectedCategory={category} categories={CharactersCategories} onCategoryChange={setCategory} />
          <KillerFilter selectedKiller={killer} killers={CharactersKillers} onKillerChange={setKiller} />
          <AttackTypeFilter selectedAttackType={attackType} onAttackTypeChange={setAttackType} />
        </SimpleGrid>
      </Box>

      {visibleCharacters.length === 0 ? (
        <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>{t("pages.user.albumEmpty")}</Text>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(76px, 1fr))" gap={3}>
          {visibleCharacters.map((character) => (
            <AlbumTile
              key={character._id}
              character={character}
              spe={owned[character._id] ?? 0}
              canEdit={canEdit}
              isActive={activeId === character._id}
              onOpen={setActiveId}
              onClose={closeTile}
              onChange={handleChange}
            />
          ))}
        </Grid>
      )}
    </VStack>
  );
};
