import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import {
  listUsers,
  createUser,
  getUserDetail,
  getUserActivity,
  getUserRoleHistory,
  getUserNotes,
  addUserNote,
  getUserMetrics,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  updateUserTeam,
} from '../controllers/adminUsers.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('admin/pages/users.html');
    return listUsers(request, reply);
  });

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createUser);

  fastify.get('/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserDetail);

  fastify.get('/:id/activity', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('pages/workspace.html');
    return getUserActivity(request, reply);
  });

  fastify.get('/:id/role-history', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserRoleHistory);

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserNotes);

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addUserNote);

  fastify.get('/:id/metrics', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserMetrics);

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteUser);

  fastify.patch('/:id/status', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateUserStatus);

  fastify.patch('/:id/role', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateUserRole);

  fastify.patch('/:id/team', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateUserTeam);
}
