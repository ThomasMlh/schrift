import {
  Box, Flex, Grid, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, Text,
} from "@chakra-ui/react";
import { memo, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlbumFilters } from "@/components/album/AlbumFilters";
import { useCharacterCatalog } from "@/hooks/useAPI";
import { useMyAlbum } from "@/hooks/useMyAlbum";
import { EMPTY_ALBUM_FILTERS, MAX_SPE, filterAlbumCharacters } from "@/utils/albumFilters";
import { bucketUrl } from "@/utils/apiRequest";
import { getAffinityIcon } from "@/utils/characterIcons";
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
  usedLabel: string;
  onPick: (characterId: string) => void;
}

// The grid holds the whole catalog: tiles are plain elements styled once by TILE_STYLES, since a
// Chakra component per element makes opening the modal and filtering visibly slow
const PickerTile = memo(({ character, spe, muted, isUsed, usedLabel, onPick }: PickerTileProps) => {
  const label = character.version || character.name;
  const affinityIcon = character.affinity ? getAffinityIcon(character.affinity) : null;

  return (
    <button type="button" className="picker-tile" title={label} disabled={isUsed} onClick={() => onPick(character._id)}>
      <span className="picker-thumb" data-spe={spe === MAX_SPE ? "max" : spe > 0 ? "owned" : undefined} data-muted={muted || isUsed || undefined}>
        <img src={`${bucketUrl}/characters/thumb/${character._id}.png`} alt={character.name} loading="lazy" decoding="async" />
        {affinityIcon && <img className="picker-affinity" src={affinityIcon} alt="" loading="lazy" decoding="async" />}
        {isUsed && <span className="picker-used">{usedLabel}</span>}
      </span>
      <span className="picker-name">{label}</span>
    </button>
  );
});

const TILE_STYLES = {
  ".picker-tile": {
    display: "block",
    width: "100%",
    textAlign: "left",
    // Tiles out of view are neither laid out nor painted
    contentVisibility: "auto",
    containIntrinsicSize: "auto 125px",
  },
  ".picker-tile:disabled": { cursor: "not-allowed" },
  ".picker-thumb": {
    display: "block",
    position: "relative",
    aspectRatio: "1",
    borderRadius: "lg",
    overflow: "hidden",
    bg: "bg.inset",
    borderWidth: "2px",
    borderColor: "border.subtle",
  },
  ".picker-thumb[data-spe=owned]": { borderColor: "purple.400" },
  ".picker-thumb[data-spe=max]": { borderColor: "yellow.400" },
  ".picker-tile:not(:disabled):hover .picker-thumb": { borderColor: "purple.300" },
  ".picker-thumb > img:first-of-type": { width: "100%", height: "100%", objectFit: "cover" },
  ".picker-thumb[data-muted] > img:first-of-type": { opacity: 0.35 },
  ".picker-affinity": { position: "absolute", top: "3px", left: "3px", width: "18px", height: "18px", objectFit: "contain" },
  ".picker-used": {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bg: "blackAlpha.600",
    color: "white",
    fontSize: "2xs",
    fontWeight: "bold",
  },
  ".picker-name": {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    mt: 1,
    fontSize: "2xs",
    lineHeight: "short",
    color: "text.secondary",
  },
};

// Mounted with the modal only: the filters start empty each time it opens
const PickerContent = ({ usedIds, onPick }: Pick<CharacterPickerModalProps, "usedIds" | "onPick">) => {
  const { t } = useTranslation();
  const { characters, isLoading } = useCharacterCatalog();
  const { owned, hasAlbum } = useMyAlbum();
  const [filters, setFilters] = useState(EMPTY_ALBUM_FILTERS);
  const deferredFilters = useDeferredValue(filters);
  const used = useMemo(() => new Set(usedIds), [usedIds]);
  const usedLabel = t("components.buildForm.characterUsed");
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
          <Grid templateColumns="repeat(auto-fill, minmax(84px, 1fr))" gap={3} sx={TILE_STYLES}>
            {visibleCharacters.map((character) => (
              <PickerTile
                key={character._id}
                character={character}
                spe={owned[character._id] ?? 0}
                muted={hasAlbum && !owned[character._id]}
                isUsed={used.has(character._id)}
                usedLabel={usedLabel}
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
  <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside" motionPreset="none">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <PickerContent usedIds={usedIds} onPick={onPick} />
    </ModalContent>
  </Modal>
);
