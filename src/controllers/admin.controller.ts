import { FastifyRequest, FastifyReply } from 'fastify';
import { User, AdminAuditLog } from '../models';
import { hashPassword } from '../utils/password.util';
import { generateTutorId, generateAdminId } from '../utils/idGenerator.util';
import { sendEmail, templates } from '../services/mail';
import { created, error } from '../utils/response.util';
import { UserRole } from '../enums';

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

export const createTutor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { fullName, email, password } = (request.body as Record<string, any>) || {};
    if (!fullName || !email || !password) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Full name, email, and password are required');
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Invalid email address');
    }
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      return error(reply, 400, 'VALIDATION_ERROR', `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return error(reply, 409, 'EMAIL_IN_USE', 'Email already in use');
    }
    const passwordHash = await hashPassword(password);
    const tutorId = await generateTutorId();
    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      role: UserRole.TUTOR,
      isEmailVerified: true,
      tutorId,
      isVerified: true,
      checkmarkType: 'blue',
    });
    const emailPayload = templates.tutorCreated({ fullName: user.fullName });
    await sendEmail({ to: user.email, ...emailPayload });
    await AdminAuditLog.create({
      actorId: request.user!.sub,
      title: 'New tutor created',
      content: `${user.fullName} (${user.email}) was created as a tutor. ID: ${tutorId}`,
      status: 'success',
      meta: JSON.stringify({ userId: user.id, role: UserRole.TUTOR, tutorId }),
    });
    return created(reply, { userId: user.id, tutorId }, 'Tutor created');
  } catch (err: any) {
    return error(reply, 500, 'CREATE_TUTOR_FAILED', 'Failed to create tutor');
  }
};

export const createAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { fullName, email, password, role } = (request.body as Record<string, any>) || {};
    if (!fullName || !email || !password) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Full name, email, and password are required');
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Invalid email address');
    }
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      return error(reply, 400, 'VALIDATION_ERROR', `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return error(reply, 409, 'EMAIL_IN_USE', 'Email already in use');
    }
    const passwordHash = await hashPassword(password);
    const adminRole = role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.ADMIN;
    const adminId = await generateAdminId();
    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      role: adminRole,
      isEmailVerified: true,
      adminId,
      isVerified: true,
      checkmarkType: 'black',
    });
    const emailPayload = templates.tutorCreated({ fullName: user.fullName });
    await sendEmail({ to: user.email, ...emailPayload });
    await AdminAuditLog.create({
      actorId: request.user!.sub,
      title: `New ${adminRole} created`,
      content: `${user.fullName} (${user.email}) was created as ${adminRole}. ID: ${adminId}`,
      status: 'success',
      meta: JSON.stringify({ userId: user.id, role: adminRole, adminId }),
    });
    return created(reply, { userId: user.id, adminId }, `${adminRole} created`);
  } catch (err: any) {
    return error(reply, 500, 'CREATE_ADMIN_FAILED', 'Failed to create admin');
  }
};

export const toggleCheckmark = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.params as { userId: string };
    const { isVerified } = (request.body as Record<string, any>) || {};
    if (typeof isVerified !== 'boolean') {
      return error(reply, 400, 'VALIDATION_ERROR', 'isVerified (boolean) is required');
    }
    const user = await User.findByPk(userId);
    if (!user) return error(reply, 404, 'NOT_FOUND', 'User not found');
    if (user.role === UserRole.SUPER_ADMIN) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Cannot modify super admin checkmark');
    }

    let checkmarkType = user.checkmarkType;
    if (isVerified) {
      checkmarkType = user.role === UserRole.TUTOR ? 'blue' : 'black';
    } else {
      checkmarkType = null;
    }

    await user.update({ isVerified, checkmarkType });
    await AdminAuditLog.create({
      actorId: request.user!.sub,
      title: `Checkmark ${isVerified ? 'granted' : 'withheld'} for ${user.fullName}`,
      content: `${user.fullName} (${user.email}) checkmark ${isVerified ? 'granted' : 'withheld'}`,
      status: 'success',
      meta: JSON.stringify({ targetUserId: userId, isVerified, checkmarkType }),
    });
    return created(reply, { isVerified, checkmarkType }, `Checkmark ${isVerified ? 'granted' : 'withheld'}`);
  } catch (err: any) {
    return error(reply, 500, 'CHECKMARK_FAILED', 'Failed to update checkmark');
  }
};
