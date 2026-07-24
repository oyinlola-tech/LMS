import { FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { MentorshipApplication, User, Course } from '../models';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { applyMentorshipCommand } from '../services/mentorship/commands/applyMentorship.command';
import { getMentorshipApplicationQuery } from '../services/mentorship/queries/getMentorshipApplication.query';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function applyMentorship(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (request.user!.role !== UserRole.LEARNER) return error(reply, 403, 'FORBIDDEN', 'Only learners can apply');
    const { courseId, message } = (request.body as Record<string, any>) || {};
    if (!courseId || typeof courseId !== 'string' || !UUID_REGEX.test(courseId)) {
      return error(reply, 400, 'VALIDATION_ERROR', 'courseId must be a valid UUID');
    }
    if (message && (typeof message !== 'string' || message.length > 2000)) {
      return error(reply, 400, 'VALIDATION_ERROR', 'message must be a string with at most 2000 characters');
    }
    const application = await applyMentorshipCommand.execute(request.user!.sub, courseId, message || '');
    return created(reply, application, 'Mentorship application submitted');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'MENTORSHIP_APPLY_FAILED', err.message || 'Failed to submit application');
  }
}

export async function getCourseMentors(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { courseId } = request.params as { courseId: string };
    const mentors = await MentorshipApplication.findAll({
      where: { CourseId: courseId, status: 'approved' },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'bio'] }],
    });
    return ok(reply, mentors, 'Mentors loaded');
  } catch (err) {
    request.log.error(err, 'MENTORS_LOAD_FAILED');
    return error(reply, 500, 'MENTORS_LOAD_FAILED', 'Failed to load mentors');
  }
}

export async function getMyApplication(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { courseId } = request.params as { courseId: string };
    const app = await getMentorshipApplicationQuery.execute(request.user!.sub, courseId);
    return ok(reply, app, 'Application loaded');
  } catch (err) {
    request.log.error(err, 'APPLICATION_LOAD_FAILED');
    return error(reply, 500, 'APPLICATION_LOAD_FAILED', 'Failed to load application');
  }
}

export async function getApplications(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { courseId } = request.params as { courseId: string };
    const course = await Course.findByPk(courseId);
    if (!course) return error(reply, 404, 'NOT_FOUND', 'Course not found');
    if (course.tutorId !== request.user!.sub && request.user!.role !== UserRole.ADMIN) {
      return error(reply, 403, 'FORBIDDEN', 'Only the course tutor or admin can view applications');
    }
    const apps = await MentorshipApplication.findAll({
      where: { CourseId: courseId },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return ok(reply, apps, 'Applications loaded');
  } catch (err) {
    request.log.error(err, 'APPLICATIONS_LOAD_FAILED');
    return error(reply, 500, 'APPLICATIONS_LOAD_FAILED', 'Failed to load applications');
  }
}

export async function approveApplication(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const app = await MentorshipApplication.findByPk(id, { include: [{ model: Course }] }) as any;
    if (!app) return error(reply, 404, 'NOT_FOUND', 'Application not found');
    if (app.Course?.tutorId !== request.user!.sub) return error(reply, 403, 'FORBIDDEN', 'Only the course tutor can approve');
    app.status = 'approved';
    await app.save();
    return ok(reply, app, 'Application approved');
  } catch (err) {
    request.log.error(err, 'APPROVE_FAILED');
    return error(reply, 500, 'APPROVE_FAILED', 'Failed to approve application');
  }
}

export async function rejectApplication(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const app = await MentorshipApplication.findByPk(id, { include: [{ model: Course }] }) as any;
    if (!app) return error(reply, 404, 'NOT_FOUND', 'Application not found');
    if (app.Course?.tutorId !== request.user!.sub) return error(reply, 403, 'FORBIDDEN', 'Only the course tutor can reject');
    app.status = 'rejected';
    await app.save();
    return ok(reply, app, 'Application rejected');
  } catch (err) {
    request.log.error(err, 'REJECT_FAILED');
    return error(reply, 500, 'REJECT_FAILED', 'Failed to reject application');
  }
}
