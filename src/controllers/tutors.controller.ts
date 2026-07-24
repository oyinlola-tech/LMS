import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { listTutorsQuery } from '../services/tutors/queries/listTutors.query';
import { followTutorCommand } from '../services/tutors/commands/followTutor.command';
import { unfollowTutorCommand } from '../services/tutors/commands/unfollowTutor.command';
import { emailStudentsCommand } from '../services/tutors/commands/emailStudents.command';
import { postUpdateCommand } from '../services/tutors/commands/postUpdate.command';
import { scheduleOfficeHourCommand } from '../services/tutors/commands/scheduleOfficeHour.command';

export const getRecommended = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutors = await listTutorsQuery.execute(8);
    return ok(reply, tutors, 'Recommended mentors loaded');
  } catch (err: any) {
    return error(reply, 500, 'RECOMMENDATIONS_FAILED', 'Failed to load recommended mentors');
  }
};

export const listTutors = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutors = await listTutorsQuery.execute();
    return ok(reply, tutors, 'Tutors loaded');
  } catch (err: any) {
    return error(reply, 500, 'TUTORS_FAILED', 'Failed to load tutors');
  }
};

export const followTutor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user!.role !== UserRole.LEARNER) return error(reply, 403, 'FORBIDDEN', 'Only learners can follow tutors');
    await followTutorCommand.execute(request.user!.sub, (request.params as any).id);
    return created(reply, null, 'Followed tutor');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'FOLLOW_FAILED', err.message || 'Failed to follow tutor');
  }
};

export const unfollowTutor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user!.role !== UserRole.LEARNER) return error(reply, 403, 'FORBIDDEN', 'Only learners can unfollow tutors');
    await unfollowTutorCommand.execute(request.user!.sub, (request.params as any).id);
    return ok(reply, null, 'Unfollowed tutor');
  } catch (err: any) {
    return error(reply, 500, 'UNFOLLOW_FAILED', 'Failed to unfollow tutor');
  }
};

export const emailStudents = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user!.role !== UserRole.TUTOR) return error(reply, 403, 'FORBIDDEN', 'Only tutors can email students');
    const { subject, body } = (request.body as Record<string, any>) || {};
    const count = await emailStudentsCommand.execute(request.user!.sub, subject, body);
    return ok(reply, { recipients: count }, 'Emails sent');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'EMAIL_STUDENTS_FAILED', err.message || 'Failed to send emails');
  }
};

export const postUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user!.role !== UserRole.TUTOR) return error(reply, 403, 'FORBIDDEN', 'Only tutors can post updates');
    const { subject, body } = (request.body as Record<string, any>) || {};
    await postUpdateCommand.execute(request.user!.sub, subject, body);
    return ok(reply, null, 'Update posted');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'POST_UPDATE_FAILED', err.message || 'Failed to post update');
  }
};

export const scheduleOfficeHour = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user!.role !== UserRole.TUTOR) return error(reply, 403, 'FORBIDDEN', 'Only tutors can schedule office hours');
    const officeHour = await scheduleOfficeHourCommand.execute(request.user!.sub, (request.body as any) || {});
    return ok(reply, officeHour, 'Office hour scheduled');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'SCHEDULE_OFFICE_HOUR_FAILED', err.message || 'Failed to schedule office hour');
  }
};
