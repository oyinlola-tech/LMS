import crypto from 'crypto';
import { userRepository } from '../../../repositories/user.repository';
import { passwordResetRepository } from '../../../repositories/passwordReset.repository';
import { hashOtp } from '../../../utils/otp.util';
import { sendEmail, templates } from '../../../services/mail';
import { normalizeEmail } from '../../../validators/auth.validator';
import { logger } from '../../../core/loggers';

const resetExpiryMinutes = Number(process.env.RESET_EXPIRY_MINUTES || 30);

export class ForgotPasswordCommand {
  async execute(params: { email: string }): Promise<void> {
    const user = await userRepository.findByEmail(normalizeEmail(params.email));
    if (!user) {
      return;
    }

    const tokenSecret = crypto.randomBytes(32).toString('hex');
    const tokenHash = await hashOtp(tokenSecret);
    const expiresAt = new Date(Date.now() + resetExpiryMinutes * 60 * 1000);
    const reset = await passwordResetRepository.create({
      UserId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetToken = `${reset.id}.${tokenSecret}`;
    const resetUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`
      : undefined;

    const emailPayload = templates.passwordReset({
      token: resetToken,
      minutes: resetExpiryMinutes,
      resetUrl,
    });
    sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
      logger.error('[Auth] password reset email failed (non-blocking):', mailErr?.message);
    });
  }
}

export const forgotPasswordCommand = new ForgotPasswordCommand();
