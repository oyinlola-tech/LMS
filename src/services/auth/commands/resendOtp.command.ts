import { userRepository } from '../../../repositories/user.repository';
import { otpRepository } from '../../../repositories/otp.repository';
import { generateOtp, hashOtp } from '../../../utils/otp.util';
import { sendEmail, templates } from '../../../services/mail';
import { normalizeEmail } from '../../../validators/auth.validator';
import { logger } from '../../../core/loggers';

const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const otpResendCooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);

export class ResendOtpCommand {
  async execute(params: { identifier: string }): Promise<void> {
    const isEmail = String(params.identifier).includes('@');
    let user: any;

    if (isEmail) {
      user = await userRepository.findByEmail(normalizeEmail(params.identifier));
    } else {
      user = await userRepository.findById(String(params.identifier).trim());
    }

    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (user.isEmailVerified) {
      const error: any = new Error('Email already verified');
      error.code = 'EMAIL_ALREADY_VERIFIED';
      error.statusCode = 400;
      throw error;
    }

    const latestOtp = await otpRepository.findLatestByUserId(user.id, 'verify_email');
    if (latestOtp && Date.now() - latestOtp.createdAt.getTime() < otpResendCooldownSeconds * 1000) {
      const error: any = new Error('Please wait before requesting a new code');
      error.code = 'RATE_LIMITED';
      error.statusCode = 429;
      throw error;
    }

    const code = generateOtp();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await otpRepository.create({ UserId: user.id, codeHash, expiresAt, purpose: 'verify_email' });

    const emailPayload = templates.otpResend({ code, minutes: otpExpiryMinutes, courseUrl: undefined });
    sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
      logger.error('[Auth] OTP resend email failed (non-blocking):', mailErr?.message);
    });
  }
}

export const resendOtpCommand = new ResendOtpCommand();
