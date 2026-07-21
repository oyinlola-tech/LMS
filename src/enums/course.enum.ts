export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
}

export enum LessonType {
  VIDEO = 'video',
  PDF = 'pdf',
  QUIZ = 'quiz',
  NOTE = 'note',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  NEEDS_CHANGES = 'needs_changes',
}

export enum RubricLevel {
  EXCEEDS = 'exceeds',
  MEETS = 'meets',
  PARTIAL = 'partial',
  REDO = 'redo',
}
