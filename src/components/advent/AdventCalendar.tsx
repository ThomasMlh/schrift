import { useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, ButtonGroup, Flex, Grid, HStack, Image, Input, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalHeader, ModalOverlay, Skeleton, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAdventAnswer, useAdventCalendar } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { bucketUrl } from "@/utils/apiRequest";
import { characterImageUrl } from "@/utils/characterImages";
import { startDiscordLogin } from "@/utils/discordAuth";
import type { IAdventDay, IAdventRankRow } from "@/interfaces";

type Ranking = "all" | "guild" | "free";
const RESULT_COLORS = { correct: "green", wrong: "red", pending: "orange" } as const;
const RESULT_MARKS = { correct: "✓", wrong: "✗", pending: "…" } as const;

const Door = ({ day, onOpen }: { day: IAdventDay; onOpen: () => void }) => {
  const { t, i18n } = useTranslation();
  // A case whose day has come but that is not filled yet cannot be opened either
  const locked = day.state === "locked" || day.state === "empty";
  const today = day.state === "today";
  const opens = new Date(day.opens_at).toLocaleDateString(i18n.language.startsWith("en") ? "en-GB" : "fr-FR", { day: "numeric", month: "long" });
  const label = day.state === "empty" ? t("pages.advent.notReady")
    : locked ? t("pages.advent.opensOn", { date: opens })
    : day.mine ? t(`pages.advent.result_${day.mine.result}`)
      : day.state === "late" ? t("pages.advent.lateHint") : t("pages.advent.openHint");
  return (
    <Tooltip label={label} hasArrow>
      <Box
        as="button"
        type="button"
        onClick={locked ? undefined : onOpen}
        aria-disabled={locked}
        aria-label={`${t("pages.advent.case", { day: day.day })} · ${label}`}
        position="relative"
        aspectRatio="1"
        borderRadius="xl"
        borderWidth={today ? "2px" : "1px"}
        borderColor={today ? "orange.300" : "whiteAlpha.300"}
        bg={locked ? "blackAlpha.300" : today ? "whiteAlpha.300" : "whiteAlpha.200"}
        color="white"
        cursor={locked ? "default" : "pointer"}
        opacity={locked ? 0.55 : 1}
        boxShadow={today ? "0 0 0 4px rgba(251, 211, 141, 0.25)" : undefined}
        transition="transform 0.15s"
        _hover={locked ? undefined : { transform: "translateY(-2px)" }}
        overflow="hidden"
      >
        {day.character && (
          <Image src={characterImageUrl(day.character, "thumb")} alt="" position="absolute" inset={0} w="100%" h="100%" objectFit="cover" opacity={0.45} />
        )}
        <Text position="relative" fontSize={{ base: "xl", md: "2xl" }} fontWeight="extrabold" sx={{ fontVariantNumeric: "tabular-nums" }}>{day.day}</Text>
        {day.mine && (
          <Badge position="absolute" top={1.5} right={1.5} colorScheme={RESULT_COLORS[day.mine.result]} variant="solid" borderRadius="full" px={1.5}>
            {RESULT_MARKS[day.mine.result]}
          </Badge>
        )}
        {today && !day.mine && <Text position="absolute" bottom={1} left={0} right={0} fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="orange.200">{t("pages.advent.today")}</Text>}
      </Box>
    </Tooltip>
  );
};

