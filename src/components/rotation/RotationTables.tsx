import { Badge, Box, Button, Flex, HStack, IconButton, Skeleton, Text, Tooltip } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import type { IGuild, IRotationRankedScore, IRotationRecord } from "@/interfaces";
import { RankBadge } from "@/components/ui/RankBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { UserDisplay } from "@/components/ui/UserDisplay";

const localeOf = (language: string) => (language.startsWith("en") ? "en-GB" : "fr-FR");
// Gap between two scores: in millions from 1 M, in thousands below
const formatGap = (value: number, language: string) => (value >= 1_000_000
  ? `${(value / 1_000_000).toLocaleString(localeOf(language), { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
  : `${Math.round(value / 1_000).toLocaleString(localeOf(language))} K`);

const RANKING_COLUMNS = "56px minmax(0, 1fr) 90px 150px 130px";
const RECORD_COLUMNS = "56px minmax(0, 1fr) 90px 150px 150px";

export const GuildFilter = ({ guilds, value, onChange }: { guilds: IGuild[]; value: string; onChange: (id: string) => void }) => {
  const { t } = useTranslation();
  const options = [{ id: "", name: t("pages.rotation.allGuilds") }, ...guilds.map((g) => ({ id: g._id as string, name: g.name }))];
  return (
    <HStack spacing={1} flexWrap="wrap">
      {options.map((option) => (
        <Button
          key={option.id || "all"}
          size="xs"
          variant={value === option.id ? "solid" : "outline"}
          colorScheme={value === option.id ? "purple" : "gray"}
          onClick={() => onChange(option.id)}
        >
          {option.name}
        </Button>
      ))}
    </HStack>
  );
};

export const TablePager = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) => {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <HStack justify="center" spacing={2} py={3} borderTopWidth="1px" borderColor="border.subtle">
      <IconButton aria-label={t("pages.rotation.previousPage")} icon={<ChevronLeftIcon />} size="sm" variant="ghost" isDisabled={page <= 1} onClick={() => onChange(page - 1)} />
      <Text fontSize="sm" color="text.muted">{page} / {totalPages}</Text>
      <IconButton aria-label={t("pages.rotation.nextPage")} icon={<ChevronRightIcon />} size="sm" variant="ghost" isDisabled={page >= totalPages} onClick={() => onChange(page + 1)} />
    </HStack>
  );
};

const HeaderRow = ({ columns, labels }: { columns: string; labels: string[] }) => (
  <Box
    display={{ base: "none", md: "grid" }}
    gridTemplateColumns={columns}
    columnGap={3}
    px={4}
    py={2}
    bg="bg.subtle"
    fontSize="2xs"
    fontWeight="bold"
    textTransform="uppercase"
    letterSpacing="wider"
    color="text.muted"
  >
    {labels.map((label, index) => (
      <Text key={index} textAlign={index >= 3 ? "right" : "left"}>{label}</Text>
    ))}
  </Box>
);

// Row layout: a grid on desktop, rank + two lines on mobile
const rowProps = (columns: string) => ({
  display: "grid",
  gridTemplateColumns: { base: "auto minmax(0, 1fr) auto", md: columns },
  gridTemplateAreas: { base: `"rank player score" ". . extra"`, md: "none" },
  alignItems: "center",
  columnGap: 3,
  px: 4,
  py: 2.5,
  borderTopWidth: "1px",
  borderColor: "border.subtle",
});

const area = (name: string) => ({ gridArea: { base: name, md: "auto" } });

// Own column on desktop, next to the player name on mobile
const GuildBadge = ({ name, mobile }: { name?: string | null; mobile?: boolean }) => (name ? (
  <Badge colorScheme="blue" fontSize="2xs" flexShrink={0} display={mobile ? { base: "inline-flex", md: "none" } : undefined}>{name}</Badge>
) : null);

const LoadingRows = () => (
  <Box p={4}>
    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h="36px" mb={2} borderRadius="md" />)}
  </Box>
);

const Empty = ({ children }: { children: string }) => (
  <Text textAlign="center" color="text.muted" py={10} px={4}>{children}</Text>
);

const PreviousDelta = ({ score }: { score: IRotationRankedScore }) => {
  const { t, i18n } = useTranslation();
  if (!score.previous) {
    return <Text fontSize="xs" color="text.muted" textAlign="right">{t("pages.rotation.firstPassage")}</Text>;
  }
  const diff = score.score - score.previous.score;
  const color = diff > 0 ? "green.400" : diff < 0 ? "red.400" : "text.muted";
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "±";
  const where = [score.previous.cycle_name, score.previous.cycle_year].filter(Boolean).join(" · ");
  return (
    <Tooltip label={t("pages.rotation.previousTooltip", { score: score.previous.score.toLocaleString(localeOf(i18n.language)), cycle: where })} hasArrow>
      <Text fontSize="xs" fontWeight="semibold" textAlign="right" color={color} sx={{ fontVariantNumeric: "tabular-nums" }}>
        {sign}{formatGap(Math.abs(diff), i18n.language)}
      </Text>
    </Tooltip>
  );
};

export const RotationRankingTable = ({
  scores, isLoading, guildName,
}: { scores: IRotationRankedScore[]; isLoading: boolean; guildName: (id?: string) => string | undefined }) => {
  const { t } = useTranslation();
  if (isLoading && scores.length === 0) return <LoadingRows />;
  if (scores.length === 0) return <Empty>{t("pages.rotation.noScore")}</Empty>;
  return (
    <Box>
      <HeaderRow columns={RANKING_COLUMNS} labels={["#", t("pages.rotation.player"), t("pages.rotation.guild"), t("pages.rotation.score"), t("pages.rotation.vsPrevious")]} />
      {scores.map((score) => (
        <Box key={score._id} {...rowProps(RANKING_COLUMNS)} _hover={{ bg: "bg.subtle" }}>
          <Box {...area("rank")}><RankBadge rank={score.rank} variant="compact" /></Box>
          <HStack {...area("player")} minW={0} spacing={2}>
            <Box minW={0}>
              {score.user ? <UserDisplay user={score.user} rainbowText={score.rank === 1} /> : <Text fontWeight="semibold" noOfLines={1}>{score.bbs_name}</Text>}
            </Box>
            <GuildBadge name={guildName(score.guild_id)} mobile />
          </HStack>
          <Box display={{ base: "none", md: "block" }}><GuildBadge name={guildName(score.guild_id)} /></Box>
          <Box {...area("score")} textAlign="right"><ScoreBadge score={score.score} /></Box>
          <Box {...area("extra")} mt={{ base: -1, md: 0 }}><PreviousDelta score={score} /></Box>
        </Box>
      ))}
    </Box>
  );
};

const RecordWhere = ({ record }: { record: IRotationRecord }) => {
  const { t } = useTranslation();
  return (
    <Flex direction="column" align="flex-end">
      <Text fontSize="xs" color="text.muted">{[record.cycle_name, record.cycle_year].filter(Boolean).join(" · ")}</Text>
      <Text fontSize="2xs" color="text.muted">{t("pages.rotation.passagesCount", { count: record.passages })}</Text>
    </Flex>
  );
};

export const RotationRecordsTable = ({ records, isLoading }: { records: IRotationRecord[]; isLoading: boolean }) => {
  const { t } = useTranslation();
  if (isLoading && records.length === 0) return <LoadingRows />;
  if (records.length === 0) return <Empty>{t("pages.rotation.noScore")}</Empty>;
  return (
    <Box>
      <HeaderRow columns={RECORD_COLUMNS} labels={["#", t("pages.rotation.player"), t("pages.rotation.guild"), t("pages.rotation.record"), t("pages.rotation.setIn")]} />
      {records.map((record) => (
        <Box key={record.bbs_id} {...rowProps(RECORD_COLUMNS)} _hover={{ bg: "bg.subtle" }}>
          <Box {...area("rank")}><RankBadge rank={record.rank} variant="compact" /></Box>
          <HStack {...area("player")} minW={0} spacing={2}>
            <Text fontWeight="semibold" noOfLines={1}>{record.bbs_name ?? "?"}</Text>
            <GuildBadge name={record.guild_name} mobile />
          </HStack>
          <Box display={{ base: "none", md: "block" }}><GuildBadge name={record.guild_name} /></Box>
          <Box {...area("score")} textAlign="right"><ScoreBadge score={record.score} /></Box>
          <Box {...area("extra")} mt={{ base: -1, md: 0 }}><RecordWhere record={record} /></Box>
        </Box>
      ))}
    </Box>
  );
};
