import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { searchUsers, getUserById, getMe, updateProfile, updateAvatar, updateCover, updatePrivacy, updateInterests, updateEmail, updateWeeklyGoal, updateFcmToken, getUserWarnings, getNotificationPreferences, updateNotificationPreferences, changePassword } from '../controllers/user.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/search', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, searchUsers);

  fastify.get('/:id', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserById);

  fastify.get('/me', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getMe);

  fastify.put('/me/profile', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateProfile);

  fastify.put('/me/avatar', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateAvatar);

  fastify.put('/me/cover', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateCover);

  fastify.put('/me/privacy', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updatePrivacy);

  fastify.put('/me/interests', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateInterests);

  fastify.put('/me/email', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateEmail);

  fastify.put('/me/weekly-goal', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateWeeklyGoal);

  fastify.put('/fcm-token', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, updateFcmToken);

  fastify.get('/warnings', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserWarnings);

  fastify.get('/notification-preferences', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getNotificationPreferences);

  fastify.put('/notification-preferences', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateNotificationPreferences);

  fastify.put('/password', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, changePassword);
}
