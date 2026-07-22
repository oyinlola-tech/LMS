import { signToken } from '../../../utils/token.util';
import { sendEmail, templates } from '../../../services/mail';
import { logSecurityEvent } from '../../../utils/audit.util';
import { logger } from '../../../core/loggers';
import { OAuthCallbackResult } from '../../../types';

export interface AppleOAuthCallbackParams {
  err: Error | null;
  user: any;
  ip: string;
  userAgent: string | undefined;
  hasError: boolean;
  errorDescription?: string;
}

export class AppleOAuthCallbackCommand {
  async execute(params: AppleOAuthCallbackParams): Promise<OAuthCallbackResult> {
    if (params.hasError) {
      await logSecurityEvent({
        title: 'OAuth denied',
        content: `Apple OAuth denied: ${params.errorDescription || 'Access denied by user'}`,
        meta: { provider: 'apple', ip: params.ip },
        actorId: undefined,
      });
      const error: any = new Error(params.errorDescription || 'Access denied by user');
      error.code = 'OAUTH_DENIED';
      error.statusCode = 401;
      throw error;
    }

    if (params.err || !params.user) {
      await logSecurityEvent({
        title: 'OAuth failed',
        content: 'Apple OAuth failed during callback',
        meta: { provider: 'apple', ip: params.ip },
        actorId: undefined,
      });
      const error: any = new Error('OAuth provider error');
      error.code = 'OAUTH_FAILED';
      error.statusCode = 500;
      throw error;
    }

    const token = signToken(params.user);

    const emailPayload = templates.loginAlert({
      device: params.userAgent,
      location: params.ip,
    });
    try {
      await sendEmail({ to: params.user.email, ...emailPayload });
    } catch (emailErr: any) {
      logger.warn('[Auth] Failed to send Apple login alert email:', emailErr?.message);
    }

    const redirect = process.env.OAUTH_SUCCESS_REDIRECT;
    if (redirect) {
      const url = redirect + (redirect.includes('?') ? '&' : '?') + 'token=' + token;
      return { redirectUrl: url };
    }

    return { token };
  }
}

export const appleOAuthCallbackCommand = new AppleOAuthCallbackCommand();
