import { Op } from 'sequelize';
import {
  User, Enrollment, Course, Lesson, CourseAnnouncement, CourseEvent,
  TutorProfile, LearnerStats, Milestone, UserInterest, Specialization,
} from '../../../models';
import { UserRole } from '../../../enums';

export interface OverviewData {
  welcome: string;
  announcements: any[];
  events: any[];
  recommendedMentors: any[];
  resumeLesson: any;
  stats: { coursesActive: number; coursesCompleted: number; hoursSpent: number };
  weeklyGoal: { weeklyGoalHours: number; weeklyGoalProgressHours: number; weeklyGoalPercent: number; message: string };
  milestones: any[];
  recommendedCourses: any[];
}

export class GetOverviewQuery {
  async execute(userId: string): Promise<OverviewData> {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const enrollments = await Enrollment.findAll({
      where: { UserId: user.id },
      include: [{ model: Course }],
      order: [['updatedAt', 'DESC']],
    });

    const courseIds = enrollments.map((e: any) => e.CourseId);
    const announcements = courseIds.length
      ? await CourseAnnouncement.findAll({
          where: { CourseId: { [Op.in]: courseIds } },
          include: [{ model: Course }],
          order: [['createdAt', 'DESC']],
          limit: 5,
        })
      : [];

    const events = courseIds.length
      ? await CourseEvent.findAll({
          where: {
            CourseId: { [Op.in]: courseIds },
            startsAt: { [Op.gte]: new Date() },
          },
          include: [{ model: Course }],
          order: [['startsAt', 'ASC']],
          limit: 5,
        })
      : [];

    const resume = enrollments.find((e: any) => e.lastLessonId);
    const resumeLesson = resume
      ? await Lesson.findByPk(resume.lastLessonId, { include: [{ model: Course }] })
      : null;

    const stats = await LearnerStats.findOne({ where: { UserId: user.id } });
    const coursesActive = enrollments.filter((e: any) => e.status === 'active').length;
    const coursesCompleted = enrollments.filter((e: any) => e.status === 'completed').length;
    const hoursSpent = enrollments.reduce((sum: number, e: any) => sum + e.hoursSpent, 0);

    const weeklyGoalHours = stats ? stats.weeklyGoalHours : 0;
    const weeklyGoalProgressHours = stats ? stats.weeklyGoalProgressHours : 0;
    const weeklyGoalPercent = weeklyGoalHours
      ? Math.min(100, Math.round((weeklyGoalProgressHours / weeklyGoalHours) * 100))
      : 0;

    const milestones = await Milestone.findAll({
      where: { UserId: user.id, completedAt: null },
      order: [['dueDate', 'ASC']],
      limit: 5,
    });

    const interests = await UserInterest.findAll({ where: { UserId: user.id } });
    const interestNames = interests.map((i: any) => i.name);

    const recommendedCourses = await Course.findAll({
      where: { isPublished: true },
      include: [
        { model: User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] },
        interestNames.length
          ? { model: Specialization, where: { name: { [Op.in]: interestNames } } }
          : { model: Specialization, required: false },
      ],
      limit: 6,
      order: [['updatedAt', 'DESC']],
    });

    const recommendedMentors = await User.findAll({
      where: { role: UserRole.TUTOR },
      include: [{ model: TutorProfile }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return {
      welcome: `Welcome back, ${user.fullName}`,
      announcements,
      events,
      recommendedMentors,
      resumeLesson: resumeLesson
        ? {
            courseId: resumeLesson.courseId,
            courseTitle: (resumeLesson as any).Course?.title,
            lessonId: resumeLesson.id,
            lessonTitle: resumeLesson.title,
            lastPositionSeconds: resume.lastPositionSeconds,
            progressPercent: resume.progressPercent,
          }
        : null,
      stats: { coursesActive, coursesCompleted, hoursSpent },
      weeklyGoal: {
        weeklyGoalHours,
        weeklyGoalProgressHours,
        weeklyGoalPercent,
        message: weeklyGoalHours
          ? `You have reached ${weeklyGoalPercent}% of your weekly goals. Keep the momentum!`
          : 'Set a weekly goal to track your progress.',
      },
      milestones,
      recommendedCourses,
    };
  }
}

export const getOverviewQuery = new GetOverviewQuery();
