import { Op } from 'sequelize';
import { Enrollment, Course, CourseSection, Lesson, LessonProgress, Milestone, UserSkillProgress, User } from '../../../models';

const computeAcademicRank = async (userId: string) => {
  const enrollments = await Enrollment.findAll({ include: [{ model: User, attributes: ['id'] }], attributes: ['UserId', 'progressPercent'] });
  const masteryByUser = enrollments.reduce((acc: any, e: any) => {
    if (!acc[e.UserId]) acc[e.UserId] = []; acc[e.UserId].push(e.progressPercent || 0); return acc;
  }, {});
  const masteryList = Object.keys(masteryByUser).map((id) => {
    const values = masteryByUser[id]; const avg = values.length ? values.reduce((s: number, v: number) => s + v, 0) / values.length : 0;
    return { userId: id, avg };
  });
  if (masteryList.length === 0) return { percentile: 0, label: 'Top 100%' };
  const sorted = masteryList.sort((a: any, b: any) => b.avg - a.avg);
  const index = sorted.findIndex((item: any) => item.userId === userId);
  const rank = index === -1 ? masteryList.length : index + 1;
  const percentile = Math.round((1 - (rank - 1) / masteryList.length) * 100);
  return { percentile, label: `Top ${Math.max(1, 100 - percentile + 1)}%` };
};

export class GetProgressOverviewQuery {
  async execute(userId: string) {
    const enrollments = await Enrollment.findAll({ where: { UserId: userId }, include: [{ model: Course }], order: [['updatedAt', 'DESC']] });

    const totalMastery = enrollments.length ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progressPercent || 0), 0) / enrollments.length) : 0;
    const coursesCompleted = enrollments.filter((e: any) => e.status === 'completed').length;
    const rank = await computeAcademicRank(userId);

    const milestones = await Milestone.findAll({ where: { UserId: userId }, order: [['dueDate', 'ASC']] });
    const lessonProgress = await LessonProgress.findAll({ where: { UserId: userId }, include: [{ model: Lesson, attributes: ['id', 'courseSectionId'] }] });

    const sections = await CourseSection.findAll({
      where: enrollments.length ? { CourseId: { [Op.in]: enrollments.map((e: any) => e.CourseId) } } : { CourseId: null },
    });

    const completedModules = sections.filter((section: any) => {
      const sectionLessons = lessonProgress.filter((lp: any) => lp.Lesson?.courseSectionId === section.id);
      return sectionLessons.length > 0 && sectionLessons.every((lp: any) => lp.progressPercent >= 100);
    }).length;

    const inProgressModules = Math.max(0, sections.length - completedModules);

    const enrolledCourses = enrollments.slice(0, 4).map((e: any) => ({
      courseId: e.CourseId, title: e.Course?.title, thumbnailUrl: e.Course?.thumbnailUrl, progressPercent: e.progressPercent,
    }));

    const skills = await UserSkillProgress.findAll({ where: { UserId: userId }, order: [['percent', 'DESC']] });

    return {
      skills,
      mastery: { totalMasteryPercent: totalMastery, coursesCompleted, academicRank: rank.label, academicPercentile: rank.percentile },
      journeyMilestones: { completedModules, inProgressModules, upcoming: milestones.filter((m: any) => !m.completedAt), completed: milestones.filter((m: any) => m.completedAt) },
      enrolledCourses,
    };
  }
}
export const getProgressOverviewQuery = new GetProgressOverviewQuery();
