import { useState } from "react";
import { Box, Flex, HStack, IconButton, Image, SimpleGrid, Text, Tooltip, useColorMode } from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { characterImageUrl, characterQuoteFolder } from "@/utils/characterImages";
import { CharacterSummons } from "./CharacterSummons";

interface CharacterVisualsProps {
  character: ICharacter;
  onDownload: (src: string, filename: string) => void;
  onOpen: (src: string, label: string) => void;
}

// Character visuals (special attack, quote, summons) with download and zoom.
// Not every unit has every image in the game files: a picture that fails to load hides its tile.
export const CharacterVisuals = ({ character, onDownload, onOpen }: CharacterVisualsProps) => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [failed, setFailed] = useState<string[]>([]);
  const summons = character.summon_history ?? character.banners ?? [];

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
          { src: characterImageUrl(character, characterQuoteFolder(i18n.language)), label: t("pages.characterDetail.labelPhrase"), filename: `phrase-${character.name}.png`, key: "phrase" },
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
          </Box>
        ))}
      </SimpleGrid>

      {summons.length > 0 && <CharacterSummons banners={summons} />}
    </Box>
  );
};
