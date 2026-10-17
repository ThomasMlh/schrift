import {
  Box, Button, ButtonGroup, Flex, Grid, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent,
  PopoverTrigger, Progress, Skeleton, Text, VStack, useToast,
} from "@chakra-ui/react";
import { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAlbum, useCharacterCatalog } from "@/hooks/useAPI";
import { useAlbumMutations } from "@/hooks/useAPIMutations";
import { AlbumThumb } from "@/components/album/AlbumThumb";
import { AlbumFilters } from "@/components/album/AlbumFilters";
import { EMPTY_ALBUM_FILTERS, MAX_SPE, SPE_LEVELS, filterAlbumCharacters } from "@/utils/albumFilters";
import type { IAlbumCharacter } from "@/interfaces";

interface UserAlbumProps {
  // bbs account shown on the page (an alt when the URL targets it)
  bbsId?: string;
  // Account owner or admin
  canEdit: boolean;
}

interface AlbumTileProps {
  character: IAlbumCharacter;
  spe: number;
  canEdit: boolean;
  // Only one tile holds a Popover at a time: the one just clicked
  isActive: boolean;
  onOpen: (characterId: string) => void;
  onClose: () => void;
  onChange: (characterId: string, spe: number) => void;
}

// Memoized: changing a character's spec only re-renders its own tile, not the 300 others
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

// Player page "Album" tab: characters owned by the account and their spec
export const UserAlbum = ({ bbsId, canEdit }: UserAlbumProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { characters, isLoading: catalogLoading } = useCharacterCatalog();
  const { album, isLoading: albumLoading, mutate } = useAlbum(bbsId);
  const { setCharacterSpe } = useAlbumMutations();
  const [filters, setFilters] = useState(EMPTY_ALBUM_FILTERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Deferred so typing in the search stays responsive
  const deferredFilters = useDeferredValue(filters);

  const owned = useMemo(() => album?.characters ?? {}, [album]);

  const { ownedCount, maxedCount } = useMemo(() => {
    const speOf = characters.map((c) => owned[c._id] ?? 0);
    return {
      ownedCount: speOf.filter((spe) => spe > 0).length,
      maxedCount: speOf.filter((spe) => spe === MAX_SPE).length,
    };
  }, [characters, owned]);

  const visibleCharacters = useMemo(
    () => filterAlbumCharacters(characters, deferredFilters, (id) => (owned[id] ?? 0) > 0),
    [characters, owned, deferredFilters],
  );

  // Latest values read by handleChange without changing its identity (otherwise memo is useless)
  const latest = useRef({ setCharacterSpe, toast, t });
  latest.current = { setCharacterSpe, toast, t };

  const closeTile = useCallback(() => setActiveId(null), []);

  // Optimistic update: the tile changes immediately. The server response is not re-applied (avoids
  // a second render); data is only resynced on error.
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

      <AlbumFilters
        value={filters}
        onChange={setFilters}
        ownershipLabels={{
          all: t("pages.user.albumFilter_all"),
          owned: t("pages.user.albumFilter_owned"),
          missing: t("pages.user.albumFilter_missing"),
        }}
      />

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