const CaseModal = ({ eventId, day, points, onClose }: { eventId: string; day: IAdventDay; points: number; onClose: () => void }) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const answer = useAdventAnswer();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await answer(eventId, day.day, text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };
  const late = day.state === "late";
  return (
    <Modal isOpen onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t("pages.advent.case", { day: day.day })}
          <Text fontSize="sm" fontWeight="normal" color="text.muted">
            {t(`pages.advent.clue_${day.clue?.type ?? "silhouette"}`)} · {t("pages.advent.worth", { count: late ? points / 2 : points })}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            {day.clue?.path && (
              <Box bg="bg.subtle" borderRadius="xl" p={3} display="grid" placeItems="center">
                <Image src={`${bucketUrl}/${day.clue.path}`} alt={t("pages.advent.clueAlt")} maxH="340px" objectFit="contain" draggable={false} />
              </Box>
            )}
            {day.clue?.text && (
              <Box bg="bg.subtle" borderRadius="xl" p={4} fontStyle="italic" whiteSpace="pre-line">« {day.clue.text} »</Box>
            )}
            {day.character && (
              <HStack bg="bg.subtle" borderRadius="xl" p={3} spacing={3}>
                <Image src={characterImageUrl(day.character, "thumb")} alt="" boxSize="56px" borderRadius="md" />
                <Box>
                  <Text fontSize="xs" color="text.muted">{t("pages.advent.answerWas")}</Text>
                  <Text fontWeight="bold">{day.character.name}</Text>
                </Box>
              </HStack>
            )}
            {day.mine ? (
              <Alert status={day.mine.result === "correct" ? "success" : day.mine.result === "pending" ? "warning" : "error"} borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">{t(`pages.advent.result_${day.mine.result}`)} · {t("pages.advent.points", { count: day.mine.points })}</Text>
                  <Text fontSize="sm">{t("pages.advent.yourAnswer", { answer: day.mine.answer })}</Text>
                </Box>
              </Alert>
            ) : day.state === "over" ? null : !isLoggedIn ? (
              <Button colorScheme="purple" onClick={startDiscordLogin}>{t("pages.anniversary.login")}</Button>
            ) : (
              <Box as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (text.trim()) send(); }}>
                {late && <Text fontSize="sm" color="orange.400" mb={2}>{t("pages.advent.lateWarning")}</Text>}
                <HStack>
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("pages.advent.placeholder")} maxLength={120} autoFocus />
                  <Button type="submit" colorScheme="purple" isLoading={sending} isDisabled={!text.trim()}>{t("pages.advent.send")}</Button>
                </HStack>
                <Text fontSize="xs" color="text.muted" mt={2}>{t("pages.advent.oneTry")}</Text>
              </Box>
            )}
            {error && <Alert status="error" borderRadius="lg"><AlertIcon />{error}</Alert>}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Rankings = ({ rankings, myUserId }: { rankings: Record<Ranking, IAdventRankRow[]>; myUserId?: string }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Ranking>("all");
  const rows = rankings[tab];
  const shown = rows.slice(0, 15);
  const me = rows.find((r) => r.user_id === myUserId);
  if (me && !shown.includes(me)) shown.push(me);
  return (
    <VStack align="stretch" spacing={3}>
      <ButtonGroup size="xs" isAttached variant="outline">
        {(["all", "guild", "free"] as Ranking[]).map((key) => (
          <Button key={key} onClick={() => setTab(key)} colorScheme={tab === key ? "purple" : "gray"} variant={tab === key ? "solid" : "outline"}>
            {t(`pages.advent.ranking_${key}`)} ({rankings[key].length})
          </Button>
        ))}
      </ButtonGroup>
      {rows.length === 0 ? <Text fontSize="sm" color="text.muted">{t("pages.advent.noPlayer")}</Text> : (
        <Table size="sm">
          <Thead><Tr><Th w="40px">#</Th><Th>{t("pages.advent.player")}</Th><Th isNumeric>{t("pages.advent.found")}</Th><Th isNumeric>{t("pages.advent.pts")}</Th></Tr></Thead>
          <Tbody>
            {shown.map((row) => (
              <Tr key={row.user_id} bg={row.user_id === myUserId ? "purple.50" : undefined} _dark={{ bg: row.user_id === myUserId ? "whiteAlpha.100" : undefined }}>
                <Td fontWeight="bold">{row.rank}</Td>
                <Td>
                  <Text fontWeight="semibold">{row.name}</Text>
                  {row.guild_name && <Text fontSize="xs" color="text.muted">{row.guild_name}</Text>}
                </Td>
                <Td isNumeric>{row.found}</Td>
                <Td isNumeric fontWeight="bold">{row.points.toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </VStack>
  );
};

// Advent calendar of the anniversary page: one case a day, a character to name from a clue
export const AdventCalendar = ({ eventId }: { eventId: string }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { data, isLoading } = useAdventCalendar(eventId);
  const [openDay, setOpenDay] = useState<number | null>(null);
  if (isLoading) return <Skeleton h="320px" borderRadius="2xl" />;
  if (!data) return null;
  const day = data.days.find((d) => d.day === openDay) ?? null;
  const total = data.days.reduce((sum, d) => sum + (d.mine?.points ?? 0), 0);
  return (
    <Grid templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }} gap={5} alignItems="start">
      <Box borderRadius="2xl" p={{ base: 4, md: 6 }} color="white" bgGradient="linear(to-br, #1c2a4a, #2a1d5c 55%, #5b2165)">
        <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap" mb={4}>
          <Box>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="purple.100">{t("pages.advent.eyebrow")}</Text>
            <Text fontSize="xl" fontWeight="extrabold">{t("pages.advent.title")}</Text>
            <Text fontSize="sm" color="purple.50" mt={1}>{t("pages.advent.intro", { points: data.advent.points, half: data.advent.points * data.advent.late_ratio })}</Text>
          </Box>
          {total > 0 && <Badge colorScheme="orange" fontSize="md" borderRadius="full" px={3} py={1}>{t("pages.advent.points", { count: total })}</Badge>}
        </Flex>
        <Grid templateColumns={{ base: "repeat(4, 1fr)", sm: "repeat(6, 1fr)" }} gap={{ base: 2, md: 3 }}>
          {data.days.map((d) => <Door key={d.day} day={d} onOpen={() => setOpenDay(d.day)} />)}
        </Grid>
      </Box>
      <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" p={{ base: 4, md: 6 }}>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted" mb={3}>{t("pages.advent.rankings")}</Text>
        <Rankings rankings={data.rankings} myUserId={currentUser?._id} />
      </Box>
      {day && <CaseModal eventId={eventId} day={day} points={data.advent.points} onClose={() => setOpenDay(null)} />}
    </Grid>
  );
};
