export type {
  OAuthCallbackResult, AuthUser, RegisterBody, LoginBody, VerifyOtpBody,
  ResendOtpBody, ForgotPasswordBody, ResetPasswordBody,
} from './auth.type';

export type {
  IdParams, IdSubmissionIdParams, IdNoteIdParams, IdBookmarkIdParams,
  CourseIdParams, ModuleIdParams, CourseIdLessonIdParams, PaginationQuery, MulterFile,
} from './common.type';

export type {
  ListCoursesQuery, CreateAnnouncementBody, CreateEventBody, CreateCommentBody,
  EnrollBody, UpdateProgressBody, LessonUpdateProgressBody, UpdateProgressInput,
  CreateNoteBody, CreateBookmarkBody, CreateLessonCommentBody, SubmitQuizBody,
  UpdateProfileBody, UpdateAvatarBody, UpdateInterestsBody, UpdateEmailBody, UpdateWeeklyGoalBody,
  SubmitAssignmentBody, GradeSubmissionBody, UpdateSubmissionBody,
} from './course.type';
