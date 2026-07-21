import { Op, fn, col, literal } from 'sequelize';
import { Course, Enrollment, CourseReview, AssignmentSubmission, Assignment, CourseComment, User, CourseCertificate, CourseEvent, OfficeHour, DiscussionThread, DiscussionReply, PayoutRequest } from '../../../models';
import { sequelize } from '../../../config/db.config';

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
  stats: {
    publishedCourses: number;
    draftCoursesCount: number;
    certificatesIssued: number;
    completionRate: number;
    assignmentsPending: number;
    assignmentsTotal: number;
  };
  monthlyEarnings: Array<{ month: string; amount: number }>;
  reviews: Array<{
    id: string; rating: number; comment: string | null;
    user: { id: string; fullName: string; avatarUrl: string | null };
    course: { id: string; title: string };
    createdAt: string;
  }>;
  upcomingEvents: Array<{
    id: string; title: string; startsAt: string; endsAt: string | null;
    meetingUrl: string | null; course: { id: string; title: string } | null;
  }>;
  officeHours: Array<{
    id: string; title: string; startsAt: string; durationMinutes: number | null;
    meetingUrl: string | null; course: { id: string; title: string } | null;
  }>;
  discussions: Array<{
    id: string; title: string; body: string;
    user: { id: string; fullName: string; avatarUrl: string | null };
    course: { id: string; title: string };
    replyCount: number;
    createdAt: string;
  }>;
  studentsOverview: Array<{
    id: string; fullName: string; avatarUrl: string | null;
    courseCount: number; completedCount: number;
    lastActive: string | null;
  }>;
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
      : currentMonthRevenue > 0 ? 100 : 0;
    const totalStudents = new Set(enrollments.map((e: any) => e.UserId)).size;

    const reviews = courseIds.length
      ? await CourseReview.findAll({
          where: { CourseId: { [Op.in]: courseIds } },
          include: [
            { model: User, attributes: ['id', 'fullName', 'avatarUrl'] },
            { model: Course, attributes: ['id', 'title'] },
          ],
          order: [['createdAt', 'DESC']],
          limit: 10,
        })
      : [];
    const avgRating = reviews.length
      ? Number((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(2))
      : 0;

    const publishedCourses = courses.filter((c: any) => c.isPublished);
    const draftCoursesList = courses.filter((c: any) => !c.isPublished);

    const allAssignments = courseIds.length
      ? await Assignment.findAll({ where: { CourseId: { [Op.in]: courseIds } } })
      : [];
    const assignmentIds = allAssignments.map((a: any) => a.id);

    const pendingSubmissions = assignmentIds.length
      ? await AssignmentSubmission.findAll({
          where: { status: 'submitted', AssignmentId: { [Op.in]: assignmentIds } },
          include: [
            { model: Assignment, attributes: ['id', 'title', 'CourseId'] },
            { model: User, attributes: ['id', 'fullName'] },
          ],
          limit: 3,
          order: [['createdAt', 'DESC']],
        })
      : [];

    const activeCourses = publishedCourses.map((course: any) => {
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

    const draftCourses = draftCoursesList.map((course: any) => ({
      id: course.id, title: course.title, lastEdited: course.updatedAt,
      waitlistCount: course.waitlistCount, status: 'draft',
    }));

    // --- Monthly Earnings Breakdown ---
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyEarnings: Array<{ month: string; amount: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const amount = enrollments
        .filter((e: any) => e.createdAt >= monthStart && e.createdAt <= monthEnd)
        .reduce((sum: number, e: any) => sum + (e.pricePaid || 0), 0);
      monthlyEarnings.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        amount,
      });
    }

    // --- Learner Activity ---
    const learnerActivity: any[] = [];

    const latestSubmissions = assignmentIds.length
      ? await AssignmentSubmission.findAll({
          include: [
            { model: User, attributes: ['id', 'fullName'] },
            { model: Assignment, attributes: ['id', 'title', 'CourseId'], where: { CourseId: { [Op.in]: courseIds } } },
          ],
          where: { status: { [Op.in]: ['submitted', 'graded', 'needs_changes'] } },
          order: [['createdAt', 'DESC']],
          limit: 5,
        })
      : [];
    latestSubmissions.forEach((s: any) => {
      learnerActivity.push({
        type: 'submission',
        message: `${s.User?.fullName} submitted ${s.Assignment?.title}`,
        createdAt: s.createdAt, fileUrl: s.fileUrl,
      });
    });

    const latestComments = courseIds.length
      ? await CourseComment.findAll({
          where: { CourseId: { [Op.in]: courseIds } },
          include: [{ model: User, attributes: ['id', 'fullName'] }, { model: Course, attributes: ['id', 'title'] }],
          order: [['createdAt', 'DESC']],
          limit: 5,
        })
      : [];
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

    // --- Stats ---
    const certificatesIssued = courseIds.length
      ? await CourseCertificate.count({ where: { CourseId: { [Op.in]: courseIds } } })
      : 0;

    const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed').length;
    const completionRate = enrollments.length
      ? Math.round((completedEnrollments / enrollments.length) * 100)
      : 0;

    // --- Upcoming Events ---
    const upcomingEvents = courseIds.length
      ? await CourseEvent.findAll({
          where: { CourseId: { [Op.in]: courseIds }, startsAt: { [Op.gte]: now } },
          include: [{ model: Course, attributes: ['id', 'title'] }],
          order: [['startsAt', 'ASC']],
          limit: 5,
        })
      : [];

    // --- Office Hours ---
    const officeHours = await OfficeHour.findAll({
      where: { tutorId, startsAt: { [Op.gte]: now } },
      include: [{ model: Course, attributes: ['id', 'title'] }],
      order: [['startsAt', 'ASC']],
      limit: 5,
    });

    // --- Discussions ---
    const discussions = courseIds.length
      ? await DiscussionThread.findAll({
          where: { CourseId: { [Op.in]: courseIds } },
          include: [
            { model: User, attributes: ['id', 'fullName', 'avatarUrl'] },
            { model: Course, attributes: ['id', 'title'] },
          ],
          order: [['createdAt', 'DESC']],
          limit: 8,
        })
      : [];

    const discussionIds = discussions.map((d: any) => d.id);
    const replyCounts: Record<string, number> = {};
    if (discussionIds.length) {
      const counts: any[] = await DiscussionReply.findAll({
        attributes: ['DiscussionThreadId', [fn('COUNT', col('DiscussionThreadId')), 'count']],
        where: { DiscussionThreadId: { [Op.in]: discussionIds } },
        group: ['DiscussionThreadId'],
      });
      counts.forEach((c: any) => {
        replyCounts[c.DiscussionThreadId] = Number(c.getDataValue('count'));
      });
    }

    // --- Student Overview ---
    const userIds = [...new Set(enrollments.map((e: any) => e.UserId))] as string[];
    const studentsOverview: Array<any> = [];
    if (userIds.length) {
      const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'fullName', 'avatarUrl', 'lastLogin'],
      });
      users.forEach((u: any) => {
        const userEnrollments = enrollments.filter((e: any) => e.UserId === u.id);
        studentsOverview.push({
          id: u.id,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          courseCount: userEnrollments.length,
          completedCount: userEnrollments.filter((e: any) => e.status === 'completed').length,
          lastActive: u.lastLogin || null,
        });
      });
    }

    const assignmentsTotal = allAssignments.length;
    const assignmentsPending = pendingSubmissions.length;

    return {
      revenue: { total: totalRevenue, currency: process.env.DEFAULT_CURRENCY, monthlyDeltaPercent },
      totalStudents,
      avgRating,
      pendingAttention: pendingSubmissions.map((s: any) => ({
        assignmentId: s.AssignmentId, submissionId: s.id,
        message: `Action required: Assignment "${s.Assignment?.title}" from ${s.User?.fullName} needs feedback.`,
      })),
      activeCourses,
      draftCourses,
      quickActions: ['create_course', 'create_assignment', 'schedule_office_hour'],
      learnerActivity: learnerActivity.slice(0, 10),
      stats: {
        publishedCourses: publishedCourses.length,
        draftCoursesCount: draftCoursesList.length,
        certificatesIssued,
        completionRate,
        assignmentsPending,
        assignmentsTotal,
      },
      monthlyEarnings,
      reviews: reviews.map((r: any) => ({
        id: r.id, rating: r.rating, comment: r.comment,
        user: { id: r.User?.id, fullName: r.User?.fullName, avatarUrl: r.User?.avatarUrl },
        course: { id: r.Course?.id, title: r.Course?.title },
        createdAt: r.createdAt,
      })),
      upcomingEvents: upcomingEvents.map((e: any) => ({
        id: e.id, title: e.title, startsAt: e.startsAt, endsAt: e.endsAt,
        meetingUrl: e.meetingUrl,
        course: e.Course ? { id: e.Course.id, title: e.Course.title } : null,
      })),
      officeHours: officeHours.map((o: any) => ({
        id: o.id, title: o.title, startsAt: o.startsAt, durationMinutes: o.durationMinutes,
        meetingUrl: o.meetingUrl,
        course: o.Course ? { id: o.Course.id, title: o.Course.title } : null,
      })),
      discussions: discussions.map((d: any) => ({
        id: d.id, title: d.title, body: d.body,
        user: { id: d.User?.id, fullName: d.User?.fullName, avatarUrl: d.User?.avatarUrl },
        course: { id: d.Course?.id, title: d.Course?.title },
        replyCount: replyCounts[d.id] || 0,
        createdAt: d.createdAt,
      })),
      studentsOverview: studentsOverview.sort((a, b) => b.courseCount - a.courseCount).slice(0, 10),
    };
  }
}
export const getTutorOverviewQuery = new GetTutorOverviewQuery();
