import {
  otpVerify, otpResend, passwordReset, passwordChanged, loginAlert, emailVerified,
} from './auth.templates';
import {
  socialWelcome, profileUpdated, accountSuspended, accountReactivated, accountDeactivated, roleChanged, accountWarning,
} from './account.templates';
import {
  certificateIssued, courseAnnouncement, courseEvent, enrollmentConfirmation, courseCompleted,
} from './course.templates';
import {
  quizScoreHigh, quizScoreAverage, quizScoreLow, assignmentGraded,
} from './assessment.templates';
import { tutorCreated, adminCreated } from './admin.templates';
import { subscriptionUpdated, paymentReceipt, paymentFailed } from './billing.templates';
import { welcome, notificationDetailed, mentorAssigned, weeklyDigest } from './misc.templates';

export const templates = {
  otpVerify, otpResend, passwordReset, passwordChanged, loginAlert, emailVerified,
  socialWelcome, profileUpdated, accountSuspended, accountReactivated, accountDeactivated, roleChanged, accountWarning,
  certificateIssued, courseAnnouncement, courseEvent, enrollmentConfirmation, courseCompleted,
  quizScoreHigh, quizScoreAverage, quizScoreLow, assignmentGraded,
  tutorCreated, adminCreated,
  subscriptionUpdated, paymentReceipt, paymentFailed,
  welcome, notificationDetailed, mentorAssigned, weeklyDigest,
};
