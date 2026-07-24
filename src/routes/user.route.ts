import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { searchUsers, getUserById, getMe, updateProfile, updateAvatar, updateInterests, updateEmail, updateWeeklyGoal, updateFcmToken, getUserWarnings } from '../controllers/user.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/search', { preHandler: [fastify.authenticate] }, searchUsers);

  fastify.get('/:id', getUserById);

  fastify.get('/me', { preHandler: [fastify.authenticate] }, getMe);

  fastify.put('/me/profile', { preHandler: [fastify.authenticate] }, updateProfile);

  fastify.put('/me/avatar', { preHandler: [fastify.authenticate] }, updateAvatar);

  fastify.put('/me/interests', { preHandler: [fastify.authenticate] }, updateInterests);

  fastify.put('/me/email', { preHandler: [fastify.authenticate] }, updateEmail);

  fastify.put('/me/weekly-goal', { preHandler: [fastify.authenticate] }, updateWeeklyGoal);

  fastify.put('/fcm-token', { preHandler: [fastify.authenticate] }, updateFcmToken);

  fastify.get('/warnings', { preHandler: [fastify.authenticate] }, getUserWarnings);
}
