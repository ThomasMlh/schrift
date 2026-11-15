import { useEffect, useState } from "react";
import { Alert, AlertIcon, Badge, Box, Flex, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import { ANSWER_LABELS } from "@/utils/quizEditor";
import { readableAnswer, readableCorrect } from "@/utils/quiz";
import type { IQuizAttemptDetail } from "@/interfaces";

const format = (value: number) => value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

// Score and answer key of an admin rehearsal, question by question
export const TestCorrection = ({ load }: { load: () => Promise<IQuizAttemptDetail> }) => {
  const [data, setData] = useState<IQuizAttemptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    load().then(setData).catch((err: Error) => setError(err.message));
  }, [load]);

  if (error) return <Alert status="error" borderRadius="lg"><AlertIcon />{error}</Alert>;
  if (!data) return <Spinner />;
  const { score } = data;
  return (
    <VStack align="stretch" spacing={3}>
      <SimpleGrid columns={3} spacing={3}>
        {[
          [`${format(score.points)} / ${format(score.max_points)}`, "Points"],
          [`${format(score.bonus)} / ${format(score.max_bonus)}`, "Bonus de temps"],
          [format(score.total), "Total"],
        ].map(([value, label]) => (
          <Box key={label} bg="bg.subtle" borderRadius="lg" px={3} py={2}>
            <Text fontSize="xl" fontWeight="extrabold" sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
            <Text fontSize="xs" color="text.muted">{label}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {data.answers.map((detail, index) => {
        const full = detail.points >= detail.max && detail.max > 0;
        return (
          <Box key={detail.question_id} p={3} borderRadius="lg" borderWidth="1px" borderColor={full ? "green.400" : detail.points > 0 ? "orange.300" : "red.300"}>
            <Flex justify="space-between" gap={3}>
              <Text fontWeight="semibold" fontSize="sm">{index + 1}. {detail.question?.prompt ?? "Question supprimée"}</Text>
              <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap">
                {format(detail.points)} / {format(detail.max)}{detail.bonus > 0 ? ` + ${format(detail.bonus)}` : ""}
              </Text>
            </Flex>
            <Text fontSize="xs" color="text.muted">
              {detail.question ? ANSWER_LABELS[detail.question.answer_type] : ""} · {detail.missed ? "temps écoulé" : `${Math.round(detail.remaining_ms / 1000)} s restantes`}
            </Text>
            <Text fontSize="sm" mt={1}>Ta réponse : {readableAnswer(detail.question, detail.answer)}</Text>
            {detail.question && <Text fontSize="sm" color="green.500">Attendu : {readableCorrect(detail.question)}</Text>}
            {detail.pending.length > 0 && <Badge mt={2} colorScheme="orange">Proche : un admin devrait valider à la main</Badge>}
          </Box>
        );
      })}
    </VStack>
  );
};
