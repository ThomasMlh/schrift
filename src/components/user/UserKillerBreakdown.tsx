import { useState } from "react";
import { Box, Button, ButtonGroup, Flex, Grid, HStack, Icon, Skeleton, Text, Tooltip } from "@chakra-ui/react";
import { FiTarget } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";
import { useUserRecords } from "@/hooks/useAPI";
import type { IUserStats } from "@/hooks/useAPI";

interface UserKillerBreakdownProps {
  stats: IUserStats;
  userId?: string;
  // bbs account shown on the page (an alt when the URL targets it); defaults to the main account
  bbsId?: string;
  // A cycle is chosen: only its killers are listed, the records stay all-time
  cycleSelected: boolean;
}

type Sort = "average" | "record" | "name";

interface Row {
  id: string;
  killer: string;
  attack: string | null;
  alteration: string | null;
  average: number | null;
  count: number;
  record: number | null;
  recordCycle: string | null;
  attempts: number;
}

const millions = (value: number) => `${(value / 1000000).toFixed(2)}M`;
// Killers flagged as "to work on" once there are enough of them
const WEAK_COUNT = 3;
const MIN_FOR_WEAK = 6;

// Performances tab: one row per killer with the player's average (bar spread between their weakest and
// strongest killer), their all-time record and its cycle
export const UserKillerBreakdown = ({ stats, userId, bbsId, cycleSelected }: UserKillerBreakdownProps) => {
  const { t } = useTranslation();
  const { accounts, isLoading } = useUserRecords(userId);
  const [sort, setSort] = useState<Sort>("average");

  const account = accounts.find((a) => a.bbs_id === bbsId) ?? accounts.find((a) => a.is_primary) ?? accounts[0];
  const records = new Map((account?.records ?? []).map((r) => [r.rotation_id, r]));
  const rows = new Map<string, Row>();
  for (const r of stats.allRotations) {
    const record = records.get(r.rotation_id);
    rows.set(r.rotation_id, {
      id: r.rotation_id,
      killer: r.rotation_killer,
      attack: r.rotation_attack ?? null,
      alteration: record?.alteration ?? null,
      average: r.averageScore,
      count: r.scoreCount,
      record: record?.score ?? null,
      recordCycle: record ? [record.cycle_name, record.cycle_year].filter(Boolean).join(" ") : null,
      attempts: record?.attempts ?? r.scoreCount,
    });
  }
  // Without a cycle, killers that only have a record are listed too
  if (!cycleSelected) {
    for (const record of records.values()) {
      if (rows.has(record.rotation_id)) continue;
      rows.set(record.rotation_id, {
        id: record.rotation_id, killer: record.killer ?? "—", attack: record.attack, alteration: record.alteration,
        average: null, count: 0, record: record.score,
        recordCycle: [record.cycle_name, record.cycle_year].filter(Boolean).join(" "), attempts: record.attempts,
      });
    }
  }

  const list = [...rows.values()];
  const averages = list.map((r) => r.average).filter((v): v is number => v !== null);
  const best = Math.max(...averages);
  const worst = Math.min(...averages);
  const weakIds = new Set(
    averages.length >= MIN_FOR_WEAK
      ? [...list].filter((r) => r.average !== null).sort((a, b) => (a.average ?? 0) - (b.average ?? 0)).slice(0, WEAK_COUNT).map((r) => r.id)
      : [],
  );
  const sorted = list.sort((a, b) => (
    sort === "name" ? a.killer.localeCompare(b.killer)
      : sort === "record" ? (b.record ?? 0) - (a.record ?? 0)
        : (b.average ?? -1) - (a.average ?? -1)
  ));
  // Bars spread between the weakest and the strongest average, never empty
  const barWidth = (value: number) => (best === worst ? 100 : 12 + ((value - worst) / (best - worst)) * 88);

  return (
    <Box
      bgColor="bg.card"
      bgGradient="linear(to-br, rgba(128, 90, 213, 0.14), transparent 45%)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
    >
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} mb={4} direction={{ base: "column", md: "row" }}>
        <HStack spacing={3}>
          <Box boxSize="36px" flexShrink={0} display="grid" placeItems="center" borderRadius="lg" bg="purple.900" color="purple.200" _light={{ bg: "purple.100", color: "purple.700" }}>
            <Icon as={FiTarget} boxSize={5} aria-hidden />
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="md" color="text.strong">{t("components.user.killers.title")}</Text>
            <Text fontSize="xs" color="text.muted">{t(cycleSelected ? "components.user.killers.subtitleCycle" : "components.user.killers.subtitle")}</Text>
          </Box>
        </HStack>
        <ButtonGroup size="sm" isAttached variant="outline">
          {(["average", "record", "name"] as Sort[]).map((key) => (
            <Button key={key} onClick={() => setSort(key)} colorScheme={sort === key ? "purple" : "gray"} variant={sort === key ? "solid" : "outline"}>
              {t(`components.user.killers.sort_${key}`)}
            </Button>
          ))}
        </ButtonGroup>
      </Flex>

      {isLoading ? <Skeleton h="240px" borderRadius="lg" /> : sorted.length === 0 ? (
        <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>{t("components.user.killers.empty")}</Text>
      ) : (
        <>
          <Grid
            display={{ base: "none", md: "grid" }}
            templateColumns="minmax(0, 1.3fr) minmax(0, 2fr) minmax(0, 1fr) 80px"
            gap={4}
            px={3}
            pb={2}
            fontSize="xs"
            fontWeight="semibold"
            color="text.muted"
          >
            <Text>{t("components.user.killers.colKiller")}</Text>
            <Text>{t("components.user.killers.colAverage")}</Text>
            <Text textAlign="right">{t("components.user.killers.colRecord")}</Text>
            <Text textAlign="right">{t("components.user.killers.colAttempts")}</Text>
          </Grid>
          <Box>
            {sorted.map((row) => {
              const isBest = row.average !== null && row.average === best && averages.length > 1;
              const isWeak = weakIds.has(row.id);
              return (
                <Grid
                  key={row.id}
                  templateColumns={{ base: "minmax(0, 1fr) auto", md: "minmax(0, 1.3fr) minmax(0, 2fr) minmax(0, 1fr) 80px" }}
                  templateAreas={{ base: `"killer record" "average average"`, md: `"killer average record attempts"` }}
                  gap={{ base: 2, md: 4 }}
                  alignItems="center"
                  px={3}
                  py={3}
                  borderTopWidth="1px"
                  borderColor="border.subtle"
                  borderRadius="lg"
                  _hover={{ bg: "bg.subtle" }}
                >
                  <HStack gridArea="killer" spacing={2} minW={0}>
                    {row.attack && <AttackTypeBadge attackType={row.attack} size="12px" />}
                    <Text fontWeight="semibold" color="text.strong" noOfLines={1}>{row.killer}</Text>
                    {row.alteration && (
                      <Tooltip label={t(`alterations.${row.alteration}`, row.alteration)} hasArrow>
                        <Box as="span" display="inline-flex" flexShrink={0}><AlterationImage alteration={row.alteration} size="18px" /></Box>
                      </Tooltip>
                    )}
                  </HStack>

                  <Box gridArea="average" minW={0}>
                    {row.average === null ? (
                      <Text fontSize="sm" color="text.muted">{t("components.user.killers.noAverage")}</Text>
                    ) : (
                      <HStack spacing={3}>
                        <Box flex={1} h="10px" borderRadius="full" bg="bg.subtle" overflow="hidden">
                          <Box
                            h="100%"
                            w={`${barWidth(row.average)}%`}
                            borderRadius="full"
                            bgGradient={isBest ? "linear(to-r, yellow.600, yellow.300)" : isWeak ? "linear(to-r, orange.600, orange.300)" : "linear(to-r, purple.600, purple.300)"}
                          />
                        </Box>
                        <Box textAlign="right" minW="92px">
                          <Text fontSize="sm" fontWeight="bold" color={isBest ? "yellow.300" : isWeak ? "orange.300" : "text.strong"} _light={{ color: isBest ? "yellow.600" : isWeak ? "orange.600" : "text.strong" }} sx={{ fontVariantNumeric: "tabular-nums" }} whiteSpace="nowrap">
                            {millions(row.average)}
                          </Text>
                          <Text fontSize="xs" color="text.muted" whiteSpace="nowrap" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {isBest ? t("components.user.killers.best") : isWeak ? t("components.user.killers.toWork") : `−${millions(best - row.average)}`}
                          </Text>
                        </Box>
                      </HStack>
                    )}
                  </Box>

                  <Box gridArea="record" textAlign="right" minW={0}>
                    <Text fontSize="sm" fontWeight="semibold" color="text.strong" sx={{ fontVariantNumeric: "tabular-nums" }} whiteSpace="nowrap">
                      {row.record !== null ? row.record.toLocaleString("fr-FR") : "—"}
                    </Text>
                    {row.recordCycle && <Text fontSize="xs" color="text.muted" noOfLines={1}>{row.recordCycle}</Text>}
                  </Box>

                  <Text display={{ base: "none", md: "block" }} gridArea="attempts" textAlign="right" fontSize="sm" color="text.muted" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {row.attempts}
                  </Text>
                </Grid>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};
