import { Link as RouterLink } from "react-router-dom";
import {
  Alert, AlertIcon, Badge, Box, Button, Container, Flex, Grid, HStack, SimpleGrid, Skeleton, Text, VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useCurrentEvent } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { startDiscordLogin } from "@/utils/discordAuth";
import type { IQuizSummary } from "@/interfaces";

const Card = ({ children, ...props }: React.ComponentProps<typeof Box>) => (
  <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" p={{ base: 4, md: 6 }} {...props}>{children}</Box>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted">{children}</Text>
);

const RULES = ["timer", "multiple", "match", "freeText", "bonus", "noPause", "rankings"] as const;

const QuizCard = ({ quiz, state }: { quiz: IQuizSummary; state: "upcoming" | "open" | "over" }) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const action = () => {
    if (state === "upcoming") return <Badge colorScheme="gray" borderRadius="full" px={3} py={1}>{t("pages.anniversary.soon")}</Badge>;
    if (quiz.my_attempt === "finished") return <Badge colorScheme="green" borderRadius="full" px={3} py={1}>✓ {t("pages.anniversary.done")}</Badge>;
    if (state === "over") return null;
    if (!isLoggedIn) return <Button colorScheme="purple" variant="outline" onClick={startDiscordLogin}>{t("pages.anniversary.login")}</Button>;
    return (
      <Button as={RouterLink} to={`/anniversaire/quiz/${quiz._id}`} colorScheme="purple">
        {t(quiz.my_attempt === "in_progress" ? "pages.anniversary.resume" : "pages.anniversary.play")}
      </Button>
    );
  };
  return (
    <VStack align="stretch" spacing={4}>
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Box>
          <Eyebrow>{t("pages.anniversary.activity")}</Eyebrow>
          <Text fontSize="xl" fontWeight="extrabold">{quiz.title}</Text>
          {quiz.description && <Text color="text.muted" mt={1}>{quiz.description}</Text>}
        </Box>
        {action()}
      </Flex>
      <SimpleGrid columns={3} spacing={3}>
        {[
          [quiz.question_count, t("pages.anniversary.questions", { count: quiz.question_count })],
          [`≈ ${Math.ceil(quiz.duration_seconds / 60)} min`, t("pages.anniversary.noBreak")],
          [1, t("pages.anniversary.oneTry")],
        ].map(([value, label]) => (
          <Box key={String(label)} bg="bg.subtle" borderRadius="lg" px={3} py={2}>
            <Text fontSize="xl" fontWeight="extrabold" sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
            <Text fontSize="xs" color="text.muted">{label}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {state === "over" && quiz.my_attempt !== "finished" && <Text fontSize="sm" color="text.muted">{t("pages.anniversary.closed")}</Text>}
    </VStack>
  );
};

const AnniversaryPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { data, isLoading, error } = useCurrentEvent();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const formatDate = (value: string) => new Date(value).toLocaleString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <SEOHead title={`${data?.event.name ?? t("pages.anniversary.title")} - Schrift BBS`} description={t("pages.anniversary.seoDescription")} url="https://bbs-schrift.fr/anniversaire" />
      <Container maxW="container.lg" py={{ base: 5, md: 8 }}>
        {isLoading ? <Skeleton h="320px" borderRadius="2xl" /> : error || !data ? (
          <Alert status="info" borderRadius="xl"><AlertIcon />{t("pages.anniversary.none")}</Alert>
        ) : (
          <VStack align="stretch" spacing={5}>
            <Box borderRadius="2xl" px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }} color="white" bgGradient="linear(to-br, #2a1d5c, #4F46E5 60%, #7C3AED)" position="relative" overflow="hidden">
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="purple.100">{t("pages.anniversary.eyebrow")}</Text>
              <Text as="h1" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="extrabold" lineHeight="shorter" mt={1}>{data.event.name}</Text>
              {data.event.description && <Text mt={2} color="purple.50" maxW="60ch" whiteSpace="pre-line">{data.event.description}</Text>}
              <HStack spacing={2} mt={4} flexWrap="wrap">
                {[
                  t("pages.anniversary.from", { date: formatDate(data.event.start_at) }),
                  t("pages.anniversary.to", { date: formatDate(data.event.end_at) }),
                  t(`pages.anniversary.state_${data.state}`),
                ].map((label) => (
                  <Box key={label} bg="whiteAlpha.200" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="full" px={3} py={1} fontSize="sm" fontWeight="semibold">{label}</Box>
                ))}
              </HStack>
            </Box>

            {data.quizzes.length === 0 ? (
              <Card><Text color="text.muted">{t("pages.anniversary.noActivity")}</Text></Card>
            ) : data.quizzes.map((quiz) => (
              <Grid key={quiz._id} templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }} gap={5} alignItems="start">
                <Card>
                  <VStack align="stretch" spacing={6}>
                    <QuizCard quiz={quiz} state={data.state} />
                    {data.state === "over" && (
                      <Box>
                        <Eyebrow>{t("pages.anniversary.results")}</Eyebrow>
                        <Box mt={3}><QuizResults quizId={quiz._id} myUserId={currentUser?._id} /></Box>
                      </Box>
                    )}
                    {data.state !== "over" && quiz.my_attempt === "finished" && (
                      <Text fontSize="sm" color="text.muted">{t("pages.anniversary.revealOn", { date: formatDate(data.event.end_at) })}</Text>
                    )}
                  </VStack>
                </Card>
                <Card>
                  <Eyebrow>{t("pages.anniversary.rules")}</Eyebrow>
                  <VStack as="ul" align="stretch" spacing={3} mt={3} listStyleType="none">
                    {RULES.map((rule) => (
                      <Box as="li" key={rule} fontSize="sm">
                        <Text fontWeight="bold">{t(`pages.anniversary.rule_${rule}`)}</Text>
                        <Text color="text.muted">{t(`pages.anniversary.rule_${rule}_text`, { percent: Math.round(quiz.bonus_ratio * 100) })}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Card>
              </Grid>
            ))}
          </VStack>
        )}
      </Container>
    </>
  );
};

export default AnniversaryPage;
