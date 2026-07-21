export interface ResumeData {
  enrollmentId: string;
  courseId: string;
  courseTitle?: string;
  lessonId?: string | null;
  lessonTitle?: string | null;
  lastPositionSeconds: number;
  progressPercent: number;
}

export interface EnrollmentListItem {
  id: string;
  status: string;
  progressPercent: number;
  lastPositionSeconds: number;
  lastLessonId?: string | null;
  hoursSpent: number;
  pricePaid?: number | null;
  currency?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  UserId: string;
  CourseId: string;
  createdAt: Date;
  updatedAt: Date;
  Course?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    difficulty?: string;
    totalHours?: number;
  };
}

export interface UpdateProgressInput {
  progressPercent?: number;
  lastLessonId?: string;
  lastPositionSeconds?: number;
  hoursSpent?: number;
}
