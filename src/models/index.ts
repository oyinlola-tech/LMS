import { sequelize } from '../config/db.config';

import { User, associate as userAssociate } from './User';
import { Otp } from './Otp';
import { PasswordReset } from './PasswordReset';
import { Course } from './Course';
import { CourseSection } from './CourseSection';
import { CourseSpecialization } from './CourseSpecialization';
import { CourseAnnouncement } from './CourseAnnouncement';
import { CourseEvent } from './CourseEvent';
import { CourseReview } from './CourseReview';
import { CourseComment } from './CourseComment';
import { CourseCertificate } from './CourseCertificate';
import { CourseCoupon } from './CourseCoupon';
import { Lesson } from './Lesson';
import { LessonContent } from './LessonContent';
import { LessonResource } from './LessonResource';
import { LessonProgress } from './LessonProgress';
import { LessonNote } from './LessonNote';
import { LessonBookmark } from './LessonBookmark';
import { LessonComment } from './LessonComment';
import { Enrollment } from './Enrollment';
import { Milestone } from './Milestone';
import { Specialization } from './Specialization';
import { TutorProfile } from './TutorProfile';
import { TutorFollow } from './TutorFollow';
import { TutorBroadcast } from './TutorBroadcast';
import { OfficeHour } from './OfficeHour';
import { LearnerStats } from './LearnerStats';
import { UserInterest } from './UserInterest';
import { UserSkillProgress } from './UserSkillProgress';
import { UserStreak } from './UserStreak';
import { WeeklyTimeLog } from './WeeklyTimeLog';
import { UserRoleHistory } from './UserRoleHistory';
import { UserAdminNote } from './UserAdminNote';
import { Quiz } from './Quiz';
import { QuizQuestion } from './QuizQuestion';
import { QuizOption } from './QuizOption';
import { QuizAttempt } from './QuizAttempt';
import { Assignment } from './Assignment';
import { AssignmentRequirement } from './AssignmentRequirement';
import { AssignmentSubmission } from './AssignmentSubmission';

import { MessageThread, associate as messageThreadAssociate } from './MessageThread';
import { Message, associate as messageAssociate } from './Message';

import { SupportTicket } from './SupportTicket';
import { SupportTicketMessage } from './SupportTicketMessage';
import { Notification } from './Notification';
import { AdminAuditLog } from './AdminAuditLog';
import { MentorshipApplication } from './MentorshipApplication';
import { Subscription } from './Subscription';
import { DiscussionThread } from './DiscussionThread';
import { DiscussionReply } from './DiscussionReply';
import { BlogPost } from './BlogPost';
import { Career } from './Career';


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
  BlogPost,
  Career,
};
