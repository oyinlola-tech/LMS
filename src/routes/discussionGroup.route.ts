import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listGroups, listMyGroups, getGroup, createGroup, updateGroup, deleteGroup, joinGroup, leaveGroup, getGroupMessages, getGroupMembers, subscribeToGroup, unsubscribeFromGroup, getGroupSubscribers } from '../controllers/discussionGroup.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listGroups);

  fastify.get('/mine', { preHandler: [fastify.authenticate] }, listMyGroups);

  fastify.get('/:id', getGroup);

  fastify.post('/', { preHandler: [fastify.authenticate] }, createGroup);

  fastify.put('/:id', { preHandler: [fastify.authenticate] }, updateGroup);

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, deleteGroup);

  fastify.post('/:id/join', { preHandler: [fastify.authenticate] }, joinGroup);

  fastify.post('/:id/leave', { preHandler: [fastify.authenticate] }, leaveGroup);

  fastify.get('/:id/messages', { preHandler: [fastify.authenticate] }, getGroupMessages);

  fastify.get('/:id/members', { preHandler: [fastify.authenticate] }, getGroupMembers);

  fastify.post('/:id/subscribe', { preHandler: [fastify.authenticate] }, subscribeToGroup);

  fastify.post('/:id/unsubscribe', { preHandler: [fastify.authenticate] }, unsubscribeFromGroup);

  fastify.get('/:id/subscribers', { preHandler: [fastify.authenticate] }, getGroupSubscribers);
}
