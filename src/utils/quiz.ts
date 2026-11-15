import type { IPlayerQuestion, IQuizQuestion, QuizAnswer } from "@/interfaces";

// The answer a question starts with: an ordering starts in the order it was handed out
export const initialAnswer = (question: IPlayerQuestion): QuizAnswer => {
  switch (question.answer_type) {
    case "multiple": return [];
    case "order": return (question.items ?? []).map((item) => item.id);
    case "match": return {};
    case "blanks": return Array.from({ length: question.blank_count ?? 0 }, () => "");
    default: return null;
  }
};

// A player's answer in words, from the stored ids
export const readableAnswer = (question: IQuizQuestion | null, answer: QuizAnswer): string => {
  if (answer === null || answer === undefined) return "—";
  if (!question) return JSON.stringify(answer);
  const optionText = (id: string) => question.options?.find((o) => o.id === id)?.text ?? id;
  switch (question.answer_type) {
    case "multiple": return (answer as string[]).map(optionText).join(" · ") || "—";
    case "single": return optionText(answer as string);
    case "true_false": return answer ? "Vrai" : "Faux";
    case "match": return (question.pairs ?? []).map((p) => `${p.left} → ${question.pairs?.find((x) => x.id === (answer as Record<string, string>)[p.id])?.right ?? "—"}`).join(" · ");
    case "order": return (answer as string[]).map((id) => question.items?.find((i) => i.id === id)?.text ?? id).join(" > ");
    case "blanks": return (answer as string[]).map((a, i) => `[${i + 1}] ${a || "—"}`).join(" · ");
    default: return String(answer);
  }
};

// The expected answer in words
export const readableCorrect = (question: IQuizQuestion): string => {
  const optionText = (id?: string) => question.options?.find((o) => o.id === id)?.text ?? "—";
  switch (question.answer_type) {
    case "multiple": return (question.correct_ids ?? []).map(optionText).join(" · ");
    case "single": return optionText(question.correct_id);
    case "true_false": return question.correct_bool ? "Vrai" : "Faux";
    case "match": return (question.pairs ?? []).map((p) => `${p.left} → ${p.right}`).join(" · ");
    case "order": return (question.items ?? []).map((i) => i.text).join(" > ");
    case "free_text": return (question.accepted ?? []).join(" / ");
    case "blanks": return (question.blanks ?? []).map((b, i) => `[${i + 1}] ${b.accepted.join(" / ")}`).join(" · ");
    default: return "—";
  }
};
