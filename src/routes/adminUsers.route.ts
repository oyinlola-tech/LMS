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
  fastify.get('/', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listUsers);

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, createUser);

  fastify.get('/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getUserDetail);

  fastify.get('/:id/activity', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getUserActivity);

  fastify.get('/:id/role-history', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getUserRoleHistory);

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getUserNotes);

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, addUserNote);

  fastify.get('/:id/metrics', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getUserMetrics);

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, deleteUser);

  fastify.patch('/:id/status', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, updateUserStatus);

  fastify.patch('/:id/role', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, updateUserRole);

  fastify.patch('/:id/team', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, updateUserTeam);
}