import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { User } from '../models';
import { ok, created, error } from '../utils/response.util';
import { adminCreateUserCommand } from '../services/admin/commands/createUser.command';
import { updateUserStatusCommand } from '../services/admin/commands/updateUserStatus.command';
import { updateUserRoleCommand } from '../services/admin/commands/updateUserRole.command';
import { updateUserTeamCommand } from '../services/admin/commands/updateUserTeam.command';
import { addUserNoteCommand } from '../services/admin/commands/addUserNote.command';
import { listUsersQuery } from '../services/admin/queries/listUsers.query';
import { getUserDetailQuery } from '../services/admin/queries/getUserDetail.query';
import { getUserActivityQuery } from '../services/admin/queries/getUserActivity.query';
import { getUserRoleHistoryQuery } from '../services/admin/queries/getUserRoleHistory.query';
import { getUserNotesQuery } from '../services/admin/queries/getUserNotes.query';
import { getUserMetricsQuery } from '../services/admin/queries/getUserMetrics.query';

import { hasPermission } from '../utils/permissions.util';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page, limit, role, status, q } = request.query as any;
      const result = await listUsersQuery.execute({ page: Number(page), limit: Number(limit), role, status, q });
      return ok(reply, result, 'Users loaded');
    } catch (err: any) {
      return error(reply, 500, 'ADMIN_USERS_FAILED', 'Failed to load users');
    }
  });

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await adminCreateUserCommand.execute(request.user!.sub, (request.body as any) || {});
      return ok(reply, result, 'User created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADMIN_USER_CREATE_FAILED', err.message || 'Failed to create user');
    }
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getUserDetailQuery.execute((request.params as any).id);
      if (!result) return error(reply, 404, 'NOT_FOUND', 'User not found');
      return ok(reply, result, 'User loaded');
    } catch (err: any) {
      return error(reply, 500, 'ADMIN_USER_FAILED', 'Failed to load user');
    }
  });

  fastify.get('/:id/activity', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const limit = Math.min(200, Math.max(1, Number((request.query as any).limit || 50)));
      const activities = await getUserActivityQuery.execute((request.params as any).id, limit);
      return ok(reply, activities, 'User activity loaded');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADMIN_ACTIVITY_FAILED', err.message || 'Failed to load activity');
    }
  });

  fastify.get('/:id/role-history', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const history = await getUserRoleHistoryQuery.execute((request.params as any).id);
      return ok(reply, history, 'Role history loaded');
    } catch (err: any) {
      return error(reply, 500, 'ROLE_HISTORY_FAILED', 'Failed to load role history');
    }
  });

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const notes = await getUserNotesQuery.execute((request.params as any).id);
      return ok(reply, notes, 'User notes loaded');
    } catch (err: any) {
      return error(reply, 500, 'NOTES_LOAD_FAILED', 'Failed to load notes');
    }
  });

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { note } = (request.body as Record<string, any>) || {};
      const entry = await addUserNoteCommand.execute((request.params as any).id, request.user!.sub, note);
      return created(reply, entry, 'Note added');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'NOTE_CREATE_FAILED', err.message || 'Failed to add note');
    }
  });

  fastify.get('/:id/metrics', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getUserMetricsQuery.execute((request.params as any).id);
      if (!result) return error(reply, 404, 'NOT_FOUND', 'User not found');
      return ok(reply, result, 'User metrics loaded');
    } catch (err: any) {
      return error(reply, 500, 'METRICS_FAILED', 'Failed to load metrics');
    }
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!hasPermission(request.user?.role, 'delete_user')) {
      return error(reply, 403, 'FORBIDDEN', 'Only super admin can delete users');
    }
    try {
      const { id } = request.params as any;
      const user = await User.findByPk(id);
      if (!user) return error(reply, 404, 'NOT_FOUND', 'User not found');
      if (user.role === UserRole.SUPER_ADMIN) return error(reply, 403, 'FORBIDDEN', 'Cannot delete super admin');
      await user.destroy();
      return ok(reply, null, 'User deleted');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADMIN_DELETE_FAILED', err.message || 'Failed to delete user');
    }
  });

  fastify.patch('/:id/status', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, reason } = (request.body as Record<string, any>) || {};
      await updateUserStatusCommand.execute(request.user!.sub, (request.params as any).id, status, reason);
      return ok(reply, null, 'User status updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADMIN_STATUS_FAILED', err.message || 'Failed to update status');
    }
  });

  fastify.patch('/:id/role', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { role } = (request.body as Record<string, any>) || {};
      if (role === UserRole.SUPER_ADMIN && !hasPermission(request.user?.role, 'create_admin')) {
        return error(reply, 403, 'FORBIDDEN', 'Only super admin can assign super admin role');
      }
      await updateUserRoleCommand.execute(request.user!.sub, (request.params as any).id, role);
      return ok(reply, null, 'User role updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADMIN_ROLE_FAILED', err.message || 'Failed to update role');
    }
  });

  fastify.patch('/:id/team', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { team } = (request.body as Record<string, any>) || {};
      await updateUserTeamCommand.execute(request.user!.sub, (request.params as any).id, team);
      return ok(reply, null, 'User team updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADMIN_TEAM_FAILED', err.message || 'Failed to update team');
    }
  });
}
