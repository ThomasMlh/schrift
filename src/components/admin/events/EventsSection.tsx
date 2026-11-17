import { useEffect, useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, Flex, FormControl, FormHelperText, FormLabel, Grid, HStack, IconButton, Input, Modal,
  ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, NumberInputField, Select, Spinner,
  Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, Tooltip, VStack, useToast,
} from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { useAdminEventQuizzes, useAdminEvents, useEventAdminActions, useEventMedia } from "@/hooks/useAPI";
import { ANSWER_LABELS, SUPPORT_LABELS, blankQuestion, newItemId } from "@/utils/quizEditor";
import type { IQuiz, IQuizQuestion, ISiteEvent } from "@/interfaces";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { QuestionForm } from "./QuestionForm";
import { MediaLibrary } from "./MediaLibrary";
import { QuizParticipants } from "./QuizParticipants";
import { AdventEditor } from "./AdventEditor";

const Panel = ({ children, ...props }: React.ComponentProps<typeof Box>) => (
  <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4} {...props}>{children}</Box>
);

// <input type="datetime-local"> works in local time
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const EventModal = ({ event, onClose, onSaved }: { event: Partial<ISiteEvent>; onClose: () => void; onSaved: (e: ISiteEvent) => void }) => {
  const actions = useEventAdminActions();
  const toast = useToast();
  const [form, setForm] = useState({
    ...event,
    kind: event.kind ?? "anniversary",
    start: toLocalInput(event.start_at),
    end: toLocalInput(event.end_at),
    badge: event.badge_name ?? "",
    advent: event.advent ?? { enabled: false, days: 24, points: 10 },
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const saved = await actions.saveEvent({
        _id: form._id, name: form.name, kind: form.kind, description: form.description ?? "",
        start_at: form.start ? new Date(form.start).toISOString() : "",
        end_at: form.end ? new Date(form.end).toISOString() : "",
        badge_name: form.badge.trim() || null,
        advent: form.advent,
      });
      onSaved(saved);
      onClose();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{form._id ? "Modifier l'événement" : "Nouvel événement"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nom</FormLabel>
              <Input value={form.name ?? ""} placeholder="Anniversaire de la guilde" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as ISiteEvent["kind"] })}>
                <option value="anniversary">Anniversaire (page /anniversaire)</option>
                <option value="other">Autre</option>
              </Select>
            </FormControl>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="100%">
              <FormControl isRequired>
                <FormLabel>Début</FormLabel>
                <Input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Fin</FormLabel>
                <Input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                <FormHelperText>Les résultats sont révélés à cette date.</FormHelperText>
              </FormControl>
            </Grid>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Badge des participants</FormLabel>
              <Input value={form.badge} placeholder="Anniversaire 2026" maxLength={60} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              <FormHelperText>
                Édition limitée : gagné en terminant un quiz ou en répondant à une case du calendrier, seulement entre les dates de l'événement. Vide : pas de badge.
              </FormHelperText>
            </FormControl>
            <Box w="100%" borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p={3}>
              <FormControl display="flex" alignItems="center" gap={3}>
                <Switch id="advent-enabled" isChecked={form.advent.enabled} onChange={(e) => setForm({ ...form, advent: { ...form.advent, enabled: e.target.checked } })} />
                <FormLabel htmlFor="advent-enabled" mb={0}>Calendrier de l'Avent</FormLabel>
              </FormControl>
              {form.advent.enabled && (
                <Grid templateColumns="1fr 1fr" gap={3} mt={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">Nombre de cases</FormLabel>
                    <NumberInput size="sm" min={1} max={31} value={form.advent.days} onChange={(_, v) => setForm({ ...form, advent: { ...form.advent, days: Number.isFinite(v) ? v : 24 } })}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Points par case</FormLabel>
                    <NumberInput size="sm" min={1} max={100} value={form.advent.points} onChange={(_, v) => setForm({ ...form, advent: { ...form.advent, points: Number.isFinite(v) ? v : 10 } })}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormHelperText gridColumn="1 / -1" mt={0}>
                    Une case s'ouvre chaque jour à l'heure de début. Le jour même elle rapporte tous ses points, plus tard la moitié.
                  </FormHelperText>
                </Grid>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button colorScheme="purple" onClick={save} isLoading={saving}>Enregistrer</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const QuestionsEditor = ({ quiz }: { quiz: IQuiz }) => {
  const actions = useEventAdminActions();
  const toast = useToast();
  const { data: media = [] } = useEventMedia(quiz.event_id);
  const [questions, setQuestions] = useState<IQuizQuestion[]>(quiz.questions);
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const update = (next: IQuizQuestion[]) => {
    setQuestions(next);
    setDirty(true);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const next = [...questions];
    [next[from], next[to]] = [next[to], next[from]];
    update(next);
    setSelected(to);
  };
  const add = () => {
    update([...questions, blankQuestion()]);
    setSelected(questions.length);
  };
  const duplicate = (index: number) => {
    const copy = { ...structuredClone(questions[index]), id: newItemId() };
    update([...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)]);
    setSelected(index + 1);
  };
  // Removed from the draft only: nothing is lost until the questions are saved
  const remove = (index: number) => {
    update(questions.filter((_, i) => i !== index));
    setSelected(Math.max(0, index - 1));
    setRemoving(null);
  };
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await actions.saveQuiz(quiz._id, { questions });
      setQuestions(saved.questions);
      setDirty(false);
      toast({ status: "success", title: "Questions enregistrées" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const total = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const current = questions[selected];

  return (
    <VStack align="stretch" spacing={3}>
      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
        <Text fontSize="sm" color="text.muted">{questions.length} questions · {total.toLocaleString("fr-FR")} points</Text>
        <HStack>
          {dirty && <Badge colorScheme="orange">Modifications non enregistrées</Badge>}
          <Tooltip label={dirty ? "Enregistre d'abord : le test joue les questions enregistrées" : "Jouer le quiz comme un joueur, sans être classé (même en brouillon)"} hasArrow>
            <Button
              variant="outline"
              leftIcon={<FiPlay />}
              isDisabled={dirty || !questions.length}
              onClick={() => window.open(`/anniversaire/quiz/${quiz._id}/test`, "_blank", "noopener")}
            >
              Tester le quiz
            </Button>
          </Tooltip>
          <Button colorScheme="purple" onClick={save} isLoading={saving} isDisabled={!dirty}>Enregistrer les questions</Button>
        </HStack>
      </Flex>
      {error && <Alert status="error" borderRadius="lg"><AlertIcon />{error}</Alert>}
      <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={4} alignItems="start">
        <Panel p={3}>
          <VStack align="stretch" spacing={1.5}>
            {questions.map((q, index) => (
              <Grid
                key={q.id}
                templateColumns="22px 1fr auto"
                gap={2}
                alignItems="center"
                px={2.5}
                py={2}
                borderRadius="lg"
                borderWidth="1px"
                cursor="pointer"
                borderColor={index === selected ? "accent" : "border.subtle"}
                bg={index === selected ? "purple.50" : "transparent"}
                _dark={{ bg: index === selected ? "whiteAlpha.100" : "transparent" }}
                onClick={() => setSelected(index)}
              >
                <Text fontWeight="extrabold" color="text.muted" fontSize="sm">{index + 1}</Text>
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{q.prompt || "Nouvelle question"}</Text>
                  <Text fontSize="xs" color="text.muted">{SUPPORT_LABELS[q.support]} · {ANSWER_LABELS[q.answer_type]}</Text>
                </Box>
                <Badge>{q.points} pt</Badge>
              </Grid>
            ))}
            <Button size="sm" leftIcon={<AddIcon boxSize={2.5} />} onClick={add} isDisabled={questions.length >= 100}>Ajouter une question</Button>
          </VStack>
        </Panel>
        <Panel>
          {current ? (
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Question {selected + 1}</Text>
                <HStack spacing={1}>
                  <IconButton size="sm" aria-label="Monter" icon={<ChevronUpIcon />} onClick={() => move(selected, selected - 1)} isDisabled={selected === 0} />
                  <IconButton size="sm" aria-label="Descendre" icon={<ChevronDownIcon />} onClick={() => move(selected, selected + 1)} isDisabled={selected === questions.length - 1} />
                  <IconButton size="sm" aria-label="Dupliquer" icon={<CopyIcon />} onClick={() => duplicate(selected)} />
                  <IconButton size="sm" aria-label="Supprimer" icon={<DeleteIcon />} colorScheme="red" variant="ghost" onClick={() => setRemoving(selected)} />
                </HStack>
              </Flex>
              <QuestionForm
                key={current.id}
                question={current}
                media={media}
                onChange={(q) => update(questions.map((x, i) => (i === selected ? q : x)))}
              />
            </VStack>
          ) : (
            <Text color="text.muted">Ajoute une première question.</Text>
          )}
        </Panel>
      </Grid>
      <DeleteConfirmationModal
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing !== null && remove(removing)}
        isDeleting={false}
        title="Supprimer la question"
        description="Elle sera retirée du quiz à l'enregistrement des questions."
        itemDetails={removing !== null ? `${removing + 1}. ${questions[removing]?.prompt || "Nouvelle question"}` : undefined}
      />
    </VStack>
  );
};

const QuizSettings = ({ quiz }: { quiz: IQuiz }) => {
  const actions = useEventAdminActions();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ title: quiz.title, description: quiz.description, bonus: Math.round(quiz.bonus_ratio * 100), shuffle: quiz.shuffle });
  const save = async (changes: Partial<IQuiz>) => {
    try {
      await actions.saveQuiz(quiz._id, changes);
      toast({ status: "success", title: "Quiz enregistré" });
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };
  const remove = async () => {
    setDeleting(true);
    try {
      await actions.deleteQuiz(quiz._id);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
  return (
    <VStack align="stretch" spacing={4} maxW="640px">
      <Panel>
        <Flex justify="space-between" align="center" gap={3} wrap="wrap">
          <Box>
            <Text fontWeight="bold">{quiz.status === "published" ? "Quiz publié" : "Brouillon"}</Text>
            <Text fontSize="sm" color="text.muted">
              {quiz.status === "published" ? "Visible sur la page de l'événement ; jouable entre ses dates." : "Invisible pour les joueurs tant qu'il n'est pas publié."}
            </Text>
          </Box>
          <Button colorScheme={quiz.status === "published" ? "gray" : "green"} onClick={() => save({ status: quiz.status === "published" ? "draft" : "published" })}>
            {quiz.status === "published" ? "Repasser en brouillon" : "Publier"}
          </Button>
        </Flex>
      </Panel>
      <FormControl>
        <FormLabel>Titre</FormLabel>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormControl>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormControl>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <FormControl>
          <FormLabel>Bonus de chrono maximum</FormLabel>
          <NumberInput min={0} max={50} value={form.bonus} onChange={(_, v) => setForm({ ...form, bonus: Number.isFinite(v) ? v : 0 })}>
            <NumberInputField />
          </NumberInput>
          <FormHelperText>En % du total des points ; seulement sur les bonnes réponses.</FormHelperText>
        </FormControl>
        <FormControl display="flex" alignItems="center" gap={3} pt={{ md: 8 }}>
          <Switch isChecked={form.shuffle} onChange={(e) => setForm({ ...form, shuffle: e.target.checked })} colorScheme="purple" id="quiz-shuffle" />
          <FormLabel htmlFor="quiz-shuffle" m={0}>Mélanger l'ordre des questions pour chaque joueur</FormLabel>
        </FormControl>
      </Grid>
      <HStack justify="space-between">
        <Button variant="ghost" colorScheme="red" onClick={() => setConfirmDelete(true)}>Supprimer le quiz</Button>
        <Button colorScheme="purple" onClick={() => save({ title: form.title, description: form.description, bonus_ratio: form.bonus / 100, shuffle: form.shuffle })}>
          Enregistrer
        </Button>
      </HStack>
      <DeleteConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        isDeleting={deleting}
        title="Supprimer le quiz"
        description="Le quiz et ses questions seront supprimés. Impossible si des joueurs ont déjà participé."
        itemDetails={`${quiz.title} · ${quiz.questions.length} questions`}
      />
    </VStack>
  );
};

// Admin tab: events (anniversary…), their quizzes, media library and participants
export const EventsSection = () => {
  const { data: events = [], isLoading } = useAdminEvents();
  const actions = useEventAdminActions();
  const toast = useToast();
  const [eventId, setEventId] = useState<string>("");
  const [editing, setEditing] = useState<Partial<ISiteEvent> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const event = events.find((e) => e._id === eventId);
  const { data: quizzes = [] } = useAdminEventQuizzes(event?._id);
  const [quizId, setQuizId] = useState<string>("");
  const quiz = quizzes.find((q) => q._id === quizId) ?? quizzes[0];

  useEffect(() => {
    if (!eventId && events.length) setEventId(events[0]._id);
  }, [eventId, events]);

  const createQuiz = async () => {
    if (!event) return;
    try {
      const created = await actions.createQuiz(event._id, "Le grand quiz");
      setQuizId(created._id);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };
  const deleteEvent = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      await actions.deleteEvent(event._id);
      setEventId("");
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (isLoading) return <Spinner />;
  return (
    <VStack align="stretch" spacing={4}>
      <Panel>
        <Flex gap={3} align="flex-end" wrap="wrap">
          <FormControl maxW="360px">
            <FormLabel>Événement</FormLabel>
            <Select value={eventId} placeholder={events.length ? undefined : "Aucun événement"} onChange={(e) => setEventId(e.target.value)}>
              {events.map((e) => <option key={e._id} value={e._id}>{e.name} · {new Date(e.start_at).toLocaleDateString("fr-FR")}</option>)}
            </Select>
          </FormControl>
          {event && <Button variant="outline" onClick={() => setEditing(event)}>Modifier</Button>}
          {event && <Button variant="ghost" colorScheme="red" onClick={() => setConfirmDelete(true)}>Supprimer</Button>}
          <Button colorScheme="purple" leftIcon={<AddIcon boxSize={2.5} />} onClick={() => setEditing({})}>Nouvel événement</Button>
          {event?.kind === "anniversary" && <Button as={RouterLink} to="/anniversaire" variant="link" colorScheme="purple">Voir la page</Button>}
        </Flex>
        {event && (
          <Text fontSize="sm" color="text.muted" mt={3}>
            Du {new Date(event.start_at).toLocaleString("fr-FR")} au {new Date(event.end_at).toLocaleString("fr-FR")}
          </Text>
        )}
      </Panel>

      {event?.advent?.enabled && (
        <Panel>
          <Text fontWeight="extrabold" fontSize="lg" mb={3}>Calendrier de l'Avent</Text>
          <AdventEditor key={event._id} event={event} />
        </Panel>
      )}

      {event && (quizzes.length === 0 ? (
        <Panel>
          <Flex justify="space-between" align="center" gap={3}>
            <Text color="text.muted">Aucune activité pour cet événement.</Text>
            <Button colorScheme="purple" onClick={createQuiz}>Créer un quiz</Button>
          </Flex>
        </Panel>
      ) : quiz && (
        <Box>
          {quizzes.length > 1 && (
            <Select maxW="360px" mb={3} value={quiz._id} onChange={(e) => setQuizId(e.target.value)}>
              {quizzes.map((q) => <option key={q._id} value={q._id}>{q.title}</option>)}
            </Select>
          )}
          <Flex justify="space-between" align="center" mb={2} gap={3} wrap="wrap">
            <HStack>
              <Text fontWeight="extrabold" fontSize="lg">{quiz.title}</Text>
              <Badge colorScheme={quiz.status === "published" ? "green" : "orange"}>{quiz.status === "published" ? "Publié" : "Brouillon"}</Badge>
            </HStack>
            <Button size="sm" variant="ghost" leftIcon={<AddIcon boxSize={2.5} />} onClick={createQuiz}>Autre quiz</Button>
          </Flex>
          <Tabs colorScheme="purple" isLazy>
            <TabList overflowX="auto" overflowY="hidden">
              <Tab>Questions ({quiz.questions.length})</Tab>
              <Tab>Médiathèque</Tab>
              <Tab>Participants</Tab>
              <Tab>Réglages</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}><QuestionsEditor key={quiz._id} quiz={quiz} /></TabPanel>
              <TabPanel px={0}><MediaLibrary eventId={event._id} quizzes={quizzes} /></TabPanel>
              <TabPanel px={0}><QuizParticipants quizId={quiz._id} /></TabPanel>
              <TabPanel px={0}><QuizSettings key={`${quiz._id}-${quiz.status}`} quiz={quiz} /></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      ))}

      <DeleteConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteEvent}
        isDeleting={deleting}
        title="Supprimer l'événement"
        description="L'événement et ses quiz seront supprimés. Impossible si des joueurs ont participé ou si la médiathèque n'est pas vide."
        itemDetails={event?.name}
      />
      {editing && <EventModal event={editing} onClose={() => setEditing(null)} onSaved={(saved) => setEventId(saved._id)} />}
    </VStack>
  );
};
