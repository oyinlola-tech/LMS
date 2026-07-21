export {
  normalizeEmail, isValidEmail, isStrongPassword, PASSWORD_MIN_LENGTH_CONST,
  ValidationResult,
  validateRegister, validateLogin, validateVerifyOtp, validateResendOtp,
  validateForgotPassword, validateResetPassword,
} from './auth.validator';
export {
  validateSubmitInput, validateGradeInput, validateUpdateSubmissionInput,
} from './assignment.validator';
export {
  validateEnroll, validateCourseAnnouncement, validateCourseEvent, validateCourseComment,
} from './course.validator';
export {
  validateUpdateProgress,
} from './enrollment.validator';
export {
  validateProgressInput, validateNoteInput, validateBookmarkInput,
  validateCommentInput, validateQuizSubmit,
} from './lesson.validator';
export {
  validateUpdateProfile, validateUpdateAvatar, validateUpdateInterests,
  validateUpdateEmail, validateUpdateWeeklyGoal,
} from './user.validator';
