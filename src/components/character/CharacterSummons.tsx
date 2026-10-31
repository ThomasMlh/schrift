import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Box, Button, Flex, Grid, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { SummonBanner } from "@/components/summons/SummonBanner";
import { gameText } from "@/utils/gameText";
import { isSummonOngoing, relativeTime, summonDateRange, summonTime } from "@/utils/summons";

type Summon = NonNullable<ICharacter["summon_history"]>[number];

const VISIBLE_HISTORY = 8;

const summonYear = (summon: Summon) => summon.start_date?.split("/")[2] ?? null;

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

const SummonEntry = ({ summon, language }: { summon: Summon; language: string }) => {
  const { t } = useTranslation();
  return (
    <Flex
      as={RouterLink}
      to={`/invocation/${summon.gacha_group_id}`}
      gap={3}
      align="center"
      minW={0}
      p={1.5}
      borderRadius="md"
      role="group"
      _hover={{ bg: "bg.inset" }}
      _focusVisible={{ boxShadow: "outline" }}
    >
      <Box w="132px" flexShrink={0}>
        <SummonBanner groupId={summon.gacha_group_id} language={language} />
      </Box>
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="semibold" lineHeight="short" color="text.strong" noOfLines={2} _groupHover={{ color: "purple.400" }}>
          {gameText(summon.name, language)}
        </Text>
        {summon.start_date && <Text fontSize="xs" color="text.muted">{summonDateRange(summon)}</Text>}
        {isSummonOngoing(summon) && <Badge mt={1} colorScheme="green">{t("pages.characterDetail.summonOngoing")}</Badge>}
      </Box>
    </Flex>
  );
};

const SummaryFigure = ({ value, label }: { value: string | number; label: string }) => (
  <Box>
    <Text fontSize="2xl" fontWeight="bold" lineHeight="1" color="text.strong">{value}</Text>
    <Text mt={1} fontSize="xs" color="text.muted">{label}</Text>
  </Box>
);

// Where the unit's availability stands, from its latest summon
const availabilityLabel = (latest: Summon, language: string, t: (key: string, options?: Record<string, string>) => string) => {
  if (isSummonOngoing(latest)) return t("pages.characterDetail.summonAvailable");
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
          <SummonBanner groupId={latest.gacha_group_id} language={language} />
        </Box>
        <Box minW={0}>
          {availability && (
            <Text fontSize="sm" fontWeight="semibold" color={isSummonOngoing(latest) ? "green.400" : "text.muted"}>
              {availability}
            </Text>
          )}
          <Text mt={1} fontSize="xl" fontWeight="bold" lineHeight="short" color="text.strong" noOfLines={3}>{gameText(latest.name, language)}</Text>
          {latest.start_date && <Text mt={1} fontSize="sm" color="text.muted">{summonDateRange(latest)}</Text>}
          <HStack mt={4} spacing={8}>
            <SummaryFigure value={banners.length} label={t("pages.characterDetail.summonsCount", { count: banners.length })} />
            {firstYear && <SummaryFigure value={firstYear} label={t("pages.characterDetail.summonsFirstYear")} />}
          </HStack>
        </Box>
      </Grid>

      {history.length > 0 && (
        <Box mt={6}>
          {groupByYear(visible).map(({ year, summons }) => (
            <Box key={year ?? "undated"} mb={4}>
              <Text mb={1} fontSize="sm" fontWeight="bold" color="text.muted">
                {year ?? t("pages.characterDetail.summonsUndated")}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={3} spacingY={1}>
                {summons.map((summon) => (
                  <SummonEntry key={summon.gacha_group_id} summon={summon} language={language} />
                ))}
              </SimpleGrid>
            </Box>
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
