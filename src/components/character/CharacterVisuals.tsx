import { useState } from "react";
import { Box, Flex, HStack, IconButton, Image, SimpleGrid, Text, Tooltip, VStack, useColorMode } from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { characterImageUrl, characterQuoteFolder } from "@/utils/characterImages";
import { gameText } from "@/utils/gameText";

interface CharacterVisualsProps {
  character: ICharacter;
  onDownload: (src: string, filename: string) => void;
  onOpen: (src: string, label: string) => void;
}

// Character visuals (special attack, artwork, quote, summons) with download and zoom.
// Not every unit has every image in the game files: a picture that fails to load hides its tile.
export const CharacterVisuals = ({ character, onDownload, onOpen }: CharacterVisualsProps) => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [failed, setFailed] = useState<string[]>([]);
  const quote = gameText(character.quote, i18n.language);
  const summons = character.banners ?? [];

  return (
    <Box>
      <Text
        fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
        textTransform="uppercase"
        color={isDark ? 'purple.400' : 'purple.600'}
        mb={4}
      >
        {t("pages.characterDetail.headingVisuals")}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {[
          { src: characterImageUrl(character, "attack"), label: t("pages.characterDetail.labelSpecialAttack"), filename: `attaque-${character.name}.png`, key: "attack" },
          { src: characterImageUrl(character, "artwork"), label: t("pages.characterDetail.labelArtwork"), filename: `artwork-${character.name}.png`, key: "artwork" },
          { src: characterImageUrl(character, characterQuoteFolder(character, i18n.language)), label: t("pages.characterDetail.labelPhrase"), filename: `phrase-${character.name}.png`, key: "phrase" },
        ].filter(({ key }) => !failed.includes(key)).map(({ src, label, filename, key }) => (
          <Box key={key} borderRadius="xl" overflow="hidden" border="1px solid"
            borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
            bg={isDark ? 'gray.800' : 'white'}>
            <Flex px={4} pt={3} pb={2} borderBottom="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
              justify="space-between" align="center">
              <Text fontSize="xs" fontWeight="semibold" letterSpacing="widest"
                textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
                {label}
              </Text>
              <HStack spacing={1}>
                <Tooltip label={t("pages.characterDetail.tooltipDownload")}>
                  <IconButton aria-label={t("pages.characterDetail.tooltipDownload")} icon={<DownloadIcon />} size="xs"
                    variant="ghost" borderRadius="full"
                    onClick={() => onDownload(src, filename)} />
                </Tooltip>
                <Tooltip label={t("pages.characterDetail.tooltipExpand")}>
                  <IconButton aria-label={t("pages.characterDetail.tooltipExpand")} icon={<ExternalLinkIcon />} size="xs"
                    variant="ghost" borderRadius="full"
                    onClick={() => onOpen(src, label)} />
                </Tooltip>
              </HStack>
            </Flex>
            <Image
              src={src}
              alt={label}
              w="100%" h="auto"
              cursor="zoom-in"
              onClick={() => onOpen(src, label)}
              onError={() => setFailed((keys) => [...keys, key])}
            />
            {key === "phrase" && quote && (
              <Text px={4} py={3} fontSize="sm" fontStyle="italic" color="text.body">« {quote} »</Text>
            )}
          </Box>
        ))}
      </SimpleGrid>

      {summons.length > 0 && (
        <Box mt={4} borderRadius="xl" border="1px solid" borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'} bg={isDark ? 'gray.800' : 'white'}>
          <Text px={4} pt={3} pb={2} fontSize="xs" fontWeight="semibold" letterSpacing="widest" textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
            {t("pages.characterDetail.labelSummons")}
          </Text>
          <VStack align="stretch" spacing={3} px={4} pb={4}>
            {summons.map((summon) => (
              <SummonRow key={summon.gacha_group_id} summon={summon} language={i18n.language} />
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

type Summon = NonNullable<ICharacter["banners"]>[number];

// One summon featuring the character: its list visual (copied to the bucket by the sync), name and dates
const SummonRow = ({ summon, language }: { summon: Summon; language: string }) => {
  const [hasImage, setHasImage] = useState(true);
  return (
    <HStack spacing={3} align="center">
      {hasImage && (
        <Image
          src={`${bucketUrl}/banners/gacha_${summon.gacha_group_id}.png`}
          alt=""
          h={{ base: "48px", sm: "64px" }}
          flexShrink={0}
          borderRadius="md"
          onError={() => setHasImage(false)}
        />
      )}
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="semibold" color="text.strong" noOfLines={2}>{gameText(summon.name, language)}</Text>
        {summon.start_date && (
          <Text fontSize="xs" color="text.muted">{summon.start_date}{summon.end_date ? ` → ${summon.end_date}` : ""}</Text>
        )}
      </Box>
    </HStack>
  );
};
