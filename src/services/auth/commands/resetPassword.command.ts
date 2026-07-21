import { passwordResetRepository } from '../../../repositories/passwordReset.repository';
import { hashPassword } from '../../../utils/password.util';
import { verifyOtp } from '../../../utils/otp.util';
import { sendEmail, templates } from '../../../services/mail';
import { logger } from '../../../core/loggers';

export class ResetPasswordCommand {
  async execute(params: { token: string; password: string }): Promise<void> {
    const tokenString = String(params.token);
    const [resetId, tokenSecret] = tokenString.split('.', 2);
    if (!resetId || !tokenSecret) {
      const error: any = new Error('Token expired or invalid');
      error.code = 'TOKEN_INVALID';
      error.statusCode = 400;
      throw error;
    }

    const reset = await passwordResetRepository.findValidById(resetId);
    if (!reset || !reset.tokenHash) {
      const error: any = new Error('Token expired or invalid');
      error.code = 'TOKEN_INVALID';
      error.statusCode = 400;
      throw error;
    }

    const isValid = await verifyOtp(reset.tokenHash, String(tokenSecret));
    if (!isValid) {
      const error: any = new Error('Token expired or invalid');
      error.code = 'TOKEN_INVALID';
      error.statusCode = 400;
      throw error;
    }

    reset.usedAt = new Date();
    await reset.save();

    if (reset.User) {
      reset.User.passwordHash = await hashPassword(params.password);
      await reset.User.save();
    }

    try {
      if (reset.User) {
        const emailPayload = templates.passwordChanged();
        await sendEmail({ to: reset.User.email, ...emailPayload });
      }
    } catch (mailErr: any) {
      logger.error('[auth] password-changed notification failed:', mailErr.message);
    }
  }
}

export const resetPasswordCommand = new ResetPasswordCommand();
