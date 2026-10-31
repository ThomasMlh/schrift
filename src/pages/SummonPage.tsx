import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Badge, Box, Button, Container, Flex, HStack, Image, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useSummon } from "@/hooks/useAPI";
import { PageLoader } from "@/components/ui/PageLoader";
import { bucketUrl } from "@/utils/apiRequest";
import { getAffinityIcon } from "@/utils/characterIcons";
import { gameText } from "@/utils/gameText";
import { characterVersionLabel } from "@/utils/characterVersion";
import type { ISummon, ISummonAccessory, ISummonCharacter, ISummonRates, ISummonRateUnit } from "@/interfaces";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={5}>
    <Text fontSize="xs" fontWeight="semibold" letterSpacing="widest" textTransform="uppercase" color="text.muted" mb={4}>
      {title}
    </Text>
    {children}
  </Box>
);

// Official banner in the site language, the French one otherwise; hidden when neither exists. The visual
// of a ticket is the small item icon of the game
const SummonVisual = ({ groupId, language, isTicket }: { groupId: number; language: string; isTicket: boolean }) => {
  const lang = language.slice(0, 2);
  const sources = [
    ...(lang !== "fr" && !isTicket ? [`${bucketUrl}/banners/gacha_${groupId}.${lang}.png`] : []),
    `${bucketUrl}/banners/gacha_${groupId}.png`,
  ];
  const [attempt, setAttempt] = useState(0);
  if (attempt >= sources.length) return null;
  return (
    <Image
      src={sources[attempt]}
      alt=""
      {...(isTicket ? { boxSize: "128px", borderRadius: "lg" } : { w: "100%", borderRadius: "xl" })}
      onError={() => setAttempt((a) => a + 1)}
    />
  );
};

// Game badge picture (rate, bonus...); only some are in the game files
const GameBadge = ({ src, size }: { src: string | null; size: string }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <Image src={src} alt="" h={size} objectFit="contain" onError={() => setFailed(true)} />;
};

// Price of a draw: spirit orbs show as the game's orb, other currencies keep their name
const SummonPrice = ({ price, payment }: { price: number | null; payment: string | null }) => {
  const { t } = useTranslation();
  const label = t(`pages.summon.payment_${payment ?? "unknown"}`, { defaultValue: payment ?? "" });
  if (payment === "gacha_ticket") return <>{label}</>;
  if (payment !== "gold") return <>{price ?? "?"} {label}</>;
  return (
    <HStack as="span" display="inline-flex" spacing={1}>
      <span>{price ?? "?"}</span>
      <Image src="/orb.png" alt={label} title={label} boxSize="18px" />
    </HStack>
  );
};

const FeaturedCharacter = ({ character, badge, language }: { character: ISummonCharacter; badge: string | null; language: string }) => {
  const version = characterVersionLabel(character, language);
  const affinityIcon = character.affinity ? getAffinityIcon(character.affinity) : null;
  return (
    <VStack
      as={RouterLink}
      to={`/personnage/${character._id}`}
      spacing={2}
      p={3}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.subtle"
      _hover={{ borderColor: "purple.400" }}
    >
      <Box position="relative">
        <Image src={`${bucketUrl}/characters/thumb/${character._id}.png`} alt={character.name} boxSize="72px" borderRadius="lg" loading="lazy" />
        {affinityIcon && (
          <Image src={affinityIcon} alt={character.affinity} position="absolute" top="2px" left="2px" boxSize="18px" objectFit="contain" />
        )}
      </Box>
      <Box textAlign="center">
        <Text fontSize="sm" fontWeight="semibold" color="text.strong" noOfLines={2}>{character.name}</Text>
        {version && <Text fontSize="xs" color="text.muted" noOfLines={2}>{version}</Text>}
      </Box>
      <GameBadge src={badge} size="72px" />
    </VStack>
  );
};

