export interface ListCoursesQuery {
  specialization?: string;
  category?: string;
  difficulty?: string;
  q?: string;
}

export interface CreateAnnouncementBody {
  title: string;
  body: string;
}

export interface CreateEventBody {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  meetingUrl?: string;
}

export interface CreateCommentBody {
  content: string;
}

export interface EnrollBody {
  courseId: string;
}

export interface UpdateProgressBody {
  progressPercent: number;
  lastPositionSeconds?: number;
  minutesSpent?: number;
}

export interface LessonUpdateProgressBody {
  progressPercent: number;
  lastPositionSeconds?: number;
  minutesSpent?: number;
}

export interface UpdateProgressInput {
  enrollmentId: string;
  userId: string;
  progressPercent: number;
  lastLessonId?: string;
  lastPositionSeconds?: number;
  hoursSpent?: number;
}

export interface CreateNoteBody {
  content: string;
  timestampSeconds?: number;
}

export interface CreateBookmarkBody {
  note?: string;
  timestampSeconds?: number;
}

export interface CreateLessonCommentBody {
  content: string;
}

export interface SubmitQuizBody {
  attemptId: string;
  answers: Record<string, string>;
}

export interface UpdateProfileBody {
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
}

export interface UpdateAvatarBody {
  avatarUrl: string;
}

export interface UpdateInterestsBody {
  interests: string[];
}

export interface UpdateEmailBody {
  email: string;
}

export interface UpdateWeeklyGoalBody {
  weeklyGoalHours?: number;
  weeklyGoalProgressHours?: number;
}

export interface SubmitAssignmentBody {
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
  submissionNotes?: string;
}

export interface GradeSubmissionBody {
  submissionId: string;
  status: string;
  feedback?: string;
  score?: number;
  rubric?: string;
}

export interface UpdateSubmissionBody {
  submissionNotes?: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
}
