import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { registerCommand } from '../services/auth/commands/register.command';
import { loginCommand } from '../services/auth/commands/login.command';
import { verifyOtpCommand } from '../services/auth/commands/verifyOtp.command';
import { resendOtpCommand } from '../services/auth/commands/resendOtp.command';
import { forgotPasswordCommand } from '../services/auth/commands/forgotPassword.command';
import { resetPasswordCommand } from '../services/auth/commands/resetPassword.command';
import { logoutCommand } from '../services/auth/commands/logout.command';
import { AppError } from '../errors';
import {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/auth.validator';
import type { RegisterBody, LoginBody, VerifyOtpBody, ResendOtpBody, ForgotPasswordBody, ResetPasswordBody } from '../types';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/register', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as RegisterBody;
    const validation = validateRegister(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, validation.errorCode!, validation.errorMessage!);
    }
    try {
      const result = await registerCommand.execute(body);
      return created(reply, { userId: result.userId }, 'Registered. Please verify your email with the OTP.');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'EMAIL_IN_USE') {
        return error(reply, 409, err.code, err.message);
      }
      return error(reply, 500, 'REGISTER_FAILED', 'Registration failed');
    }
  });

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as LoginBody;
    const validation = validateLogin(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, validation.errorCode!, validation.errorMessage!);
    }
    try {
      const ip = request.ip || '';
      const result = await loginCommand.execute({
        identifier: body.identifier,
        password: body.password,
        ip,
        userAgent: request.headers['user-agent'] as string,
      });
      if (result.requiresOtp) {
        return ok(reply, { requiresOtp: true, userId: result.userId }, 'Verification code sent to your email');
      }
      return ok(reply, { token: result.token }, 'Login successful');
    } catch (err: unknown) {
      if (err instanceof AppError && ['INVALID_CREDENTIALS', 'ACCOUNT_INACTIVE', 'EMAIL_NOT_VERIFIED'].includes(err.code)) {
        return error(reply, err.statusCode || 401, err.code, err.message);
      }
      return error(reply, 500, 'LOGIN_FAILED', 'Login failed');
    }
  });

  fastify.post('/verify-otp', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as VerifyOtpBody;
    const validation = validateVerifyOtp(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, validation.errorCode!, validation.errorMessage!);
    }
    try {
      const ip = request.ip || '';
      const result = await verifyOtpCommand.execute({
        identifier: body.identifier,
        code: body.code,
        ip,
        userAgent: request.headers['user-agent'] as string,
      });
      if (result.token) {
        return ok(reply, { token: result.token }, result.message);
      }
      return ok(reply, null, result.message);
    } catch (err: unknown) {
      if (err instanceof AppError && ['OTP_INVALID', 'NOT_FOUND'].includes(err.code)) {
        return error(reply, err.statusCode || 400, err.code, err.message);
      }
      return error(reply, 500, 'OTP_VERIFY_FAILED', 'OTP verification failed');
    }
  });

  fastify.post('/resend-otp', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as ResendOtpBody;
    const validation = validateResendOtp(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, validation.errorCode!, validation.errorMessage!);
    }
    try {
      await resendOtpCommand.execute({ identifier: body.identifier });
      return ok(reply, null, 'OTP resent');
    } catch (err: unknown) {
      if (err instanceof AppError && ['NOT_FOUND', 'EMAIL_ALREADY_VERIFIED', 'RATE_LIMITED'].includes(err.code)) {
        return error(reply, err.statusCode || 400, err.code, err.message);
      }
      return error(reply, 500, 'OTP_RESEND_FAILED', 'Resend failed');
    }
  });

  fastify.post('/forgot-password', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as ForgotPasswordBody;
    const validation = validateForgotPassword(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, validation.errorCode!, validation.errorMessage!);
    }
    try {
      await forgotPasswordCommand.execute({ email: body.email });
      return ok(reply, null, 'If the email exists, you will receive a reset link');
    } catch (err) {
      request.log.error(err, '[auth] Forgot password command failed');
      return error(reply, 500, 'FORGOT_PASSWORD_FAILED', 'Request failed');
    }
  });

  fastify.post('/reset-password', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as ResetPasswordBody;
    const validation = validateResetPassword(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, validation.errorCode!, validation.errorMessage!);
    }
    try {
      await resetPasswordCommand.execute({ token: body.token, password: body.password });
      return ok(reply, null, 'Password reset successful');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'TOKEN_INVALID') {
        return error(reply, 400, err.code, err.message);
      }
      return error(reply, 500, 'RESET_FAILED', 'Reset failed');
    }
  });

  fastify.get('/google', async (_request, reply) => {
    return reply.status(503).send({ error: 'OAUTH_UNAVAILABLE', message: 'OAuth is handled by the frontend' });
  });

  fastify.get('/google/callback', async (_request, reply) => {
    return reply.status(503).send({ error: 'OAUTH_UNAVAILABLE', message: 'OAuth is handled by the frontend' });
  });

  fastify.get('/github', async (_request, reply) => {
    return reply.status(503).send({ error: 'OAUTH_UNAVAILABLE', message: 'OAuth is handled by the frontend' });
  });

  fastify.get('/github/callback', async (_request, reply) => {
    return reply.status(503).send({ error: 'OAUTH_UNAVAILABLE', message: 'OAuth is handled by the frontend' });
  });

  fastify.get('/apple', async (_request, reply) => {
    return reply.status(503).send({ error: 'OAUTH_UNAVAILABLE', message: 'OAuth is handled by the frontend' });
  });

  fastify.get('/apple/callback', async (_request, reply) => {
    return reply.status(503).send({ error: 'OAUTH_UNAVAILABLE', message: 'OAuth is handled by the frontend' });
  });

  fastify.post('/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    await logoutCommand.execute();
    return ok(reply, null, 'Logged out');
  });
}
