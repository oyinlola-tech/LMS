import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { User, AdminAuditLog } from '../models';
import { hashPassword } from '../utils/password.util';
import { sendEmail, templates } from '../services/mail';
import { created, error } from '../utils/response.util';
import { UserRole } from '../enums';

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/create-tutor', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
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
      const user = await User.create({
        fullName: String(fullName).trim(),
        email: normalizedEmail,
        passwordHash,
        role: UserRole.TUTOR,
        isEmailVerified: true,
      });
      const emailPayload = templates.tutorCreated({ fullName: user.fullName });
      await sendEmail({ to: user.email, ...emailPayload });
      await (AdminAuditLog as any).create({
        actorId: request.user!.sub,
        title: 'New tutor created',
        content: `${user.fullName} (${user.email}) was created as a tutor.`,
        status: 'success',
        meta: JSON.stringify({ userId: user.id, role: UserRole.TUTOR }),
      });
      return created(reply, { userId: user.id }, 'Tutor created');
    } catch (err: any) {
      return error(reply, 500, 'CREATE_TUTOR_FAILED', 'Failed to create tutor');
    }
  });
}
