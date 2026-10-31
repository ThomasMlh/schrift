import {
  Box, Button, ButtonGroup, Flex, Grid, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent,
  PopoverTrigger, Progress, Skeleton, Text, VStack, useToast,
} from "@chakra-ui/react";
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
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
  // Account owner, admin, or a leader of its guild when admins allow it
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
  const { saveAlbum } = useAlbumMutations();
  const [filters, setFilters] = useState(EMPTY_ALBUM_FILTERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  // The album is locked until "Edit" is clicked; changes stay local until they are saved in one request
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  // Deferred so typing in the search stays responsive
  const deferredFilters = useDeferredValue(filters);

  const saved = useMemo(() => album?.characters ?? {}, [album]);
  const owned = useMemo(() => {
    const next = { ...saved, ...draft };
    for (const [id, spe] of Object.entries(draft)) if (spe === 0) delete next[id];
    return next;
  }, [saved, draft]);
  const pendingCount = Object.keys(draft).length;

  // Unsaved changes are lost when the page is left: ask first
  useEffect(() => {
    if (pendingCount === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pendingCount]);

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

  const closeTile = useCallback(() => setActiveId(null), []);

  // A change back to the saved value is not a change anymore
  const handleChange = useCallback((characterId: string, spe: number) => {
    setDraft((current) => {
      const next = { ...current };
      if ((saved[characterId] ?? 0) === spe) delete next[characterId];
      else next[characterId] = spe;
      return next;
    });
  }, [saved]);

  const startEditing = () => {
    setIsEditing(true);
    toast({ status: "info", title: t("pages.user.albumSaveReminder"), duration: 4000, isClosable: true });
  };

  const stopEditing = () => {
    setDraft({});
    setActiveId(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!bbsId) return;
    if (pendingCount === 0) {
      stopEditing();
      return;
    }
    setIsSaving(true);
    try {
      const { data } = await saveAlbum(bbsId, draft);
      await mutate((current) => (current ? { ...current, data } : current), { revalidate: false });
      stopEditing();
      toast({ status: "success", title: t("pages.user.albumSaved", { count: pendingCount }), duration: 3000 });
    } catch (err) {
      toast({ status: "error", title: t("pages.user.albumSaveError"), description: (err as Error).message, duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

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
              {isEditing ? t("pages.user.albumSubtitleEdit") : canEdit ? t("pages.user.albumSubtitleLocked") : t("pages.user.albumSubtitle")}
            </Text>
          </Box>
          <HStack spacing={4}>
            <Text fontSize="sm" color="text.muted">
              <Text as="span" fontSize="xl" fontWeight="bold" color="text.strong">{ownedCount}</Text> / {total} ({percent} %)
            </Text>
            <Text fontSize="sm" color="text.muted">
              {t("pages.user.albumMaxed", { count: maxedCount })}
            </Text>
            {canEdit && !isEditing && (
              <Button size="sm" colorScheme="purple" leftIcon={<FiEdit2 />} onClick={startEditing}>
                {t("pages.user.albumEdit")}
              </Button>
            )}
          </HStack>
        </Flex>
        <Progress value={percent} size="sm" colorScheme="purple" borderRadius="full" />
      </Box>

      {isEditing && (
        <Flex
          position="sticky"
          top="80px"
          zIndex="sticky"
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={3}
          bg="bg.card"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.400"
          boxShadow="lg"
          px={5}
          py={3}
        >
          <Text fontSize="sm" color="text.muted">
            {pendingCount > 0 ? t("pages.user.albumPending", { count: pendingCount }) : t("pages.user.albumNoChanges")}
          </Text>
          <HStack spacing={2}>
            <Button size="sm" variant="ghost" onClick={stopEditing} isDisabled={isSaving}>{t("common.cancel")}</Button>
            <Button size="sm" colorScheme="purple" onClick={handleSave} isLoading={isSaving}>
              {t("pages.user.albumSave")}
            </Button>
          </HStack>
        </Flex>
      )}

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
              canEdit={canEdit && isEditing}
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
