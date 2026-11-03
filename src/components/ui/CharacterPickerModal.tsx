import {
  Box, Center, Flex, Grid, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, Text,
} from "@chakra-ui/react";
import { memo, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlbumFilters } from "@/components/album/AlbumFilters";
import { AlbumThumb } from "@/components/album/AlbumThumb";
import { useCharacterCatalog } from "@/hooks/useAPI";
import { useMyAlbum } from "@/hooks/useMyAlbum";
import { EMPTY_ALBUM_FILTERS, filterAlbumCharacters } from "@/utils/albumFilters";
import type { IAlbumCharacter } from "@/interfaces";

interface CharacterPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  usedIds: string[];
  onPick: (characterId: string) => void;
}

interface PickerTileProps {
  character: IAlbumCharacter;
  spe: number;
  muted: boolean;
  isUsed: boolean;
  onPick: (characterId: string) => void;
}

// Memoized: typing in the search must not re-render every tile of the catalog
const PickerTile = memo(({ character, spe, muted, isUsed, onPick }: PickerTileProps) => {
  const { t } = useTranslation();
  const label = character.version || character.name;

  return (
    <Box
      as="button"
      type="button"
      display="block"
      w="100%"
      title={label}
      disabled={isUsed}
      cursor={isUsed ? "not-allowed" : "pointer"}
      onClick={() => onPick(character._id)}
    >
      <AlbumThumb character={character} spe={spe} muted={muted || isUsed}>
        {isUsed && (
          <Center position="absolute" inset={0} bg="blackAlpha.600">
            <Text fontSize="2xs" fontWeight="bold" color="white">{t("components.buildForm.characterUsed")}</Text>
          </Center>
        )}
      </AlbumThumb>
      <Text mt={1} fontSize="2xs" lineHeight="short" color="text.secondary" noOfLines={2}>{label}</Text>
    </Box>
  );
});

// Mounted with the modal only: the filters start empty each time it opens
const PickerContent = ({ usedIds, onPick }: Pick<CharacterPickerModalProps, "usedIds" | "onPick">) => {
  const { t } = useTranslation();
  const { characters, isLoading } = useCharacterCatalog();
  const { owned, hasAlbum } = useMyAlbum();
  const [filters, setFilters] = useState(EMPTY_ALBUM_FILTERS);
  const deferredFilters = useDeferredValue(filters);
  const used = useMemo(() => new Set(usedIds), [usedIds]);
  const visibleCharacters = useMemo(
    () => filterAlbumCharacters(characters, deferredFilters, (id) => (owned[id] ?? 0) > 0),
    [characters, owned, deferredFilters],
  );

  return (
    <>
      <Box px={6} pb={3} maxH="45vh" overflowY="auto" flexShrink={0}>
        <AlbumFilters
          value={filters}
          onChange={setFilters}
          ownershipLabels={hasAlbum ? {
            all: t("pages.user.albumFilter_all"),
            owned: t("pages.user.albumFilter_owned"),
            missing: t("pages.user.albumFilter_missing"),
          } : undefined}
        />
      </Box>
      <ModalBody pb={6}>
        {isLoading ? (
          <Flex justify="center" py={10}><Spinner /></Flex>
        ) : visibleCharacters.length === 0 ? (
          <Text py={10} textAlign="center" fontSize="sm" color="text.muted">{t("components.buildForm.noCharacter")}</Text>
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(84px, 1fr))" gap={3}>
            {visibleCharacters.map((character) => (
              <PickerTile
                key={character._id}
                character={character}
                spe={owned[character._id] ?? 0}
                muted={hasAlbum && !owned[character._id]}
                isUsed={used.has(character._id)}
                onPick={onPick}
              />
            ))}
          </Grid>
        )}
      </ModalBody>
    </>
  );
};

// Browses the whole catalog with the same filters as the album
export const CharacterPickerModal = ({ isOpen, onClose, title, usedIds, onPick }: CharacterPickerModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <PickerContent usedIds={usedIds} onPick={onPick} />
    </ModalContent>
  </Modal>
);
