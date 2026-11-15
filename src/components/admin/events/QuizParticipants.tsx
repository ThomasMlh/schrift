import { useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, ButtonGroup, Flex, Grid, HStack, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, useToast,
} from "@chakra-ui/react";
import { useAttemptDetail, useEventAdminActions, useQuizAttempts } from "@/hooks/useAPI";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { ANSWER_LABELS } from "@/utils/quizEditor";
import { readableAnswer } from "@/utils/quiz";
import type { IQuizAttemptDetail } from "@/interfaces";

type Filter = "all" | "guild" | "free" | "pending";
const FILTERS: [Filter, string][] = [["all", "Tous"], ["guild", "En guilde"], ["free", "Hors guilde"], ["pending", "À vérifier"]];

const format = (value: number) => value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const formatDate = (value: string) => new Date(value).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const formatDuration = (ms: number | null) => (ms === null ? "—" : `${Math.floor(ms / 60000)} min ${String(Math.round((ms % 60000) / 1000)).padStart(2, "0")}`);

const AttemptModal = ({ attemptId, onClose }: { attemptId: string; onClose: () => void }) => {
  const { data, isLoading } = useAttemptDetail(attemptId);
  const actions = useEventAdminActions();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const review = async (detail: IQuizAttemptDetail["answers"][number], key: string, accept: boolean) => {
    try {
      await actions.review(attemptId, detail.question_id, key, accept);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };
  const reset = async () => {
    setResetting(true);
    try {
      await actions.deleteAttempt(attemptId);
      onClose();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {data?.name ?? "Participation"}
          {data && <Text fontSize="sm" fontWeight="normal" color="text.muted">{data.guild_name ?? "Hors guilde"} · {format(data.score.points)} pts + {format(data.score.bonus)} bonus = {format(data.score.total)}</Text>}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading || !data ? <Spinner /> : (
            <VStack align="stretch" spacing={2}>
              {data.answers.map((detail, index) => (
                <Box key={detail.question_id} p={3} borderRadius="lg" bg="bg.subtle">
                  <Flex justify="space-between" gap={3}>
                    <Text fontWeight="semibold" fontSize="sm">{index + 1}. {detail.question?.prompt ?? "Question supprimée"}</Text>
                    <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap">{format(detail.points)} / {format(detail.max)}</Text>
                  </Flex>
                  <Text fontSize="xs" color="text.muted">{detail.question ? ANSWER_LABELS[detail.question.answer_type] : ""} · {detail.missed ? "temps écoulé" : `${Math.round(detail.remaining_ms / 1000)} s restantes`}</Text>
                  <Text fontSize="sm" mt={1}>Réponse : {readableAnswer(detail.question, detail.answer)}</Text>
                  {detail.pending.map((key) => (
                    <HStack key={key} mt={2} spacing={2}>
                      <Badge colorScheme="orange">À vérifier{key !== "text" ? ` · trou [${Number(key) + 1}]` : ""}</Badge>
                      <Button size="xs" colorScheme="green" onClick={() => review(detail, key, true)}>Accepter</Button>
                      <Button size="xs" variant="outline" onClick={() => review(detail, key, false)}>Refuser</Button>
                    </HStack>
                  ))}
                  {detail.accepted.length > 0 && <Badge mt={2} colorScheme="green">Accepté à la main</Badge>}
                </Box>
              ))}
              <Button alignSelf="flex-start" size="sm" colorScheme="red" variant="ghost" mt={2} onClick={() => setConfirmReset(true)}>Effacer la participation</Button>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
      <DeleteConfirmationModal
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={reset}
        isDeleting={resetting}
        title="Effacer la participation"
        description="Le joueur pourra refaire le quiz depuis le début."
        itemDetails={data?.name}
      />
    </Modal>
  );
};

// Who took the quiz, with their score and the free text answers left to check
export const QuizParticipants = ({ quizId }: { quizId: string }) => {
  const { data: rows = [], isLoading } = useQuizAttempts(quizId);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const counts: Record<Filter, number> = {
    all: rows.length,
    guild: rows.filter((r) => r.in_guild).length,
    free: rows.filter((r) => !r.in_guild).length,
    pending: rows.filter((r) => r.pending > 0).length,
  };
  const shown = rows.filter((r) => filter === "all" || (filter === "guild" ? r.in_guild : filter === "free" ? !r.in_guild : r.pending > 0));

  if (isLoading) return <Spinner />;
  return (
    <VStack align="stretch" spacing={3}>
      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
        <Text fontWeight="bold">{rows.length} participant{rows.length > 1 ? "s" : ""} · {rows.filter((r) => r.status === "in_progress").length} en cours</Text>
        <ButtonGroup size="sm" isAttached variant="outline">
          {FILTERS.map(([key, label]) => (
            <Button key={key} colorScheme={filter === key ? "purple" : "gray"} variant={filter === key ? "solid" : "outline"} onClick={() => setFilter(key)}>
              {label} ({counts[key]})
            </Button>
          ))}
        </ButtonGroup>
      </Flex>
      {shown.length === 0 ? <Alert status="info" borderRadius="lg"><AlertIcon />Personne pour l'instant.</Alert> : (
        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr><Th>Joueur</Th><Th>Guilde au moment du jeu</Th><Th>Commencé</Th><Th isNumeric>Durée</Th><Th isNumeric>Score</Th><Th /></Tr>
            </Thead>
            <Tbody>
              {shown.map((row) => (
                <Tr key={row.attempt_id}>
                  <Td fontWeight="semibold">{row.name}</Td>
                  <Td>{row.guild_name ? <Badge textTransform="none">{row.guild_name}</Badge> : <Text color="text.muted">Hors guilde</Text>}</Td>
                  <Td>{formatDate(row.started_at)}</Td>
                  <Td isNumeric>{row.status === "finished" ? formatDuration(row.duration_ms) : `en cours (Q${row.progress + 1})`}</Td>
                  <Td isNumeric fontWeight="bold">{format(row.total)}</Td>
                  <Td>
                    <Grid autoFlow="column" gap={2} justifyContent="end" alignItems="center">
                      {row.pending > 0 && <Badge colorScheme="orange">{row.pending} à vérifier</Badge>}
                      {row.idle && <Badge>abandonné ?</Badge>}
                      <Button size="xs" variant="outline" onClick={() => setOpen(row.attempt_id)}>Détail</Button>
                    </Grid>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      {open && <AttemptModal attemptId={open} onClose={() => setOpen(null)} />}
    </VStack>
  );
};
