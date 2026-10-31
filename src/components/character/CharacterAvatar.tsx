import { Box, Image } from "@chakra-ui/react";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { CHARACTER_FRAME_BACKGROUND_URL, CHARACTER_FRAME_URL, characterImageUrl } from "@/utils/characterImages";

const AFFINITY_ICONS: Record<string, string> = {
  Force: "force",
  Vitesse: "vitesse",
  Instinct: "instinct",
  Technique: "technique",
  Connaissance: "connaissance",
};

const LAYER = { position: "absolute", inset: 0, boxSize: "100%" } as const;

// In-game thumbnail: background, cut-out unit, frame with its stars, then the affinity in the hexagon of the frame
export const CharacterAvatar = ({ character }: { character: ICharacter }) => {
  const affinity = AFFINITY_ICONS[character.affinity ?? ""];
  return (
    <Box position="relative" boxSize={{ base: "96px", md: "128px" }} filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45))">
      <Image src={CHARACTER_FRAME_BACKGROUND_URL} alt="" aria-hidden {...LAYER} />
      <Image src={characterImageUrl(character, "thumb")} alt={character.name} {...LAYER} />
      <Image src={CHARACTER_FRAME_URL} alt="" aria-hidden {...LAYER} />
      {affinity && (
        <Image src={`${bucketUrl}/affinity/${affinity}_medium.png`} alt="" aria-hidden position="absolute" left="2.34%" top="67.58%" w="26.56%" />
      )}
    </Box>
  );
};
