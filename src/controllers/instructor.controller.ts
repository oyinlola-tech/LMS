import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { Op } from 'sequelize';
import { Course, Enrollment, AssignmentSubmission, CourseReview } from '../models';
import { getInstructorAnalyticsQuery } from '../services/instructor/queries/getAnalytics.query';
import { getInstructorActivityQuery } from '../services/instructor/queries/getActivity.query';
import { getInstructorReviewsQuery } from '../services/instructor/queries/getReviews.query';
import { createInstructorTicketCommand } from '../services/instructor/commands/createSupportTicket.command';

export async function getAnalytics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await getInstructorAnalyticsQuery.execute(request.user!.sub);
    return ok(reply, data, 'Instructor analytics loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_ANALYTICS_FAILED', 'Failed to load analytics');
  }
}

export async function getCourses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const courses = await Course.findAll({ where: { tutorId: request.user!.sub }, order: [['updatedAt', 'DESC']] });
    return ok(reply, courses, 'Instructor courses loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_COURSES_FAILED', 'Failed to load courses');
  }
}

export async function getCourseStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const courses = await Course.findAll({ where: { tutorId: request.user!.sub } });
    const courseIds = courses.map((c: any) => c.id);
    const enrollments = courseIds.length ? await Enrollment.findAll({ where: { CourseId: { [Op.in]: courseIds } } }) : [];
    const submissions = courseIds.length ? await AssignmentSubmission.findAll({ include: [{ model: Course, where: { id: { [Op.in]: courseIds } } }] }) : [];
    const reviews = courseIds.length ? await CourseReview.findAll({ where: { CourseId: { [Op.in]: courseIds } } }) : [];
    const avgRating = reviews.length ? Number((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(2)) : 0;
    return ok(reply, { totalCourses: courses.length, totalEnrollments: enrollments.length, submissionsCount: submissions.length, avgRating }, 'Instructor course stats loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_STATS_FAILED', 'Failed to load course stats');
  }
}

export async function getActivity(request: FastifyRequest, reply: FastifyReply) {
  try {
    const activity = await getInstructorActivityQuery.execute(request.user!.sub);
    return ok(reply, activity, 'Instructor activity loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_ACTIVITY_FAILED', 'Failed to load activity');
  }
}

export async function getReviews(request: FastifyRequest, reply: FastifyReply) {
  try {
    const reviews = await getInstructorReviewsQuery.execute(request.user!.sub);
    return ok(reply, reviews, 'Instructor reviews loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_REVIEWS_FAILED', 'Failed to load reviews');
  }
}

export async function createSupportTicket(request: FastifyRequest, reply: FastifyReply) {
  try {
    const ticket = await createInstructorTicketCommand.execute(request.user!.sub, (request.body as any) || {});
    return created(reply, ticket, 'Support ticket created');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'INSTRUCTOR_SUPPORT_FAILED', err.message || 'Failed to create support ticket');
  }
}
