import { Op } from 'sequelize';
import crypto from 'crypto';
import { UserRole } from '../../../enums';
import { User, AdminAuditLog } from '../../../models';
import { sendEmail, templates } from '../../mail';
import { hashPassword } from '../../../utils/password.util';

export class AdminCreateUserCommand {
  async execute(actorId: string, body: { fullName: string; email: string; role: string; password?: string }): Promise<{ id: string; email: string; role: string }> {
    const { fullName, email, role, password } = body;
    if (!fullName || !email || !role) {
      const err: any = new Error('fullName, email, and role are required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (!['learner', 'tutor', 'admin'].includes(role)) {
      const err: any = new Error('invalid role');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      const err: any = new Error('Email already in use');
      err.code = 'EMAIL_EXISTS';
      err.statusCode = 409;
      throw err;
    }

    const tempPassword = password || crypto.randomBytes(6).toString('base64');
    const passwordHash = await hashPassword(tempPassword);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      role,
      isEmailVerified: true,
    });

    if (role === UserRole.ADMIN) {
      await sendEmail({ to: user.email, ...templates.adminCreated({ email: user.email, password: tempPassword }) });
    } else if (role === UserRole.TUTOR) {
      await sendEmail({ to: user.email, ...templates.tutorCreated({ fullName: user.fullName }) });
    } else {
      await sendEmail({
        to: user.email,
        subject: `Your ${process.env.APP_NAME} account is ready`,
        text: `Your ${process.env.APP_NAME} account was created. Email: ${user.email}. Temporary password: ${tempPassword}.`,
        html: `<p>Your ${process.env.APP_NAME} account was created.</p><p>Email: ${user.email}<br/>Temporary password: ${tempPassword}</p>`,
      });
    }

    await AdminAuditLog.create({
      actorId,
      title: 'User created',
      content: `${user.fullName} (${user.email}) created with role ${role}.`,
      status: 'success',
      meta: JSON.stringify({ userId: user.id, role }),
    });

    return { id: user.id, email: user.email, role: user.role };
  }
}
export const adminCreateUserCommand = new AdminCreateUserCommand();
