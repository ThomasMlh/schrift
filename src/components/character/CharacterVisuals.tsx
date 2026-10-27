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

// Character visuals (banner, special attack, artwork, quote) with download and zoom.
// Not every unit has every image in the game files: a picture that fails to load hides its tile.
export const CharacterVisuals = ({ character, onDownload, onOpen }: CharacterVisualsProps) => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [failed, setFailed] = useState<string[]>([]);
  const quote = gameText(character.quote, i18n.language);
  // Game banner when the game files have it, otherwise the banner entered on the site
  const bannerSrc = character.source_images?.banner
    ? characterImageUrl(character, "banner")
    : character.banner_id ? `${bucketUrl}/banners/${character.banner_id}.png` : null;

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
          ...(bannerSrc ? [{
            src: bannerSrc,
            label: t("pages.characterDetail.labelBanner"),
            filename: `banniere-${character.name}.png`,
            key: "banner",
          }] : []),
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
            {key === "banner" && (character.banners?.length ?? 0) > 0 && (
              <VStack align="stretch" spacing={1} px={4} py={3}>
                {character.banners!.map((banner) => (
                  <Text key={banner.gacha_group_id} fontSize="sm" color="text.body">
                    {gameText(banner.name, i18n.language)}
                    {banner.start_date && (
                      <Text as="span" color="text.muted"> · {banner.start_date}{banner.end_date ? ` → ${banner.end_date}` : ""}</Text>
                    )}
                  </Text>
                ))}
              </VStack>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