// Unit of the rate page without a sheet on the site
const UnlinkedUnit = ({ unit }: { unit: ISummonRateUnit }) => (
  <VStack spacing={1} p={3} borderRadius="lg" borderWidth="1px" borderColor="border.subtle" justify="center">
    <Text fontSize="sm" fontWeight="semibold" color="text.strong" textAlign="center" noOfLines={2}>{unit.name}</Text>
    <Text fontSize="xs" color="text.muted" textAlign="center" noOfLines={2}>
      {[`${unit.rarity}★`, unit.version].filter(Boolean).join(" ")}
    </Text>
  </VStack>
);

const VISIBLE_UNITS = 30;

const RateUnits = ({ units, summon, language }: { units: ISummonRateUnit[]; summon: ISummon; language: string }) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const byGameId = new Map(summon.characters.map((c) => [c.game_id, c]));
  const badges = new Map((summon.details?.featured ?? []).map((f) => [f.game_id, f.badge]));
  return (
    <>
      <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3}>
        {(showAll ? units : units.slice(0, VISIBLE_UNITS)).map((unit, index) => {
          const character = unit.game_id ? byGameId.get(unit.game_id) : undefined;
          return character
            ? <FeaturedCharacter key={character._id} character={character} badge={badges.get(character.game_id) ?? null} language={language} />
            : <UnlinkedUnit key={index} unit={unit} />;
        })}
      </SimpleGrid>
      {!showAll && units.length > VISIBLE_UNITS && (
        <Button size="sm" variant="ghost" mt={3} onClick={() => setShowAll(true)}>
          {t("pages.summon.showAll", { count: units.length })}
        </Button>
      )}
    </>
  );
};

const FeaturedAccessories = ({ accessories, language }: { accessories: ISummonAccessory[]; language: string }) => (
  <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3}>
    {accessories.map((accessory) => (
      <VStack key={accessory._id} spacing={2} p={3} borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
        {accessory.code && <Image src={`${bucketUrl}/accessories/${accessory.code}/thumb.png`} alt="" boxSize="72px" objectFit="contain" loading="lazy" />}
        <Text fontSize="sm" fontWeight="semibold" color="text.strong" textAlign="center" noOfLines={2}>
          {gameText(accessory.names, language) || accessory.name}
        </Text>
      </VStack>
    ))}
  </SimpleGrid>
);

type RateRow = ISummonRates["tables"][number]["rows"][number];

// Steps with the same rates share a row: "Palier 1" to "Palier 4" reads "Palier 1 – 4"
const mergeSteps = (rows: RateRow[]) => {
  const merged: { row: RateRow; first: string; last: string }[] = [];
  for (const row of rows) {
    const label = row.cells[0]?.[0] ?? "";
    const previous = merged[merged.length - 1];
    const sameRates = previous && !row.header && !previous.row.header && label.startsWith("Palier")
      && JSON.stringify(row.cells.slice(1)) === JSON.stringify(previous.row.cells.slice(1));
    if (sameRates) previous.last = label;
    else merged.push({ row, first: label, last: label });
  }
  return merged.map(({ row, first, last }) => (
    first === last ? row : { ...row, cells: [[`${first} – ${last.replace("Palier ", "")}`], ...row.cells.slice(1)] }
  ));
};

