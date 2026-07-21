import { Op } from 'sequelize';
import { Course, Enrollment, CourseReview, AssignmentSubmission, Assignment, CourseComment, User } from '../../../models';

const getWeekInfo = (course: any) => {
  if (!course.startDate || !course.durationWeeks) return null;
  const diffMs = Date.now() - new Date(course.startDate).getTime();
  const week = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
  return { week: Math.min(week, course.durationWeeks), totalWeeks: course.durationWeeks };
};

export interface TutorOverview {
  revenue: { total: number; currency?: string; monthlyDeltaPercent: number };
  totalStudents: number;
  avgRating: number;
  pendingAttention: Array<{ assignmentId: string; submissionId: string; message: string }>;
  activeCourses: Array<any>;
  draftCourses: Array<any>;
  quickActions: string[];
  learnerActivity: Array<any>;
}

export class GetTutorOverviewQuery {
  async execute(tutorId: string): Promise<TutorOverview> {
    const courses = await Course.findAll({
      where: { tutorId },
      order: [['updatedAt', 'DESC']],
    });

    const courseIds = courses.map((c: any) => c.id);
    const enrollments = courseIds.length
      ? await Enrollment.findAll({ where: { CourseId: { [Op.in]: courseIds } } })
      : [];

    const totalRevenue = enrollments.reduce((sum: number, e: any) => sum + (e.pricePaid || 0), 0);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const currentMonthRevenue = enrollments
      .filter((e: any) => e.createdAt >= startOfMonth)
      .reduce((sum: number, e: any) => sum + (e.pricePaid || 0), 0);
    const prevMonthRevenue = enrollments
      .filter((e: any) => e.createdAt >= startOfPrevMonth && e.createdAt <= endOfPrevMonth)
      .reduce((sum: number, e: any) => sum + (e.pricePaid || 0), 0);
    const monthlyDeltaPercent = prevMonthRevenue
      ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : 0;
    const totalStudents = new Set(enrollments.map((e: any) => e.UserId)).size;

    const reviews = courseIds.length
      ? await CourseReview.findAll({ where: { CourseId: { [Op.in]: courseIds } } })
      : [];
    const avgRating = reviews.length
      ? Number((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(2))
      : 0;

    const pendingSubmissions = await AssignmentSubmission.findAll({
      where: { status: 'submitted' },
      include: [{ model: Assignment, where: { CourseId: { [Op.in]: courseIds } } }],
      limit: 3,
      order: [['createdAt', 'DESC']],
    });

    const activeCourses = courses
      .filter((c: any) => c.isPublished)
      .map((course: any) => {
        const courseEnrollments = enrollments.filter((e: any) => e.CourseId === course.id);
        const completedPercent = courseEnrollments.length
          ? Math.round((courseEnrollments.filter((e: any) => e.status === 'completed').length / courseEnrollments.length) * 100)
          : 0;
        return {
          id: course.id, title: course.title, thumbnailUrl: course.thumbnailUrl,
          learners: courseEnrollments.length, weekInfo: getWeekInfo(course),
          completedPercent, isActive: true,
        };
      });

    const draftCourses = courses
      .filter((c: any) => !c.isPublished)
      .map((course: any) => ({
        id: course.id, title: course.title, lastEdited: course.updatedAt,
        waitlistCount: course.waitlistCount, status: 'draft',
      }));

    const learnerActivity: any[] = [];

    const latestSubmissions = await AssignmentSubmission.findAll({
      include: [
        { model: User, attributes: ['id', 'fullName'] },
        { model: Assignment, attributes: ['id', 'title', 'CourseId'], where: { CourseId: { [Op.in]: courseIds } } },
      ],
      where: { status: { [Op.in]: ['submitted', 'graded', 'needs_changes'] } },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    latestSubmissions.forEach((s: any) => {
      learnerActivity.push({
        type: 'submission',
        message: `${s.User?.fullName} submitted ${s.Assignment?.title}`,
        createdAt: s.createdAt, fileUrl: s.fileUrl,
      });
    });

    const latestComments = await CourseComment.findAll({
      where: { CourseId: { [Op.in]: courseIds } },
      include: [{ model: User, attributes: ['id', 'fullName'] }, { model: Course, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    latestComments.forEach((c: any) => {
      learnerActivity.push({
        type: 'comment',
        message: `${c.User?.fullName} commented on ${c.Course?.title}: "${c.content}"`,
        createdAt: c.createdAt,
      });
    });

    const latestEnrollments = await Enrollment.findAll({
      where: { CourseId: { [Op.in]: courseIds } },
      include: [{ model: User, attributes: ['id', 'fullName'] }, { model: Course, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    latestEnrollments.forEach((e: any) => {
      learnerActivity.push({
        type: 'joined',
        message: `${e.User?.fullName} joined ${e.Course?.title}`,
        createdAt: e.createdAt,
      });
    });

    learnerActivity.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      revenue: { total: totalRevenue, currency: process.env.DEFAULT_CURRENCY, monthlyDeltaPercent },
      totalStudents,
      avgRating,
      pendingAttention: pendingSubmissions.map((s: any) => ({
        assignmentId: s.AssignmentId, submissionId: s.id,
        message: `Action required: Assignment "${s.Assignment?.title}" needs feedback.`,
      })),
      activeCourses,
      draftCourses,
      quickActions: ['email_students', 'post_update', 'schedule_office_hour'],
      learnerActivity: learnerActivity.slice(0, 10),
    };
  }
}
export const getTutorOverviewQuery = new GetTutorOverviewQuery();
