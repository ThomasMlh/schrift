import { useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, ButtonGroup, Flex, Grid, SimpleGrid, Skeleton, Table, Tbody, Td, Text, Th, Thead, Tr, VStack,
} from "@chakra-ui/react";
import { PlayerCell } from "./PlayerCell";
import { useTranslation } from "react-i18next";
import { useQuizResults } from "@/hooks/useAPI";
import type { IQuizRankRow } from "@/interfaces";

type RankingKey = "all" | "guild" | "free";
const RANKINGS: RankingKey[] = ["all", "guild", "free"];

const useFormat = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  return (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
};

const Podium = ({ rows }: { rows: IQuizRankRow[] }) => {
  const { t } = useTranslation();
  const format = useFormat();
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  return (
    <Grid templateColumns={`repeat(${order.length}, 1fr)`} gap={3} alignItems="end">
      {order.map((row) => (
        <VStack
          key={row.attempt_id}
          spacing={0.5}
          p={3}
          pt={row.rank === 1 ? 5 : 3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={row.rank === 1 ? "orange.300" : "border.subtle"}
          bg={row.rank === 1 ? "orange.50" : "bg.subtle"}
          _dark={{ bg: row.rank === 1 ? "whiteAlpha.100" : "bg.subtle" }}
        >
          <Text fontSize="2xl" fontWeight="extrabold" color={row.rank === 1 ? "orange.400" : undefined}>#{row.rank}</Text>
          <PlayerCell player={row.user} name={row.name} direction="column" avatarSize="md" />
          <Text fontSize="xs" color="text.muted" noOfLines={1}>{row.guild_name ?? t("pages.anniversary.noGuild")}</Text>
          <Text fontWeight="extrabold" sx={{ fontVariantNumeric: "tabular-nums" }}>{format(row.total)}</Text>
        </VStack>
      ))}
    </Grid>
  );
};

// The 3 rankings of a quiz and the player's own result, once the event is over
export const QuizResults = ({ quizId, myUserId }: { quizId: string; myUserId?: string }) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { results, isLoading, error } = useQuizResults(quizId);
  const [ranking, setRanking] = useState<RankingKey>("all");

  if (isLoading) return <Skeleton h="240px" borderRadius="xl" />;
  if (error || !results) return <Alert status="info" borderRadius="lg"><AlertIcon />{t("pages.anniversary.resultsUnavailable")}</Alert>;
  const rows = results.rankings[ranking];
  const mine = results.mine;

  return (
    <VStack align="stretch" spacing={5}>
      <Flex justify="flex-end">
        <ButtonGroup size="sm" isAttached variant="outline">
          {RANKINGS.map((key) => (
            <Button key={key} colorScheme={ranking === key ? "purple" : "gray"} variant={ranking === key ? "solid" : "outline"} onClick={() => setRanking(key)}>
              {t(`pages.anniversary.ranking_${key}`)} ({results.rankings[key].length})
            </Button>
          ))}
        </ButtonGroup>
      </Flex>
      {rows.length === 0 ? (
        <Text color="text.muted" textAlign="center" py={6}>{t("pages.anniversary.nobody")}</Text>
      ) : (
        <>
          <Podium rows={rows} />
          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th isNumeric>#</Th>
                  <Th>{t("pages.anniversary.colPlayer")}</Th>
                  <Th>{t("pages.anniversary.colGuild")}</Th>
                  <Th isNumeric>{t("pages.anniversary.colPoints")}</Th>
                  <Th isNumeric>{t("pages.anniversary.colBonus")}</Th>
                  <Th isNumeric>{t("pages.anniversary.colTotal")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((row) => (
                  <Tr key={row.attempt_id} bg={row.user_id === myUserId ? "purple.50" : undefined} _dark={{ bg: row.user_id === myUserId ? "whiteAlpha.100" : undefined }}>
                    <Td isNumeric fontWeight="bold">{row.rank}</Td>
                    <Td><PlayerCell player={row.user} name={row.name} /></Td>
                    <Td>{row.guild_name ? <Badge borderRadius="full" textTransform="none">{row.guild_name}</Badge> : <Text color="text.muted">—</Text>}</Td>
                    <Td isNumeric>{format(row.points)}</Td>
                    <Td isNumeric color="text.muted">+{format(row.bonus)}</Td>
                    <Td isNumeric fontWeight="extrabold">{format(row.total)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}

      {mine && (
        <Box borderTopWidth="1px" borderColor="border.subtle" pt={4}>
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted" mb={3}>{t("pages.anniversary.myResult")}</Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
            {[
              [`${format(mine.points)} / ${format(mine.max_points)}`, t("pages.anniversary.colPoints")],
              [`+${format(mine.bonus)}`, t("pages.anniversary.bonusOf", { max: format(mine.max_bonus) })],
              [format(mine.total), t("pages.anniversary.colTotal")],
              [`#${results.rankings.all.find((r) => r.user_id === myUserId)?.rank ?? "—"}`, t("pages.anniversary.ranking_all")],
            ].map(([value, label]) => (
              <Box key={label} bg="bg.subtle" borderRadius="lg" px={3} py={2}>
                <Text fontSize="lg" fontWeight="extrabold" sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
                <Text fontSize="xs" color="text.muted">{label}</Text>
              </Box>
            ))}
          </SimpleGrid>
          <VStack align="stretch" spacing={1.5}>
            {mine.details.map((detail, index) => {
              const full = detail.points >= detail.max && detail.max > 0;
              return (
                <Grid key={detail.question_id} templateColumns="26px 1fr auto" gap={3} alignItems="start" bg="bg.subtle" borderRadius="lg" px={3} py={2} fontSize="sm">
                  <Box w="22px" h="22px" borderRadius="full" display="grid" placeItems="center" color="white" fontSize="xs" fontWeight="bold"
                    bg={full ? "green.500" : detail.points > 0 ? "orange.400" : "red.400"}>
                    {full ? "✓" : detail.points > 0 ? "½" : "✕"}
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight="semibold">{index + 1}. {detail.prompt}</Text>
                    <Text color="text.muted" fontSize="xs">
                      {detail.missed ? `${t("pages.anniversary.missed")} · ` : ""}
                      {t("pages.anniversary.answer")} {detail.correct.map((c) => (typeof c === "boolean" ? t(c ? "pages.quiz.true" : "pages.quiz.false") : c)).join(" · ")}
                    </Text>
                  </Box>
                  <Text fontWeight="bold" whiteSpace="nowrap" sx={{ fontVariantNumeric: "tabular-nums" }}>{format(detail.points)} / {format(detail.max)}</Text>
                </Grid>
              );
            })}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
