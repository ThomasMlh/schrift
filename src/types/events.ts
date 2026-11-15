// Events (anniversary…) and their quizzes

export type EventKind = "anniversary" | "other";
export type EventState = "upcoming" | "open" | "over";
export type QuestionSupport = "text" | "image" | "video" | "audio";
export type AnswerType = "multiple" | "single" | "true_false" | "match" | "order" | "free_text" | "blanks";
export type MediaKind = "image" | "audio" | "video";

export interface ISiteEvent {
  _id: string;
  name: string;
  kind: EventKind;
  description: string;
  start_at: string;
  end_at: string;
}

export interface IQuizSummary {
  _id: string;
  event_id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  question_count: number;
  total_points: number;
  duration_seconds: number;
  bonus_ratio: number;
  shuffle: boolean;
  my_attempt?: "in_progress" | "finished" | null;
}

export interface IPublicEvent {
  event: ISiteEvent;
  state: EventState;
  quizzes: IQuizSummary[];
}

export interface IChoice {
  id: string;
  text: string;
}

// A question as the editor stores it, with its correct answers
export interface IQuizQuestion {
  id: string;
  support: QuestionSupport;
  answer_type: AnswerType;
  prompt: string;
  media_id: string | null;
  points: number;
  options?: IChoice[];
  correct_ids?: string[];
  correct_id?: string;
  correct_bool?: boolean;
  pairs?: { id: string; left: string; right: string }[];
  items?: IChoice[];
  accepted?: string[];
  blank_text?: string;
  blanks?: { accepted: string[] }[];
}

export interface IQuiz extends Omit<IQuizSummary, "question_count" | "total_points" | "duration_seconds" | "my_attempt"> {
  questions: IQuizQuestion[];
}

// A question as the player receives it: never its answers
export interface IPlayerQuestion {
  id: string;
  support: QuestionSupport;
  answer_type: AnswerType;
  prompt: string;
  points: number;
  duration: number;
  options?: IChoice[];
  lefts?: IChoice[];
  rights?: IChoice[];
  items?: IChoice[];
  blank_text?: string;
  blank_count?: number;
  media: { path: string; kind: MediaKind } | null;
}

export type QuizAnswer = string | string[] | boolean | Record<string, string> | null;

export interface IAttemptState {
  attempt_id: string;
  status: "in_progress" | "finished";
  total: number;
  answered: number;
  now: string;
  index?: number;
  question?: IPlayerQuestion;
  served_at?: string;
  ends_at?: string;
  ignored?: boolean;
}

export interface IQuizRankRow {
  attempt_id: string;
  user_id: string;
  name: string;
  guild_name: string | null;
  in_guild: boolean;
  points: number;
  bonus: number;
  total: number;
  duration_ms: number | null;
  rank: number;
}

export interface IQuizResults {
  quiz: IQuizSummary;
  rankings: { all: IQuizRankRow[]; guild: IQuizRankRow[]; free: IQuizRankRow[] };
  mine: {
    points: number;
    bonus: number;
    total: number;
    max_points: number;
    max_bonus: number;
    details: {
      question_id: string;
      prompt: string;
      points: number;
      max: number;
      bonus: number;
      missed: boolean;
      correct: (string | boolean)[];
    }[];
  } | null;
}

export interface IQuizMedia {
  _id: string;
  event_id: string;
  kind: MediaKind;
  name: string;
  path: string;
  size: number;
  status: "uploading" | "ready";
  received?: number;
  width?: number | null;
  height?: number | null;
  created_at: string;
}

export interface IQuizAttemptRow extends Omit<IQuizRankRow, "rank"> {
  started_at: string;
  finished_at: string | null;
  status: "in_progress" | "finished";
  progress: number;
  pending: number;
  idle: boolean;
}

export interface IQuizAttemptDetail extends IQuizAttemptRow {
  score: { points: number; bonus: number; total: number; max_points: number; max_bonus: number };
  answers: {
    question_id: string;
    answer: QuizAnswer;
    missed: boolean;
    remaining_ms: number;
    points: number;
    max: number;
    bonus: number;
    pending: string[];
    accepted: string[];
    question: IQuizQuestion | null;
  }[];
}