const RateTables = ({ tables }: { tables: ISummonRates["tables"] }) => (
  <VStack align="stretch" spacing={5}>
    {tables.map((table, index) => {
      const columns = Math.max(...table.rows.map((row) => row.cells.length));
      return (
        <Box key={index}>
          {table.title && <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={2}>{table.title}</Text>}
          <Box overflowX="auto">
            <Table size="sm">
              <Tbody>
                {mergeSteps(table.rows).map((row, rowIndex) => (
                  <Tr key={rowIndex}>
                    {row.cells.map((lines, cellIndex) => {
                      const Cell = row.header ? Th : Td;
                      return (
                        <Cell key={cellIndex} colSpan={row.cells.length === 1 ? columns : undefined} verticalAlign="top" minW="110px">
                          {lines.map((line, lineIndex) => <Text key={lineIndex} fontSize="xs" textTransform="none">{line}</Text>)}
                        </Cell>
                      );
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      );
    })}
  </VStack>
);

// Units the summon features, in the game's layout order; any other unit it lists comes after. Those of
// the rate page have their own sections.
const orderedCharacters = (summon: ISummon) => {
  const byGameId = new Map(summon.characters.map((c) => [c.game_id, c]));
  const inRates = new Set((summon.rates?.sections ?? []).flatMap((section) => section.units.map((unit) => unit.game_id)));
  const featured = summon.details?.featured ?? [];
  const rows = featured
    .map((f) => ({ character: byGameId.get(f.game_id), badge: f.badge }))
    .filter((row): row is { character: ISummonCharacter; badge: string | null } => Boolean(row.character));
  const listed = new Set(featured.map((f) => f.game_id));
  for (const character of summon.characters) {
    if (!listed.has(character.game_id)) rows.push({ character, badge: null });
  }
  return rows.filter(({ character }) => !inRates.has(character.game_id));
};

const SummonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { summon, isLoading, error } = useSummon(id);
  const language = i18n.language;

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <PageLoader color="purple.500" height="200px" />
      </Container>
    );
  }

  if (error || !summon) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6}>
          <Text fontSize="xl" color="red.500">{t("pages.summon.notFound")}</Text>
          <Button leftIcon={<ArrowBackIcon />} colorScheme="purple" variant="outline" borderRadius="full" onClick={() => navigate(-1)}>
            {t("pages.summon.back")}
          </Button>
        </VStack>
      </Container>
    );
  }

  const details = summon.details;
  const name = gameText(summon.names, language) || summon.name || t("pages.summon.title");
  const start = details?.start_at ?? summon.start_date;
  // The catalog gives no end date to what never expires, while the details keep the far date of the tables
  const end = summon.list_category && !summon.end_date ? null : details?.end_at ?? summon.end_date;
  const characters = orderedCharacters(summon);
  const isStepUp = (details?.steps.length ?? 0) > 0;
  const modes = (details?.modes ?? []).filter((mode) => !(isStepUp && mode.kind === "multiple"));

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={5} align="stretch">
        <Button alignSelf="flex-start" leftIcon={<ArrowBackIcon />} variant="ghost" size="sm" onClick={() => navigate(-1)}>
          {t("pages.summon.back")}
        </Button>

        <SummonVisual groupId={summon.gacha_group_id} language={language} isTicket={Boolean(summon.list_category?.endsWith("_ticket"))} />

        <Box>
          <Text as="h1" fontSize="2xl" fontWeight="bold" color="text.strong">{name}</Text>
          <Flex gap={2} wrap="wrap" align="center" mt={2}>
            {start && <Text fontSize="sm" color="text.muted">{start}{end ? ` → ${end}` : ""}</Text>}
            {details?.category && (
              <Badge colorScheme={details.category === "limited" ? "orange" : "gray"}>
                {t(`pages.summon.category_${details.category}`, { defaultValue: details.category })}
              </Badge>
            )}
            {details?.news_id && <Badge variant="outline">{t("pages.summon.newsId", { id: details.news_id })}</Badge>}
            <Badge variant="outline">{t("pages.summon.groupId", { id: summon.gacha_group_id })}</Badge>
          </Flex>
        </Box>

        {(summon.rates?.sections ?? []).map((section) => (
          <Section key={section.kind} title={t(`pages.summon.section_${section.kind}`, { count: section.units.length })}>
            <RateUnits units={section.units} summon={summon} language={language} />
          </Section>
        ))}

        {(summon.accessories?.length ?? 0) > 0 && (
          <Section title={t("pages.summon.accessories")}>
            <FeaturedAccessories accessories={summon.accessories ?? []} language={language} />
          </Section>
        )}

        {characters.length > 0 && (
          <Section title={t("pages.summon.featured")}>
            <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3}>
              {characters.map(({ character, badge }) => (
                <FeaturedCharacter key={character._id} character={character} badge={badge} language={language} />
              ))}
            </SimpleGrid>
          </Section>
        )}

        {modes.length > 0 && (
          <Section title={t("pages.summon.modes")}>
            <VStack align="stretch" spacing={2}>
              {modes.map((mode) => (
                <HStack key={mode.kind} justify="space-between">
                  <Text fontSize="sm" color="text.strong">{t("pages.summon.mode", { count: mode.draws })}</Text>
                  <Text as="div" fontSize="sm" color="text.muted">
                    <SummonPrice price={mode.price} payment={mode.payment} />
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Section>
        )}

        {isStepUp && details && (
          <Section title={t("pages.summon.steps")}>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>{t("pages.summon.step")}</Th>
                    <Th isNumeric>{t("pages.summon.price")}</Th>
                    <Th isNumeric>{t("pages.summon.draws")}</Th>
                    <Th>{t("pages.summon.rate")}</Th>
                    <Th>{t("pages.summon.bonus")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {details.steps.map((step) => (
                    <Tr key={step.number}>
                      <Td whiteSpace="nowrap">
                        {step.number}
                        {step.is_loop && <Badge ml={2} colorScheme="purple">{t("pages.summon.loop")}</Badge>}
                      </Td>
                      <Td isNumeric whiteSpace="nowrap"><SummonPrice price={step.price} payment={details.modes.find((m) => m.kind === "multiple")?.payment ?? "gold"} /></Td>
                      <Td isNumeric>{step.draws}</Td>
                      <Td minW="160px">{gameText(step.rarity_5, language)}</Td>
                      <Td minW="160px">
                        <VStack align="start" spacing={1}>
                          {step.appeal && <Text fontSize="sm">{gameText(step.appeal, language)}</Text>}
                          <GameBadge src={step.badge} size="96px" />
                        </VStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {details.attention && (
              <Text fontSize="sm" color="text.muted" mt={4}>{gameText(details.attention, language)}</Text>
            )}
          </Section>
        )}

        {details?.medal_shop && (
          <Section title={t("pages.summon.medalShop")}>
            <Flex justify="space-between" wrap="wrap" gap={2} mb={3}>
              <Text fontSize="sm" fontWeight="semibold" color="text.strong">{gameText(details.medal_shop.name, language)}</Text>
              {details.medal_shop.start_date && (
                <Text fontSize="sm" color="text.muted">
                  {details.medal_shop.start_date}{details.medal_shop.end_date ? ` → ${details.medal_shop.end_date}` : ""}
                </Text>
              )}
            </Flex>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>{t("pages.summon.product")}</Th>
                    <Th isNumeric>{t("pages.summon.medals")}</Th>
                    <Th isNumeric>{t("pages.summon.limit")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {details.medal_shop.products.map((product, index) => (
                    <Tr key={index}>
                      <Td>
                        {gameText(product.name, language)}
                        {product.amount && product.amount > 1 ? ` ×${product.amount}` : ""}
                      </Td>
                      <Td isNumeric>{product.price ?? "?"}</Td>
                      <Td isNumeric>{product.limit ?? t("pages.summon.unlimited")}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Section>
        )}

        {(summon.rates?.tables.length ?? 0) > 0 ? (
          <Section title={t("pages.summon.rates")}>
            <RateTables tables={summon.rates?.tables ?? []} />
            <Text fontSize="xs" color="text.muted" mt={4}>{t("pages.summon.ratesSource")}</Text>
          </Section>
        ) : (
          <Text fontSize="xs" color="text.muted">{t("pages.summon.ratesNote")}</Text>
        )}
      </VStack>
    </Container>
  );
};

export default SummonPage;
