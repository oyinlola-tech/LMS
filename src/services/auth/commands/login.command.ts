import crypto from 'crypto';
import { userRepository } from '../../../repositories/user.repository';
import { otpRepository } from '../../../repositories/otp.repository';
import { verifyPassword } from '../../../utils/password.util';
import { signToken } from '../../../utils/token.util';
import { generateOtp, hashOtp } from '../../../utils/otp.util';
import { sendEmail, templates } from '../../../services/mail';
import { logSecurityEvent } from '../../../utils/audit.util';
import { normalizeEmail } from '../../../validators/auth.validator';
import { logger } from '../../../core/loggers';

const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);

const hashDevice = (userAgent: string | undefined, ip: string): string => {
  const data = `${userAgent || ''}-${ip || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};

const isNewDeviceOrIp = (user: any, userAgent: string | undefined, ip: string): boolean => {
  const currentHash = hashDevice(userAgent, ip);
  const deviceChanged = !user.trustedDeviceHash || user.trustedDeviceHash !== currentHash;
  return deviceChanged || (!user.trustedIp || user.trustedIp !== ip);
};

export interface LoginCommandResult {
  token?: string;
  requiresOtp?: boolean;
  userId?: string;
}

export class LoginCommand {
  async execute(params: {
    identifier: string;
    password: string;
    ip: string;
    userAgent: string | undefined;
  }): Promise<LoginCommandResult> {
    const isEmail = String(params.identifier).includes('@');
    let user: any;

    if (isEmail) {
      const normalizedEmail = normalizeEmail(params.identifier);
      user = await userRepository.findByEmail(normalizedEmail);
    } else {
      user = await userRepository.findByStudentId(String(params.identifier).trim());
    }

    if (!user || !user.passwordHash) {
      await logSecurityEvent({
        title: 'Failed login attempt',
        content: `Login failed for ${params.identifier} from ${params.ip}`,
        meta: { ip: params.ip, userAgent: params.userAgent || '' },
        actorId: undefined,
      });
      const error: any = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    if (user.status && user.status !== 'active') {
      await logSecurityEvent({
        title: 'Login blocked (inactive account)',
        content: `Login blocked for ${user.email} (status: ${user.status})`,
        meta: { userId: user.id, status: user.status, ip: params.ip },
        actorId: undefined,
      });
      const error: any = new Error('Account is not active');
      error.code = 'ACCOUNT_INACTIVE';
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, params.password);
    if (!isPasswordValid) {
      await logSecurityEvent({
        title: 'Failed login attempt',
        content: `Invalid password for ${user.email} from ${params.ip}`,
        meta: { userId: user.id, ip: params.ip, userAgent: params.userAgent || '' },
        actorId: undefined,
      });
      const error: any = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    if (!user.isEmailVerified) {
      const error: any = new Error('Please verify your email first');
      error.code = 'EMAIL_NOT_VERIFIED';
      error.statusCode = 403;
      throw error;
    }

    const requireLoginOtp = process.env.REQUIRE_LOGIN_OTP !== 'false';
    if (requireLoginOtp && !user.isLegacyUser && isNewDeviceOrIp(user, params.userAgent, params.ip)) {
      const code = generateOtp();
      const codeHash = await hashOtp(code);
      const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
      await otpRepository.create({ UserId: user.id, codeHash, expiresAt, purpose: 'login' });

      const emailPayload = templates.otpVerify({ code, minutes: otpExpiryMinutes, courseUrl: undefined });
      sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
        logger.error('[Auth] login OTP email failed (non-blocking):', mailErr?.message);
      });

      return { requiresOtp: true, userId: user.id };
    }

    if (!user.isLegacyUser) {
      await user.update({
        trustedDeviceHash: hashDevice(params.userAgent, params.ip),
        trustedIp: params.ip,
      });
    }

    const token = signToken(user);

    const emailPayload = templates.loginAlert({
      device: params.userAgent,
      location: params.ip,
    });
    sendEmail({ to: user.email, ...emailPayload }).catch((mailErr: Error) => {
      logger.error('[auth] login alert email failed:', mailErr?.message);
    });

    return { token };
  }
}

export const loginCommand = new LoginCommand();
