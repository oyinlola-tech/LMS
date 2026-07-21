import { userRepository } from '../../../repositories/user.repository';
import { generateOtp, hashOtp } from '../../../utils/otp.util';
import { sendEmail, templates } from '../../../services/mail';
import { Otp } from '../../../models/Otp.model';
import { logger } from '../../../core/loggers';

export interface UpdateEmailResult {
  email: string;
}

export class UpdateEmailCommand {
  async execute(params: {
    userId: string;
    email: string;
  }): Promise<UpdateEmailResult> {
    const normalizedEmail = String(params.email).trim().toLowerCase();

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      const err: any = new Error('Email already in use');
      err.code = 'EMAIL_EXISTS';
      err.statusCode = 409;
      throw err;
    }

    const user = await userRepository.findById(params.userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    user.email = normalizedEmail;
    user.isEmailVerified = false;
    await user.save();

    await Otp.destroy({ where: { UserId: user.id, purpose: 'verify_email' } });

    const code = generateOtp();
    const codeHash = await hashOtp(code);
    const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000).toISOString();
    await Otp.create({ UserId: user.id, codeHash, expiresAt, purpose: 'verify_email' });

    try {
      await sendEmail({
        to: user.email,
        ...templates.otpVerify({ code, minutes: otpExpiryMinutes, courseUrl: undefined }),
      });
    } catch (mailErr: any) {
      logger.error('[users] email-change OTP email failed:', mailErr.message);
    }

    return { email: user.email };
  }
}

export const updateEmailCommand = new UpdateEmailCommand();
