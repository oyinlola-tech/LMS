import { signToken } from '../../../utils/token.util';
import { sendEmail, templates } from '../../../services/mail';
import { logSecurityEvent } from '../../../utils/audit.util';
import { logger } from '../../../core/loggers';

export interface GitHubOAuthCallbackParams {
  err: Error | null;
  user: any;
  ip: string;
  userAgent: string | undefined;
  hasError: boolean;
  errorDescription?: string;
}

import { OAuthCallbackResult } from '../../../types';

export class GitHubOAuthCallbackCommand {
  async execute(params: GitHubOAuthCallbackParams): Promise<OAuthCallbackResult> {
    if (params.hasError) {
      await logSecurityEvent({
        title: 'OAuth denied',
        content: `GitHub OAuth denied: ${params.errorDescription || 'Access denied by user'}`,
        meta: { provider: 'github', ip: params.ip },
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
        content: 'GitHub OAuth failed during callback',
        meta: { provider: 'github', ip: params.ip },
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
      logger.warn('[Auth] Failed to send GitHub login alert email:', emailErr?.message);
    }

    const redirect = process.env.OAUTH_SUCCESS_REDIRECT;
    if (redirect) {
      const url = redirect + (redirect.includes('?') ? '&' : '?') + 'token=' + token;
      return { redirectUrl: url };
    }

    return { token };
  }
}

export const githubOAuthCallbackCommand = new GitHubOAuthCallbackCommand();
