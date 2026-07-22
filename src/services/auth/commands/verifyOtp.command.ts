import crypto from 'crypto';
import { userRepository } from '../../../repositories/user.repository';
import { otpRepository } from '../../../repositories/otp.repository';
import { verifyOtp } from '../../../utils/otp.util';
import { signToken } from '../../../utils/token.util';
import { sendEmail, templates } from '../../../services/mail';
import { normalizeEmail } from '../../../validators/auth.validator';
import { logger } from '../../../core/loggers';

const hashDevice = (userAgent: string | undefined, ip: string): string => {
  const data = `${userAgent || ''}-${ip || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};

export interface VerifyOtpCommandResult {
  token?: string;
  message: string;
}

export class VerifyOtpCommand {
  async execute(params: {
    identifier: string;
    code: string;
    ip: string;
    userAgent: string | undefined;
  }): Promise<VerifyOtpCommandResult> {
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

    const verifyOtpRecord = await otpRepository.findLatestByUserId(user.id, 'verify_email');
    const loginOtpRecord = await otpRepository.findLatestByUserId(user.id, 'login');

    let otp: any = verifyOtpRecord;
    let isLoginOtp = false;

    if (!otp && loginOtpRecord) {
      otp = loginOtpRecord;
      isLoginOtp = true;
    }

    if (!otp || otp.expiresAt < new Date()) {
      const error: any = new Error('OTP expired or invalid');
      error.code = 'OTP_INVALID';
      error.statusCode = 400;
      throw error;
    }

    const isOtpValid = await verifyOtp(otp.codeHash, String(params.code));
    if (!isOtpValid) {
      const error: any = new Error('OTP invalid');
      error.code = 'OTP_INVALID';
      error.statusCode = 400;
      throw error;
    }

    if (!isLoginOtp) {
      user.isEmailVerified = true;
      user.trustedDeviceHash = hashDevice(params.userAgent, params.ip);
      user.trustedIp = params.ip;
      await user.save();
    }

    if (isLoginOtp) {
      user.trustedDeviceHash = hashDevice(params.userAgent, params.ip);
      user.trustedIp = params.ip;
      await user.save();
    }

    await otp.destroy();

    if (!isLoginOtp) {
      const emailPayload = templates.emailVerified();
      sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
        logger.error('[auth] email-verified notification failed (non-blocking):', mailErr?.message);
      });
      return { message: 'Email verified' };
    }

    const token = signToken(user);
    return { token, message: 'Login successful' };
  }
}

export const verifyOtpCommand = new VerifyOtpCommand();
