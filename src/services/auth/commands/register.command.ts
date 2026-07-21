import crypto from 'crypto';
import { userRepository } from '../../../repositories/user.repository';
import { otpRepository } from '../../../repositories/otp.repository';
import { hashPassword } from '../../../utils/password.util';
import { generateOtp, hashOtp } from '../../../utils/otp.util';
import { sendEmail, templates } from '../../../services/mail';
import { normalizeEmail } from '../../../validators/auth.validator';
import { UserRole } from '../../../enums';
import { logger } from '../../../core/loggers';

const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);

export class RegisterCommand {
  async execute(params: {
    fullName: string;
    email: string;
    password: string;
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

    const user = await userRepository.create({
      fullName: String(params.fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      role: UserRole.LEARNER,
      isLegacyUser: false,
    });

    const code = generateOtp();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await otpRepository.create({ UserId: user.id, codeHash, expiresAt, purpose: 'verify_email' });

    const emailPayload = templates.otpVerify({ code, minutes: otpExpiryMinutes, courseUrl: undefined });
    sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
      logger.error('[Auth] OTP email failed (non-blocking):', mailErr?.message);
    });

    return { userId: user.id };
  }
}

export const registerCommand = new RegisterCommand();
