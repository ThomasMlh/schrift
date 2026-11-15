import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert, AlertIcon, Badge, Box, Button, Container, Flex, HStack, Progress, Spinner, Text, VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { QuestionInput } from "@/components/quiz/QuestionInput";
import { initialAnswer } from "@/utils/quiz";
import { QuestionMedia } from "@/components/quiz/QuestionMedia";
import { useCurrentEvent, useQuizPlay } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { startDiscordLogin } from "@/utils/discordAuth";
import type { IAttemptState, QuizAnswer } from "@/interfaces";

const Card = ({ children }: { children: React.ReactNode }) => (
  <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" p={{ base: 4, md: 6 }}>{children}</Box>
);

// Seconds left on the question, from the server clock
const useCountdown = (state: IAttemptState | null) => {
  const offset = useRef(0);
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!state?.ends_at) {
      setLeft(null);
      return undefined;
    }
    offset.current = new Date(state.now).getTime() - Date.now();
    const endsAt = new Date(state.ends_at).getTime();
    const tick = () => setLeft(Math.max(0, (endsAt - (Date.now() + offset.current)) / 1000));
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [state?.ends_at, state?.now]);
  return left;
};

const QuizPlayPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { t, i18n } = useTranslation();
  const { isLoggedIn, isAuthLoading } = useAuth();
  const play = useQuizPlay(quizId);
  const { data: event } = useCurrentEvent();
  const quiz = event?.quizzes.find((q) => q._id === quizId);
  const [state, setState] = useState<IAttemptState | null>(null);
  const [notStarted, setNotStarted] = useState(false);
  const [answer, setAnswer] = useState<QuizAnswer>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const left = useCountdown(state);
  const answerRef = useRef(answer);
  useEffect(() => { answerRef.current = answer; }, [answer]);

  const apply = useCallback((next: IAttemptState) => {
    setState(next);
    setNotStarted(false);
    if (next.question) setAnswer(initialAnswer(next.question));
  }, []);

  // Resume an attempt already started, otherwise show the start screen
  useEffect(() => {
    if (!isLoggedIn || !quizId) return;
    play.state().then(apply).catch(() => setNotStarted(true));
  }, [isLoggedIn, quizId, play, apply]);

  const send = useCallback(async () => {
    if (!state?.question || sending) return;
    setSending(true);
    setError(null);
    try {
      apply(await play.answer(state.question.id, answerRef.current));
    } catch (err) {
      setError((err as Error).message);
      // The server knows where the attempt stands
      play.state().then(apply).catch(() => undefined);
    } finally {
      setSending(false);
    }
  }, [state?.question, sending, play, apply]);

  // Time is up: the answer as it stands is sent, once per question
  const autoSent = useRef<string | null>(null);
  useEffect(() => {
    const id = state?.question?.id;
    if (left === 0 && id && autoSent.current !== id && !sending) {
      autoSent.current = id;
      send();
    }
  }, [left, state?.question?.id, sending, send]);

  const start = async () => {
    setError(null);
    try {
      apply(await play.start());
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const endDate = event ? new Date(event.event.end_at).toLocaleDateString(i18n.language.startsWith("en") ? "en-GB" : "fr-FR", { day: "numeric", month: "long" }) : "";

  const body = () => {
    if (isAuthLoading) return <Spinner />;
    if (!isLoggedIn) {
      return (
        <Card>
          <VStack spacing={4}>
            <Text textAlign="center">{t("pages.quiz.loginToPlay")}</Text>
            <Button colorScheme="purple" onClick={startDiscordLogin}>{t("pages.anniversary.login")}</Button>
          </VStack>
        </Card>
      );
    }
    if (notStarted) {
      return (
        <Card>
          <VStack spacing={4} align="stretch">
            <Text fontSize="xl" fontWeight="extrabold">{quiz?.title ?? t("pages.quiz.title")}</Text>
            {quiz && <Text color="text.muted">{t("pages.quiz.intro", { count: quiz.question_count, minutes: Math.ceil(quiz.duration_seconds / 60) })}</Text>}
            <Alert status="warning" borderRadius="lg"><AlertIcon />{t("pages.quiz.noPause")}</Alert>
            <Button colorScheme="purple" size="lg" onClick={start}>{t("pages.quiz.start")}</Button>
          </VStack>
        </Card>
      );
    }
    if (!state) return <Spinner />;
    if (state.status === "finished") {
      return (
        <Card>
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="extrabold">{t("pages.quiz.finishedTitle")}</Text>
            <Text color="text.muted" textAlign="center">{t("pages.quiz.finishedText", { date: endDate })}</Text>
            <Button as={RouterLink} to="/anniversaire" colorScheme="purple" variant="outline">{t("pages.quiz.back")}</Button>
          </VStack>
        </Card>
      );
    }
    const question = state.question!;
    const urgent = left !== null && left <= 5;
    return (
      <Card>
        <VStack align="stretch" spacing={5}>
          <Flex justify="space-between" align="center" gap={3} wrap="wrap">
            <Text fontSize="sm" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide">
              {t("pages.quiz.questionOf", { index: (state.index ?? 0) + 1, total: state.total })} · {t("pages.quiz.points", { count: question.points })}
            </Text>
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}>{t(`pages.quiz.support_${question.support}`)}</Badge>
          </Flex>
          <Box>
            <Flex justify="space-between" mb={1.5} fontWeight="bold" fontSize="sm">
              <Text>{t("pages.quiz.timeLeft")}</Text>
              <Text color={urgent ? "red.400" : undefined} sx={{ fontVariantNumeric: "tabular-nums" }}>{Math.ceil(left ?? question.duration)} s</Text>
            </Flex>
            <Progress
              value={((left ?? question.duration) / question.duration) * 100}
              size="sm"
              borderRadius="full"
              colorScheme={urgent ? "red" : "purple"}
              sx={{ "& > div": { transition: "width 0.2s linear" } }}
            />
          </Box>
          <Text as="h2" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">{question.prompt}</Text>
          <QuestionMedia media={question.media} />
          <QuestionInput key={question.id} question={question} value={answer} onChange={setAnswer} isDisabled={sending} />
          {error && <Alert status="error" borderRadius="lg"><AlertIcon />{error}</Alert>}
          <HStack justify="space-between">
            <Text fontSize="sm" color="text.muted">{t(`pages.quiz.hint_${question.answer_type}`)}</Text>
            <Button colorScheme="purple" onClick={send} isLoading={sending}>{t("pages.quiz.submit")}</Button>
          </HStack>
        </VStack>
      </Card>
    );
  };

  return (
    <>
      <SEOHead title={`${quiz?.title ?? t("pages.quiz.title")} - Schrift BBS`} description={t("pages.anniversary.seoDescription")} noIndex />
      <Container maxW="container.md" py={{ base: 5, md: 8 }}>
        <VStack align="stretch" spacing={4}>
          {state?.status === "in_progress" && (
            <HStack spacing={1} aria-hidden>
              {Array.from({ length: state.total }, (_, i) => (
                <Box key={i} flex={1} h="6px" borderRadius="full" bg={i < (state.index ?? 0) ? "accent" : i === state.index ? "orange.400" : "border.subtle"} />
              ))}
            </HStack>
          )}
          {error && !state && <Alert status="error" borderRadius="lg"><AlertIcon />{error}</Alert>}
          {body()}
        </VStack>
      </Container>
    </>
  );
};

export default QuizPlayPage;
