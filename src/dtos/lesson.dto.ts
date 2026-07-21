export interface LessonDetailData {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  videoUrl?: string;
  transcriptUrl?: string;
  contents: any[];
  resources: any[];
  progressPercent: number;
  lastPositionSeconds: number;
  assignmentId?: string | null;
}

export interface LessonProgressInput {
  progressPercent?: number;
  lastPositionSeconds?: number;
  minutesSpent?: number;
}

export interface LessonNoteData {
  id: string;
  content: string;
  timestampSeconds?: number | null;
  createdAt: Date;
}

export interface LessonNoteInput {
  content: string;
  timestampSeconds?: number;
}

export interface LessonBookmarkData {
  id: string;
  note?: string | null;
  timestampSeconds?: number | null;
  createdAt: Date;
}

export interface LessonBookmarkInput {
  note?: string;
  timestampSeconds?: number;
}

export interface LessonCommentData {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface LessonCommentInput {
  content: string;
}

export interface QuizQuestionData {
  id: string;
  prompt: string;
  points: number;
  options: { id: string; text: string }[];
}

export interface QuizData {
  attemptId: string;
  quiz: {
    id: string;
    title: string;
    timeLimitMinutes?: number;
    passingScore?: number;
    questions: QuizQuestionData[];
  };
}

export interface QuizSubmitInput {
  attemptId: string;
  answers: { questionId: string; optionId: string }[];
}

export interface QuizSubmitResult {
  score: number;
  total: number;
  scorePercent: number;
}
