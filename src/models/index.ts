import { sequelize } from '../config/db.config';

import { User, associate as userAssociate } from './User.model';
import { Otp } from './Otp.model';
import { PasswordReset } from './PasswordReset.model';
import { Course } from './Course.model';
import { CourseSection } from './CourseSection.model';
import { CourseSpecialization } from './CourseSpecialization.model';
import { CourseAnnouncement } from './CourseAnnouncement.model';
import { CourseEvent } from './CourseEvent.model';
import { CourseReview } from './CourseReview.model';
import { CourseComment } from './CourseComment.model';
import { CourseCertificate } from './CourseCertificate.model';
import { CourseCoupon } from './CourseCoupon.model';
import { Lesson } from './Lesson.model';
import { LessonContent } from './LessonContent.model';
import { LessonResource } from './LessonResource.model';
import { LessonProgress } from './LessonProgress.model';
import { LessonNote } from './LessonNote.model';
import { LessonBookmark } from './LessonBookmark.model';
import { LessonComment } from './LessonComment.model';
import { Enrollment } from './Enrollment.model';
import { Milestone } from './Milestone.model';
import { Specialization } from './Specialization.model';
import { TutorProfile } from './TutorProfile.model';
import { TutorFollow } from './TutorFollow.model';
import { TutorBroadcast } from './TutorBroadcast.model';
import { OfficeHour } from './OfficeHour.model';
import { LearnerStats } from './LearnerStats.model';
import { UserInterest } from './UserInterest.model';
import { UserSkillProgress } from './UserSkillProgress.model';
import { UserStreak } from './UserStreak.model';
import { WeeklyTimeLog } from './WeeklyTimeLog.model';
import { UserRoleHistory } from './UserRoleHistory.model';
import { UserAdminNote } from './UserAdminNote.model';
import { Quiz } from './Quiz.model';
import { QuizQuestion } from './QuizQuestion.model';
import { QuizOption } from './QuizOption.model';
import { QuizAttempt } from './QuizAttempt.model';
import { Assignment } from './Assignment.model';
import { AssignmentRequirement } from './AssignmentRequirement.model';
import { AssignmentSubmission } from './AssignmentSubmission.model';
import { AssignmentResource } from './AssignmentResource.model';
import { GradingRubricCriterion } from './GradingRubricCriterion.model';

import { MessageThread, associate as messageThreadAssociate } from './MessageThread.model';
import { Message, associate as messageAssociate } from './Message.model';

import { SupportTicket } from './SupportTicket.model';
import { SupportTicketMessage } from './SupportTicketMessage.model';
import { Notification } from './Notification.model';
import { AdminAuditLog } from './AdminAuditLog.model';
import { MentorshipApplication } from './MentorshipApplication.model';
import { Subscription } from './Subscription.model';
import { DiscussionThread } from './DiscussionThread.model';
import { DiscussionReply } from './DiscussionReply.model';
import { DiscussionMessage } from './DiscussionMessage.model';
import { DiscussionGroup } from './DiscussionGroup.model';
import { GroupMember } from './GroupMember.model';
import { Follow } from './Follow.model';
import { ThreadSubscription } from './ThreadSubscription.model';
import { PlatformSetting } from './PlatformSetting.model';
import { PayoutRequest } from './PayoutRequest.model';
import { BlogPost } from './BlogPost.model';
import { BlogComment } from './BlogComment.model';
import { Career } from './Career.model';
import { Payment } from './Payment.model';
import { UserBlock } from './UserBlock.model';
import { Report } from './Report.model';
import { UserWarning } from './UserWarning.model';
import { WishlistItem } from './Wishlist.model';


userAssociate({ MessageThread, Message });
messageThreadAssociate({ User });
messageAssociate({ User });


export {
  sequelize,
  User,
  Otp,
  PasswordReset,
  Course,
  CourseSection,
  CourseSpecialization,
  CourseAnnouncement,
  CourseEvent,
  CourseReview,
  CourseComment,
  CourseCertificate,
  CourseCoupon,
  Lesson,
  LessonContent,
  LessonResource,
  LessonProgress,
  LessonNote,
  LessonBookmark,
  LessonComment,
  Enrollment,
  Milestone,
  Specialization,
  TutorProfile,
  TutorFollow,
  TutorBroadcast,
  OfficeHour,
  LearnerStats,
  UserInterest,
  UserSkillProgress,
  UserStreak,
  WeeklyTimeLog,
  UserRoleHistory,
  UserAdminNote,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  Assignment,
  AssignmentRequirement,
  AssignmentSubmission,
  AssignmentResource,
  GradingRubricCriterion,
  MessageThread,
  Message,
  SupportTicket,
  SupportTicketMessage,
  Notification,
  AdminAuditLog,
  MentorshipApplication,
  Subscription,
  DiscussionThread,
  DiscussionReply,
  DiscussionMessage,
  DiscussionGroup,
  GroupMember,
  Follow,
  ThreadSubscription,
  BlogPost,
  BlogComment,
  Career,
  PlatformSetting,
  PayoutRequest,
  Payment,
  UserBlock,
  Report,
  UserWarning,
  WishlistItem,
};
