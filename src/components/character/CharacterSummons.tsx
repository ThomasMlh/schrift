import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Box, Button, Grid, Image, SimpleGrid, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";

type Summon = NonNullable<ICharacter["banners"]>[number];

const VISIBLE_HISTORY = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

// Summon dates are stored as DD/MM/YYYY
const summonTime = (date: string | null) => {
  const [day, month, year] = (date ?? "").split("/").map(Number);
  return year ? new Date(year, month - 1, day).getTime() : 0;
};

const summonYear = (summon: Summon) => summon.start_date?.split("/")[2] ?? null;

const dateRange = (summon: Summon) => (summon.end_date ? `${summon.start_date} → ${summon.end_date}` : summon.start_date);

const isOngoing = (summon: Summon) => {
  const now = Date.now();
  const end = summonTime(summon.end_date);
  return summonTime(summon.start_date) <= now && end > 0 && now < end + DAY_MS;
};

const relativeTime = (time: number, language: string) => {
  const format = new Intl.RelativeTimeFormat(language.slice(0, 2), { numeric: "auto" });
  const days = Math.round((time - Date.now()) / DAY_MS);
  if (Math.abs(days) < 31) return format.format(days, "day");
  const months = Math.round(days / 30.44);
  return Math.abs(months) < 12 ? format.format(months, "month") : format.format(Math.round(months / 12), "year");
};

// Consecutive summons sharing a start year, as they come
const groupByYear = (summons: Summon[]) => {
  const groups: { year: string | null; summons: Summon[] }[] = [];
  for (const summon of summons) {
    const year = summonYear(summon);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.summons.push(summon);
    else groups.push({ year, summons: [summon] });
  }
  return groups;
};

// Banner in the site language when the game has it, otherwise the French one; the slot stays when neither exists
const SummonBanner = ({ summon, language }: { summon: Summon; language: string }) => {
  const lang = language.slice(0, 2);
  const sources = [
    ...(lang !== "fr" ? [`${bucketUrl}/banners/gacha_${summon.gacha_group_id}.${lang}.png`] : []),
    `${bucketUrl}/banners/gacha_${summon.gacha_group_id}.png`,
  ];
  const [attempt, setAttempt] = useState(0);
  return (
    <Box sx={{ aspectRatio: "3 / 1" }} bg="bg.inset" borderRadius="md" overflow="hidden">
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
    </Box>
  );
};

const SummonEntry = ({ summon, language }: { summon: Summon; language: string }) => {
  const { t } = useTranslation();
  return (
    <Box as={RouterLink} to={`/invocation/${summon.gacha_group_id}`} display="block" role="group" borderRadius="md" _focusVisible={{ boxShadow: "outline" }}>
      <SummonBanner summon={summon} language={language} />
      <Text mt={2} fontSize="md" fontWeight="semibold" lineHeight="short" color="text.strong" noOfLines={2} _groupHover={{ color: "purple.400" }}>
        {gameText(summon.name, language)}
      </Text>
      {summon.start_date && <Text fontSize="xs" color="text.muted">{dateRange(summon)}</Text>}
      {isOngoing(summon) && <Badge mt={1} colorScheme="green">{t("pages.characterDetail.summonOngoing")}</Badge>}
    </Box>
  );
};

// Where the unit's availability stands, from its latest summon
const availabilityLabel = (latest: Summon, language: string, t: (key: string, options?: Record<string, string>) => string) => {
  if (isOngoing(latest)) return t("pages.characterDetail.summonAvailable");
  const start = summonTime(latest.start_date);
  if (!start) return null;
  if (start > Date.now()) return t("pages.characterDetail.summonUpcoming", { when: relativeTime(start, language) });
  return t("pages.characterDetail.summonEnded", { when: relativeTime(summonTime(latest.end_date) || start, language) });
};

// Summon history of a unit: the latest one and how long ago it was, then a timeline of the others by year
export const CharacterSummons = ({ banners }: { banners: Summon[] }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [showAll, setShowAll] = useState(false);
  const [latest, ...history] = [...banners].sort((a, b) => summonTime(b.start_date) - summonTime(a.start_date));
  const visible = showAll ? history : history.slice(0, VISIBLE_HISTORY);
  const hiddenCount = history.length - VISIBLE_HISTORY;
  const availability = availabilityLabel(latest, language, t);
  const firstYear = banners.map(summonYear).filter(Boolean).sort()[0];

  return (
    <Box mt={4} p={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle" bg="bg.card">
      <Text fontSize="xs" fontWeight="semibold" letterSpacing="widest" textTransform="uppercase" color="text.muted" mb={3}>
        {t("pages.characterDetail.labelSummons")}
      </Text>

      <Grid templateColumns={{ base: "1fr", md: "3fr 2fr" }} gap={{ base: 3, md: 5 }} alignItems="center">
        <Box as={RouterLink} to={`/invocation/${latest.gacha_group_id}`} display="block" borderRadius="md" _focusVisible={{ boxShadow: "outline" }}>
          <SummonBanner summon={latest} language={language} />
        </Box>
        <Box minW={0}>
          {availability && (
            <Text fontSize="sm" fontWeight="semibold" color={isOngoing(latest) ? "green.400" : "text.muted"}>
              {availability}
            </Text>
          )}
          <Text mt={1} fontSize="xl" fontWeight="bold" lineHeight="short" color="text.strong" noOfLines={3}>{gameText(latest.name, language)}</Text>
          {latest.start_date && <Text mt={1} fontSize="sm" color="text.muted">{dateRange(latest)}</Text>}
          {firstYear && (
            <Text mt={2} fontSize="xs" color="text.muted">
              {t("pages.characterDetail.summonsTotal", { count: banners.length, year: firstYear })}
            </Text>
          )}
        </Box>
      </Grid>

      {history.length > 0 && (
        <Box mt={6}>
          {groupByYear(visible).map(({ year, summons }) => (
            <Grid key={year ?? "undated"} templateColumns={{ base: "1fr", md: "56px 1fr" }} columnGap={3}>
              <Text fontSize="lg" fontWeight="bold" color="text.muted" lineHeight="1.2" mb={{ base: 2, md: 0 }}>
                {year ?? t("pages.characterDetail.summonsUndated")}
              </Text>
              <Box borderLeftWidth={{ base: 0, md: "2px" }} borderColor="border.subtle" pl={{ base: 0, md: 4 }} pb={6}>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                  {summons.map((summon) => (
                    <SummonEntry key={summon.gacha_group_id} summon={summon} language={language} />
                  ))}
                </SimpleGrid>
              </Box>
            </Grid>
          ))}
          {hiddenCount > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setShowAll((shown) => !shown)}>
              {showAll ? t("pages.characterDetail.summonsShowLess") : t("pages.characterDetail.summonsShowOlder", { count: hiddenCount })}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};
