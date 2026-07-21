export enum AuditLogStatus {
  SUCCESS = 'success',
  SECURITY = 'security',
  INFRASTRUCTURE = 'infrastructure',
  WARNING = 'warning',
}

export enum QuizAttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
}

export enum OtpPurpose {
  VERIFY_EMAIL = 'verify_email',
  LOGIN = 'login',
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum WsMessageType {
  ERROR = 'error',
  NOTIFICATION = 'notification',
  MESSAGE = 'message',
}

export enum TimeUnit {
  SECOND = 1000,
  MINUTE = 60000,
  HOUR = 3600000,
  DAY = 86400000,
  WEEK = 604800000,
}
