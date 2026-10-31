import { Box, Image, Text, Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { characterImageUrl, REBIRTH_STAR_URL } from "@/utils/characterImages";
import { characterVersionLabel } from "@/utils/characterVersion";
import { AffinityIcon } from "../ui/AffinityIcon";

// Character list card, like the in-game list: round thumbnail over its blurred copy, affinity, name and version
export const CharacterCard = ({ character }: { character: ICharacter }) => {
  const { t, i18n } = useTranslation();
  const thumb = characterImageUrl(character, "thumb");
  const version = characterVersionLabel(character, i18n.language);

  return (
    <Box
      as={Link}
      to={`/personnage/${character._id}`}
      display="block"
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      overflow="hidden"
      role="group"
      transition="border-color 0.15s, transform 0.15s"
      _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
    >
      <Box position="relative" aspectRatio={4 / 3} overflow="hidden" bg="bg.inset">
        <Image
          src={thumb}
          alt=""
          aria-hidden
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          transform="scale(1.3)"
          filter="blur(6px) brightness(0.55)"
          loading="lazy"
        />
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" h="84%" aspectRatio={1}>
          <Box
            w="100%"
            h="100%"
            borderRadius="full"
            overflow="hidden"
            borderWidth="3px"
            borderColor="whiteAlpha.800"
            boxShadow="0 0 0 1px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5)"
          >
            <Image
              src={thumb}
              alt={character.name}
              w="100%"
              h="100%"
              objectFit="cover"
              loading="lazy"
              transition="transform 0.2s"
              _groupHover={{ transform: "scale(1.06)" }}
              fallback={<Box w="100%" h="100%" bg="bg.inset" />}
            />
          </Box>
          {character.resurrection_release && (
            <Tooltip label={t("components.characterCard.rebirth", { date: character.resurrection_release })} hasArrow>
              <Image
                src={REBIRTH_STAR_URL}
                alt={t("components.characterCard.rebirthAlt")}
                position="absolute"
                top="-6%"
                left="-6%"
                w="34%"
                filter="drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6))"
              />
            </Tooltip>
          )}
          {character.affinity && (
            <Tooltip label={t(`affinities.${character.affinity}`, character.affinity)} hasArrow>
              <Box position="absolute" bottom="0" right="-4%" w="32%" filter="drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6))">
                <AffinityIcon affinity={character.affinity} size="100%" showLabel={false} variant="medium" />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box px={2} py={2.5} textAlign="center">
        <Text fontWeight="bold" fontSize="sm" color="text.strong" noOfLines={1}>{character.name}</Text>
        <Text fontSize="xs" color="text.muted" noOfLines={1} title={version} minH="1.5em">{version}</Text>
      </Box>
    </Box>
  );
};
