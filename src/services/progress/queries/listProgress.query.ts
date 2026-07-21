import { Op } from 'sequelize';
import { Enrollment, Course, CourseSection, Lesson, LessonProgress, Milestone, UserSkillProgress, User, WeeklyTimeLog, UserStreak } from '../../../models';

export interface ProgressData {
  courses: Array<any>;
  milestones: any[];
  skills: any[];
  streak: any;
  stats: any;
}

export class ListProgressQuery {
  async execute(userId: string): Promise<ProgressData> {
    const enrollments = await Enrollment.findAll({
      where: { UserId: userId },
      include: [{ model: Course }],
      order: [['updatedAt', 'DESC']],
    });

    const milestones = await Milestone.findAll({
      where: { UserId: userId },
      order: [['dueDate', 'ASC']],
    });

    const lessonProgress = await LessonProgress.findAll({
      where: { UserId: userId },
    });

    const courseIds = enrollments.map((e: any) => e.CourseId);
    const sections = courseIds.length
      ? await CourseSection.findAll({ where: { CourseId: { [Op.in]: courseIds } } })
      : [];
    const sectionIds = sections.map((s: any) => s.id);
    const lessons = sectionIds.length
      ? await Lesson.findAll({ where: { courseSectionId: { [Op.in]: sectionIds } } })
      : [];

    const skills = await UserSkillProgress.findAll({ where: { UserId: userId } });

    const streak = await UserStreak.findOne({ where: { UserId: userId } });

    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    let weeklyLog = await WeeklyTimeLog.findOne({
      where: { UserId: userId, weekStartDate: weekStart.toISOString().slice(0, 10) },
    });
    if (!weeklyLog) {
      weeklyLog = await WeeklyTimeLog.findOrCreate({
        where: { UserId: userId, weekStartDate: weekStart.toISOString().slice(0, 10) },
        defaults: { UserId: userId, weekStartDate: weekStart.toISOString().slice(0, 10), minutesSpent: 0 },
      }).then(([log]) => log);
    }

    const totalMinutes = await WeeklyTimeLog.sum('minutesSpent', { where: { UserId: userId } });

    const courses = enrollments.map((e: any) => {
      const courseLessons = lessons.filter((l: any) => {
        const sec = sections.find((s: any) => s.id === l.courseSectionId);
        return sec && sec.CourseId === e.CourseId;
      });
      const completedLessons = courseLessons.filter((l: any) =>
        lessonProgress.some((lp: any) => lp.LessonId === l.id && lp.completedAt)
      ).length;
      return {
        id: e.Course?.id,
        title: e.Course?.title,
        thumbnailUrl: e.Course?.thumbnailUrl,
        status: e.status,
        progressPercent: e.progressPercent,
        totalLessons: courseLessons.length,
        completedLessons,
      };
    });

    const totalHours = Math.round(totalMinutes / 60);

    return {
      courses,
      milestones,
      skills,
      streak,
      stats: {
        totalHours,
        weeklyMinutes: weeklyLog.minutesSpent,
        coursesCompleted: enrollments.filter((e: any) => e.status === 'completed').length,
      },
    };
  }
}
export const listProgressQuery = new ListProgressQuery();
