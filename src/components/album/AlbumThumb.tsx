import { Box, HStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { bucketUrl } from "@/utils/apiRequest";
import { getAffinityIcon } from "@/utils/characterIcons";
import { MAX_SPE, SPE_LEVELS } from "@/utils/albumFilters";
import type { IAlbumCharacter } from "@/interfaces";

export const SpePips = ({ spe, size = 7 }: { spe: number; size?: number }) => (
  <HStack spacing="3px" justify="center">
    {SPE_LEVELS.map((level) => (
      <Box
        key={level}
        w={`${size}px`}
        h={`${size}px`}
        borderRadius="full"
        bg={level <= spe ? "yellow.300" : "whiteAlpha.400"}
        boxShadow={level <= spe ? "0 0 4px rgba(250, 204, 21, 0.8)" : undefined}
      />
    ))}
  </HStack>
);

interface AlbumThumbProps {
  character: IAlbumCharacter;
  spe: number;
  // Greyed out: not owned by default
  muted?: boolean;
  children?: ReactNode;
}

// Native <img> rather than Chakra's Image with fallback, which preloads every thumbnail in JS
export const AlbumThumb = ({ character, spe, muted = spe === 0, children }: AlbumThumbProps) => (
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
      filter={muted ? "grayscale(1)" : undefined}
      opacity={muted ? 0.35 : 1}
    />
    {/* Some versions of a character share the same artwork */}
    {character.affinity && (
      <Box
        as="img"
        src={getAffinityIcon(character.affinity) ?? undefined}
        alt={character.affinity}
        position="absolute"
        top="3px"
        left="3px"
        w="18px"
        h="18px"
        objectFit="contain"
        loading="lazy"
        decoding="async"
        opacity={muted ? 0.6 : 1}
      />
    )}
    {spe > 0 && (
      <Box position="absolute" bottom={0} left={0} right={0} py={1} bgGradient="linear(to-t, blackAlpha.800, transparent)">
        <SpePips spe={spe} />
      </Box>
    )}
    {children}
  </Box>
);
