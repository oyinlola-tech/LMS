import crypto from 'crypto';
import { userRepository } from '../../../repositories/user.repository';
import { otpRepository } from '../../../repositories/otp.repository';
import { hashPassword } from '../../../utils/password.util';
import { generateOtp, hashOtp } from '../../../utils/otp.util';
import { generateStudentId, generateTutorId, generateAdminId } from '../../../utils/idGenerator.util';
import { sendEmail, templates } from '../../../services/mail';
import { normalizeEmail } from '../../../validators/auth.validator';
import { UserRole } from '../../../enums';
import { User, Follow } from '../../../models';
import { logger } from '../../../core/loggers';

const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);

export class RegisterCommand {
  async execute(params: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ userId: string }> {
    const normalizedEmail = normalizeEmail(params.email);

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      const error: any = new Error('Email already in use');
      error.code = 'EMAIL_IN_USE';
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(params.password);

    const role = params.role || UserRole.LEARNER;
    const studentId = role === UserRole.LEARNER ? await generateStudentId() : null;
    const tutorId = role === UserRole.TUTOR ? await generateTutorId() : null;
    const adminId = (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) ? await generateAdminId() : null;
    const isVerified = role === UserRole.TUTOR || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
    const checkmarkType = role === UserRole.TUTOR ? 'blue' : (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN ? 'black' : null);

    const user = await userRepository.create({
      fullName: String(params.fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      studentId,
      tutorId,
      adminId,
      isVerified,
      checkmarkType,
      isLegacyUser: role !== UserRole.LEARNER,
    });

    const code = generateOtp();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await otpRepository.create({ UserId: user.id, codeHash, expiresAt, purpose: 'verify_email' });

    const emailPayload = templates.otpVerify({ code, minutes: otpExpiryMinutes, courseUrl: undefined });
    sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
      logger.error('[Auth] OTP email failed (non-blocking):', mailErr?.message);
    });

    try {
      const superAdmin = await User.findOne({ where: { role: UserRole.SUPER_ADMIN }, order: [['createdAt', 'ASC']] });
      if (superAdmin && superAdmin.id !== user.id) {
        await Follow.findOrCreate({
          where: { followerId: user.id, followingId: superAdmin.id },
        });
      }
    } catch (err) {
      logger.error('[Auth] Auto-follow superadmin failed (non-blocking):', err);
    }

    return { userId: user.id };
  }
}

export const registerCommand = new RegisterCommand();
