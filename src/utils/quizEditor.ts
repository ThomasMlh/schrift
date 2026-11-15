import type { AnswerType, IQuizQuestion, MediaKind, QuestionSupport } from "@/interfaces";

export const SUPPORT_SECONDS: Record<QuestionSupport, number> = { text: 30, image: 45, video: 60, audio: 60 };
export const SUPPORT_LABELS: Record<QuestionSupport, string> = { text: "Texte", image: "Image", video: "Vidéo", audio: "Audio" };
export const ANSWER_LABELS: Record<AnswerType, string> = {
  multiple: "Choix multiples (6 max)",
  single: "Choix unique (4 max)",
  true_false: "Vrai ou faux",
  match: "Relier",
  order: "Classer",
  free_text: "Texte libre",
  blanks: "Texte à trous",
};
export const SUPPORT_MEDIA: Record<QuestionSupport, MediaKind | null> = { text: null, image: "image", video: "video", audio: "audio" };

const id = () => Math.random().toString(36).slice(2, 12);

// A new question of a type, filled with empty fields the editor can show
export const blankQuestion = (answerType: AnswerType = "single", support: QuestionSupport = "text"): IQuizQuestion => {
  const base: IQuizQuestion = { id: id(), support, answer_type: answerType, prompt: "", media_id: null, points: 1 };
  switch (answerType) {
    case "multiple": return { ...base, points: 2, options: [1, 2, 3, 4].map(() => ({ id: id(), text: "" })), correct_ids: [] };
    case "single": return { ...base, options: [1, 2, 3, 4].map(() => ({ id: id(), text: "" })), correct_id: undefined };
    case "true_false": return { ...base, points: 0.5, correct_bool: undefined };
    case "match": return { ...base, points: 2, pairs: [1, 2, 3].map(() => ({ id: id(), left: "", right: "" })) };
    case "order": return { ...base, points: 2, items: [1, 2, 3, 4].map(() => ({ id: id(), text: "" })) };
    case "free_text": return { ...base, points: 2, accepted: [""] };
    case "blanks": return { ...base, points: 2, blank_text: "", blanks: [] };
    default: return base;
  }
};

// Changes the answer type, keeping what both types share
export const changeAnswerType = (question: IQuizQuestion, answerType: AnswerType): IQuizQuestion => ({
  ...blankQuestion(answerType, question.support),
  id: question.id,
  prompt: question.prompt,
  media_id: question.media_id,
  points: question.points,
});

export const newItemId = id;

// Number of [n] markers in a blanks text
export const countBlanks = (text: string) => (text.match(/\[\d+\]/g) ?? []).length;
