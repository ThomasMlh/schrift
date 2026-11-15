import { Box, Button, Flex, Grid, HStack, IconButton, Input, Select, Text, VStack } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import type { IPlayerQuestion, QuizAnswer } from "@/interfaces";

interface QuestionInputProps {
  question: IPlayerQuestion;
  value: QuizAnswer;
  onChange: (value: QuizAnswer) => void;
  isDisabled?: boolean;
}

const ChoiceButton = ({ selected, multi, children, onClick, isDisabled }: {
  selected: boolean; multi: boolean; children: React.ReactNode; onClick: () => void; isDisabled?: boolean;
}) => (
  <Button
    variant="outline"
    justifyContent="flex-start"
    h="auto"
    minH="48px"
    py={3}
    px={4}
    whiteSpace="normal"
    textAlign="left"
    borderWidth="1.5px"
    borderRadius="xl"
    borderColor={selected ? "accent" : "border.subtle"}
    bg={selected ? "purple.50" : "bg.card"}
    _dark={{ bg: selected ? "whiteAlpha.100" : "bg.card" }}
    onClick={onClick}
    isDisabled={isDisabled}
    aria-pressed={selected}
    leftIcon={(
      <Box
        as="span"
        w="20px"
        h="20px"
        flexShrink={0}
        borderRadius={multi ? "md" : "full"}
        borderWidth="2px"
        borderColor={selected ? "accent" : "border.strong"}
        bg={selected ? "accent" : "transparent"}
        color="white"
        fontSize="xs"
        display="grid"
        placeItems="center"
      >
        {selected && multi ? "✓" : ""}
      </Box>
    )}
  >
    {children}
  </Button>
);

const BLANK = /\[(\d+)\]/g;

export const QuestionInput = ({ question, value, onChange, isDisabled }: QuestionInputProps) => {
  const { t } = useTranslation();

  switch (question.answer_type) {
    case "multiple":
    case "single": {
      const multi = question.answer_type === "multiple";
      const picked = multi ? (value as string[] | null) ?? [] : [value as string | null];
      return (
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={2}>
          {(question.options ?? []).map((option) => {
            const selected = picked.includes(option.id);
            return (
              <ChoiceButton
                key={option.id}
                multi={multi}
                selected={selected}
                isDisabled={isDisabled}
                onClick={() => onChange(multi
                  ? (selected ? picked.filter((id) => id !== option.id) : [...picked, option.id]) as string[]
                  : option.id)}
              >
                {option.text}
              </ChoiceButton>
            );
          })}
        </Grid>
      );
    }
    case "true_false":
      return (
        <Grid templateColumns="1fr 1fr" gap={2}>
          {[true, false].map((choice) => (
            <ChoiceButton key={String(choice)} multi={false} selected={value === choice} isDisabled={isDisabled} onClick={() => onChange(choice)}>
              {t(choice ? "pages.quiz.true" : "pages.quiz.false")}
            </ChoiceButton>
          ))}
        </Grid>
      );
    case "match": {
      const pairs = (value as Record<string, string> | null) ?? {};
      return (
        <VStack align="stretch" spacing={2}>
          {(question.lefts ?? []).map((left) => (
            <Grid key={left.id} templateColumns={{ base: "1fr", sm: "1fr 24px 1fr" }} gap={2} alignItems="center">
              <Box px={3} py={2.5} borderRadius="lg" bg="bg.subtle" fontWeight="semibold">{left.text}</Box>
              <Text display={{ base: "none", sm: "block" }} color="text.muted" textAlign="center" aria-hidden>→</Text>
              <Select
                aria-label={left.text}
                placeholder={t("pages.quiz.choose")}
                value={pairs[left.id] ?? ""}
                isDisabled={isDisabled}
                onChange={(e) => onChange({ ...pairs, [left.id]: e.target.value })}
              >
                {(question.rights ?? []).map((right) => <option key={right.id} value={right.id}>{right.text}</option>)}
              </Select>
            </Grid>
          ))}
        </VStack>
      );
    }
    case "order": {
      const order = (value as string[] | null) ?? [];
      const byId = new Map((question.items ?? []).map((item) => [item.id, item]));
      const move = (from: number, to: number) => {
        if (to < 0 || to >= order.length) return;
        const next = [...order];
        [next[from], next[to]] = [next[to], next[from]];
        onChange(next);
      };
      return (
        <VStack align="stretch" spacing={1.5}>
          {order.map((id, index) => (
            <Grid key={id} templateColumns="28px 1fr auto" alignItems="center" gap={2} px={3} py={2} borderRadius="lg" borderWidth="1.5px" borderColor="border.subtle" bg="bg.card">
              <Text fontWeight="extrabold" color="accent">{index + 1}</Text>
              <Text fontWeight="semibold">{byId.get(id)?.text}</Text>
              <HStack spacing={1}>
                <IconButton size="sm" aria-label={t("pages.quiz.moveUp")} icon={<ChevronUpIcon />} isDisabled={isDisabled || index === 0} onClick={() => move(index, index - 1)} />
                <IconButton size="sm" aria-label={t("pages.quiz.moveDown")} icon={<ChevronDownIcon />} isDisabled={isDisabled || index === order.length - 1} onClick={() => move(index, index + 1)} />
              </HStack>
            </Grid>
          ))}
        </VStack>
      );
    }
    case "free_text":
      return (
        <Input
          size="lg"
          autoFocus
          autoComplete="off"
          placeholder={t("pages.quiz.freeTextPlaceholder")}
          value={(value as string | null) ?? ""}
          isDisabled={isDisabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "blanks": {
      const answers = (value as string[] | null) ?? [];
      const parts = (question.blank_text ?? "").split(BLANK);
      return (
        <Flex wrap="wrap" align="center" gap={2} fontSize="lg" lineHeight="tall">
          {parts.map((part, index) => {
            if (index % 2 === 0) return part ? <Text as="span" key={index}>{part}</Text> : null;
            const blank = Number(part) - 1;
            return (
              <Input
                key={index}
                w="160px"
                size="sm"
                autoComplete="off"
                aria-label={t("pages.quiz.blank", { index: blank + 1 })}
                value={answers[blank] ?? ""}
                isDisabled={isDisabled}
                onChange={(e) => {
                  const next = [...answers];
                  next[blank] = e.target.value;
                  onChange(next);
                }}
              />
            );
          })}
        </Flex>
      );
    }
    default:
      return null;
  }
};
