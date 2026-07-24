import { FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { UserRole } from '../enums';
import {
  User,
  Course,
  UserAdminNote,
  AdminAuditLog,
  TutorProfile,
} from '../models';
import { ok, created, error } from '../utils/response.util';
import { sendEmail, templates } from '../services/mail';
import { hashPassword } from '../utils/password.util';

const normalizeStatus = (value: string) => String(value || '').toLowerCase();

export const getInstructor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await User.findByPk((request.params as any).id, {
      include: [{ model: TutorProfile }],
    });
    if (!user || user.role !== UserRole.TUTOR) {
      return error(reply, 404, 'NOT_FOUND', 'Instructor not found');
    }

    const courses = await Course.findAll({
      where: { tutorId: user.id },
      order: [['updatedAt', 'DESC']],
    });

    return ok(reply, { profile: user, courses }, 'Instructor loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_LOAD_FAILED', 'Failed to load instructor');
  }
};

export const updateInstructor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { fullName, email, status } = (request.body as Record<string, any>) || {};
    const user = await User.findByPk((request.params as any).id);
    if (!user || user.role !== UserRole.TUTOR) {
      return error(reply, 404, 'NOT_FOUND', 'Instructor not found');
    }

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({
        where: { email: normalizedEmail, id: { [Op.ne]: user.id } },
      });
      if (existing) return error(reply, 409, 'EMAIL_EXISTS', 'Email already in use');
      user.email = normalizedEmail;
    }
    if (fullName) user.fullName = String(fullName).trim();
    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus && ['active', 'suspended', 'deactivated'].includes(normalizedStatus)) {
      user.status = normalizedStatus;
    }

    await user.save();
    return ok(reply, user, 'Instructor updated');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_UPDATE_FAILED', 'Failed to update instructor');
  }
};

export const addInstructorNote = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { note } = (request.body as Record<string, any>) || {};
    if (!note) return error(reply, 400, 'VALIDATION_ERROR', 'note is required');
    const instructor = await User.findByPk((request.params as any).id);
    if (!instructor || instructor.role !== UserRole.TUTOR) {
      return error(reply, 404, 'NOT_FOUND', 'Instructor not found');
    }
    const entry = await UserAdminNote.create({
      UserId: instructor.id,
      adminId: request.user!.sub,
      note,
    });
    return created(reply, entry, 'Note added');
  } catch (err: any) {
    return error(reply, 500, 'NOTE_CREATE_FAILED', 'Failed to add note');
  }
};

export const getInstructorNotes = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const instructor = await User.findByPk((request.params as any).id);
    if (!instructor || instructor.role !== UserRole.TUTOR) {
      return error(reply, 404, 'NOT_FOUND', 'Instructor not found');
    }
    const notes = await UserAdminNote.findAll({
      where: { UserId: instructor.id },
      include: [{ model: User, as: 'admin', attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return ok(reply, notes, 'Notes loaded');
  } catch (err: any) {
    return error(reply, 500, 'NOTES_LOAD_FAILED', 'Failed to load notes');
  }
};

export const assignCourseToInstructor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { courseId } = (request.body as Record<string, any>) || {};
    if (!courseId) return error(reply, 400, 'VALIDATION_ERROR', 'courseId is required');
    const instructor = await User.findByPk((request.params as any).id);
    if (!instructor || instructor.role !== UserRole.TUTOR) {
      return error(reply, 404, 'NOT_FOUND', 'Instructor not found');
    }
    const course = await Course.findByPk(courseId);
    if (!course) return error(reply, 404, 'NOT_FOUND', 'Course not found');

    course.tutorId = instructor.id;
    await course.save();
    return ok(reply, course, 'Course assigned');
  } catch (err: any) {
    return error(reply, 500, 'COURSE_ASSIGN_FAILED', 'Failed to assign course');
  }
};

export const createInstructor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { fullName, email, password } = (request.body as Record<string, any>) || {};
    if (!fullName || !email) {
      return error(reply, 400, 'VALIDATION_ERROR', 'fullName and email are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return error(reply, 409, 'EMAIL_EXISTS', 'Email already in use');

    const tempPassword = password || crypto.randomBytes(6).toString('base64');
    const passwordHash = await hashPassword(tempPassword);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.TUTOR,
      isEmailVerified: true,
    });

    await sendEmail({ to: user.email, ...templates.tutorCreated({ fullName: user.fullName }) });
    await AdminAuditLog.create({
      actorId: request.user!.sub,
      title: 'Instructor created',
      content: `${user.fullName} (${user.email}) created as instructor.`,
      status: 'success',
      meta: JSON.stringify({ userId: user.id, role: user.role }),
    });

    return created(reply, { id: user.id, email: user.email, role: user.role }, 'Instructor created');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_CREATE_FAILED', 'Failed to create instructor');
  }
};