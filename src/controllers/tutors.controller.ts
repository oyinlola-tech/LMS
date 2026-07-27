import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { listMentorsQuery } from '../services/tutors/queries/listTutors.query';
import { ListTutorOfficeHoursQuery } from '../services/tutors/queries/listOfficeHours.query';
import { followTutorCommand } from '../services/tutors/commands/followTutor.command';
import { unfollowTutorCommand } from '../services/tutors/commands/unfollowTutor.command';
import { emailStudentsCommand } from '../services/tutors/commands/emailStudents.command';
import { postUpdateCommand } from '../services/tutors/commands/postUpdate.command';
import { ScheduleOfficeHourCommand } from '../services/tutors/commands/scheduleOfficeHour.command';
import { Op } from 'sequelize';
import { Enrollment, OfficeHour } from '../models';

export const getRecommended = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutors = await listMentorsQuery.execute({ limit: 8 });
    return ok(reply, tutors, 'Recommended mentors loaded');
  } catch (err: any) {
    return error(reply, 500, 'RECOMMENDATIONS_FAILED', 'Failed to load recommended mentors');
  }
};

export const listTutors = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutors = await listMentorsQuery.execute();
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
    const officeHour = await new ScheduleOfficeHourCommand().execute(request.user!.sub, (request.body as any) || {});
    return ok(reply, officeHour, 'Office hour scheduled');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'SCHEDULE_OFFICE_HOUR_FAILED', err.message || 'Failed to schedule office hour');
  }
};

export const getOfficeHours = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user!.role === UserRole.TUTOR) {
      const hours = await new ListTutorOfficeHoursQuery().execute(request.user!.sub);
      return ok(reply, hours, 'Office hours loaded');
    }
    if (request.user!.role === UserRole.LEARNER) {
      const enrollments = await Enrollment.findAll({
        where: { UserId: request.user!.sub },
        attributes: ['CourseId'],
      });
      const courseIds = enrollments.map((e: any) => e.CourseId);
      if (!courseIds.length) return ok(reply, [], 'Office hours loaded');
      const hours = await OfficeHour.findAll({
        where: { CourseId: { [Op.in]: courseIds } },
        include: [{ model: require('../../../models').Course, attributes: ['id', 'title'] }, { model: require('../../../models').User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] }],
        order: [['startsAt', 'ASC']],
      });
      return ok(reply, hours, 'Office hours loaded');
    }
    return ok(reply, [], 'Office hours loaded');
  } catch (err) {
    return error(reply, 500, 'OFFICE_HOURS_FAILED', 'Failed to load office hours');
  }
};
