import type { IPlayerQuestion, QuizAnswer } from "@/interfaces";

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
