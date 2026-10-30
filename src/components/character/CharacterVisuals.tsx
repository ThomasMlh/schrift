import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Box, Button, Flex, HStack, IconButton, Image, SimpleGrid, Text, Tooltip, useColorMode } from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { characterImageUrl, characterQuoteFolder } from "@/utils/characterImages";
import { gameText } from "@/utils/gameText";

interface CharacterVisualsProps {
  character: ICharacter;
  onDownload: (src: string, filename: string) => void;
  onOpen: (src: string, label: string, caption?: string) => void;
}

const VISIBLE_SUMMONS = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

// Character visuals (special attack, artwork, quote, summons) with download and zoom.
// Not every unit has every image in the game files: a picture that fails to load hides its tile.
export const CharacterVisuals = ({ character, onDownload, onOpen }: CharacterVisualsProps) => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [failed, setFailed] = useState<string[]>([]);
  const quote = gameText(character.quote, i18n.language);
  const [showAllSummons, setShowAllSummons] = useState(false);
  const summons = [...(character.banners ?? [])].sort((a, b) => summonDate(b.start_date) - summonDate(a.start_date));
  const visibleSummons = showAllSummons ? summons : summons.slice(0, VISIBLE_SUMMONS);

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
                    onClick={() => onOpen(src, label, key === "phrase" ? quote : undefined)} />
                </Tooltip>
              </HStack>
            </Flex>
            <Image
              src={src}
              alt={label}
              w="100%" h="auto"
              cursor="zoom-in"
              onClick={() => onOpen(src, label, key === "phrase" ? quote : undefined)}
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
          <Flex px={4} pt={3} pb={3} justify="space-between" align="center">
            <Text fontSize="xs" fontWeight="semibold" letterSpacing="widest" textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
              {t("pages.characterDetail.labelSummons")} ({summons.length})
            </Text>
            {summons.length > VISIBLE_SUMMONS && (
              <Button size="xs" variant="ghost" borderRadius="full" onClick={() => setShowAllSummons((shown) => !shown)}>
                {showAllSummons ? t("pages.characterDetail.summonsShowLess") : t("pages.characterDetail.summonsShowAll")}
              </Button>
            )}
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} px={4} pb={4}>
            {visibleSummons.map((summon) => (
              <SummonCard key={summon.gacha_group_id} summon={summon} language={i18n.language} />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

type Summon = NonNullable<ICharacter["banners"]>[number];

// Summon dates are stored as DD/MM/YYYY
const summonDate = (date: string | null) => {
  const [day, month, year] = (date ?? "").split("/").map(Number);
  return year ? new Date(year, month - 1, day).getTime() : 0;
};

const isOngoing = (summon: Summon) => {
  const now = Date.now();
  const end = summonDate(summon.end_date);
  return summonDate(summon.start_date) <= now && end > 0 && now < end + DAY_MS;
};

// One summon featuring the character, linking to its page: its banner in the site language when the
// game has it, otherwise the French one, then name and dates
const SummonCard = ({ summon, language }: { summon: Summon; language: string }) => {
  const { t } = useTranslation();
  const lang = language.slice(0, 2);
  const sources = [
    ...(lang !== "fr" ? [`${bucketUrl}/banners/gacha_${summon.gacha_group_id}.${lang}.png`] : []),
    `${bucketUrl}/banners/gacha_${summon.gacha_group_id}.png`,
  ];
  const [attempt, setAttempt] = useState(0);
  return (
    <Box
      as={RouterLink}
      to={`/invocation/${summon.gacha_group_id}`}
      display="block"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.subtle"
      overflow="hidden"
      transition="border-color 0.15s"
      _hover={{ borderColor: "purple.400" }}
    >
      <Box position="relative" sx={{ aspectRatio: "3 / 1" }} bg="bg.inset">
        {attempt < sources.length && (
          <Image
            src={sources[attempt]}
            alt=""
            w="100%"
            h="100%"
            objectFit="cover"
            loading="lazy"
            onError={() => setAttempt((a) => a + 1)}
          />
        )}
        {isOngoing(summon) && (
          <Badge position="absolute" top={2} right={2} colorScheme="green" variant="solid">
            {t("pages.characterDetail.summonOngoing")}
          </Badge>
        )}
      </Box>
      <Box px={3} py={2}>
        <Text fontSize="sm" fontWeight="semibold" color="text.strong" noOfLines={2}>{gameText(summon.name, language)}</Text>
        {summon.start_date && (
          <Text fontSize="xs" color="text.muted">{summon.start_date}{summon.end_date ? ` → ${summon.end_date}` : ""}</Text>
        )}
      </Box>
    </Box>
  );
};
