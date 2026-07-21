import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { DiscussionGroup, GroupMember, User } from '../models';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { q } = request.query as { q?: string };
      const where: any = { isPublic: true };
      if (q) where.name = { [Op.iLike]: `%${q}%` };
      const groups = await DiscussionGroup.findAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'fullName', 'avatarUrl'] },
          { model: GroupMember, attributes: ['userId'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 50,
      });
      return ok(reply, groups, 'Groups loaded');
    } catch {
      return error(reply, 500, 'GROUPS_LIST_FAILED', 'Failed to load groups');
    }
  });

  fastify.get('/mine', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const memberships = await GroupMember.findAll({
        where: { userId: request.user!.sub },
        include: [{ model: DiscussionGroup, include: [{ model: User, as: 'creator', attributes: ['id', 'fullName', 'avatarUrl'] }] }],
      });
      const groups = memberships.map((m: any) => m.DiscussionGroup).filter(Boolean);
      return ok(reply, groups, 'My groups loaded');
    } catch {
      return error(reply, 500, 'MY_GROUPS_FAILED', 'Failed to load your groups');
    }
  });

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const group = await DiscussionGroup.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'fullName', 'avatarUrl'] },
          { model: GroupMember, include: [{ model: User, as: 'member', attributes: ['id', 'fullName', 'avatarUrl'] }] },
        ],
      });
      if (!group) return error(reply, 404, 'NOT_FOUND', 'Group not found');
      return ok(reply, group, 'Group loaded');
    } catch {
      return error(reply, 500, 'GROUP_GET_FAILED', 'Failed to load group');
    }
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = (request.body || {}) as { name: string; description?: string; courseId?: string; isPublic?: boolean };
      if (!body.name || !body.name.trim()) {
        return error(reply, 400, 'VALIDATION_ERROR', 'Group name is required');
      }
      const group = await DiscussionGroup.create({
        name: body.name.trim(),
        description: body.description || null,
        createdById: request.user!.sub,
        courseId: body.courseId || null,
        isPublic: body.isPublic !== undefined ? body.isPublic : true,
      });
      await GroupMember.create({ groupId: group.id, userId: request.user!.sub, role: 'admin' });
      return created(reply, group, 'Group created');
    } catch {
      return error(reply, 500, 'GROUP_CREATE_FAILED', 'Failed to create group');
    }
  });

  fastify.put('/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const membership = await GroupMember.findOne({ where: { groupId: id, userId: request.user!.sub, role: ['admin', 'moderator'] } });
      if (!membership) return error(reply, 403, 'FORBIDDEN', 'Only admins can edit this group');
      const body = (request.body || {}) as any;
      const updates: any = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.isPublic !== undefined) updates.isPublic = body.isPublic;
      await DiscussionGroup.update(updates, { where: { id } });
      const group = await DiscussionGroup.findByPk(id);
      return ok(reply, group, 'Group updated');
    } catch {
      return error(reply, 500, 'GROUP_UPDATE_FAILED', 'Failed to update group');
    }
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const membership = await GroupMember.findOne({ where: { groupId: id, userId: request.user!.sub, role: 'admin' } });
      if (!membership) return error(reply, 403, 'FORBIDDEN', 'Only the group admin can delete this group');
      await DiscussionGroup.destroy({ where: { id } });
      return ok(reply, null, 'Group deleted');
    } catch {
      return error(reply, 500, 'GROUP_DELETE_FAILED', 'Failed to delete group');
    }
  });

  fastify.post('/:id/join', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const group = await DiscussionGroup.findByPk(id);
      if (!group) return error(reply, 404, 'NOT_FOUND', 'Group not found');
      const existing = await GroupMember.findOne({ where: { groupId: id, userId: request.user!.sub } });
      if (existing) return error(reply, 409, 'ALREADY_MEMBER', 'You are already a member');
      await GroupMember.create({ groupId: id, userId: request.user!.sub });
      return created(reply, null, 'Joined group');
    } catch {
      return error(reply, 500, 'GROUP_JOIN_FAILED', 'Failed to join group');
    }
  });

  fastify.post('/:id/leave', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await GroupMember.destroy({ where: { groupId: id, userId: request.user!.sub } });
      return ok(reply, null, 'Left group');
    } catch {
      return error(reply, 500, 'GROUP_LEAVE_FAILED', 'Failed to leave group');
    }
  });

  fastify.get('/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const members = await GroupMember.findAll({
        where: { groupId: id },
        include: [{ model: User, as: 'member', attributes: ['id', 'fullName', 'avatarUrl'] }],
      });
      return ok(reply, members, 'Members loaded');
    } catch {
      return error(reply, 500, 'MEMBERS_LIST_FAILED', 'Failed to load members');
    }
  });
}
