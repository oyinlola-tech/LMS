import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listGroups, listMyGroups, getGroup, createGroup, updateGroup, deleteGroup, joinGroup, leaveGroup, getGroupMessages, sendGroupMessage, getGroupMembers, subscribeToGroup, unsubscribeFromGroup, getGroupSubscribers } from '../controllers/discussionGroup.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listGroups);

  fastify.get('/mine', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listMyGroups);

  fastify.get('/:id', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getGroup);

  fastify.post('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createGroup);

  fastify.put('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateGroup);

  fastify.delete('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteGroup);

  fastify.post('/:id/join', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, joinGroup);

  fastify.post('/:id/leave', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, leaveGroup);

  fastify.get('/:id/messages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getGroupMessages);

  fastify.post('/:id/messages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, sendGroupMessage);

  fastify.get('/:id/members', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getGroupMembers);

  fastify.post('/:id/subscribe', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, subscribeToGroup);

  fastify.post('/:id/unsubscribe', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, unsubscribeFromGroup);

  fastify.get('/:id/subscribers', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getGroupSubscribers);
}