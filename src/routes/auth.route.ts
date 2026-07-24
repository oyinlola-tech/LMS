import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { register, login, verifyOtp, resendOtp, forgotPassword, resetPassword, googleOAuth, googleOAuthCallback, githubOAuth, githubOAuthCallback, appleOAuth, appleOAuthCallback, logout } from '../controllers/auth.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/register', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, register);

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, login);

  fastify.post('/verify-otp', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, verifyOtp);

  fastify.post('/resend-otp', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, resendOtp);

  fastify.post('/forgot-password', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, forgotPassword);

  fastify.post('/reset-password', {
    config: {
      rateLimit: {
        max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
        timeWindow: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
      },
    },
  }, resetPassword);

  fastify.get('/google', googleOAuth);

  fastify.get('/google/callback', googleOAuthCallback);

  fastify.get('/github', githubOAuth);

  fastify.get('/github/callback', githubOAuthCallback);

  fastify.get('/apple', appleOAuth);

  fastify.get('/apple/callback', appleOAuthCallback);

  fastify.post('/logout', logout);
}
