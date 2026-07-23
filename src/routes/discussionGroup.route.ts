import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { DiscussionGroup, GroupMember, DiscussionMessage, ThreadSubscription, User } from '../models';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { q, createdBy } = request.query as { q?: string; createdBy?: string };
      const where: any = { isPublic: true };
      if (q) where.name = { [Op.iLike]: `%${q}%` };
      if (createdBy) where.createdById = createdBy;
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
    } catch (err) {
      request.log.error(err, 'GROUPS_LIST_FAILED');
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
    } catch (err) {
      request.log.error(err, 'MY_GROUPS_FAILED');
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
      if (!group.isPublic) return error(reply, 403, 'FORBIDDEN', 'This group is private');
      return ok(reply, group, 'Group loaded');
    } catch (err) {
      request.log.error(err, 'GROUP_GET_FAILED');
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
    } catch (err) {
      request.log.error(err, 'GROUP_CREATE_FAILED');
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
    } catch (err) {
      request.log.error(err, 'GROUP_UPDATE_FAILED');
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
    } catch (err) {
      request.log.error(err, 'GROUP_DELETE_FAILED');
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
    } catch (err) {
      request.log.error(err, 'GROUP_JOIN_FAILED');
      return error(reply, 500, 'GROUP_JOIN_FAILED', 'Failed to join group');
    }
  });

  fastify.post('/:id/leave', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await GroupMember.destroy({ where: { groupId: id, userId: request.user!.sub } });
      return ok(reply, null, 'Left group');
    } catch (err) {
      request.log.error(err, 'GROUP_LEAVE_FAILED');
      return error(reply, 500, 'GROUP_LEAVE_FAILED', 'Failed to leave group');
    }
  });

  fastify.get('/:id/messages', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const membership = await GroupMember.findOne({ where: { groupId: id, userId: request.user!.sub } });
      if (!membership) return error(reply, 403, 'FORBIDDEN', 'You must be a member to view messages');
      const { limit, before } = request.query as { limit?: string; before?: string };
      const where: any = { groupId: id };
      if (before) where.id = { [Op.lt]: before };
      const messages = await DiscussionMessage.findAll({
        where,
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }],
        order: [['createdAt', 'DESC']],
        limit: Math.min(Number(limit) || 50, 100),
      });
      return ok(reply, messages.reverse(), 'Messages loaded');
    } catch (err) {
      request.log.error(err, 'MESSAGES_LIST_FAILED');
      return error(reply, 500, 'MESSAGES_LIST_FAILED', 'Failed to load messages');
    }
  });

  fastify.get('/:id/members', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const group = await DiscussionGroup.findByPk(id, { attributes: ['isPublic'] });
      if (!group) return error(reply, 404, 'NOT_FOUND', 'Group not found');
      if (!group.isPublic) {
        const membership = await GroupMember.findOne({ where: { groupId: id, userId: request.user!.sub } });
        if (!membership) return error(reply, 403, 'FORBIDDEN', 'Private group');
      }
      const members = await GroupMember.findAll({
        where: { groupId: id },
        include: [{ model: User, as: 'member', attributes: ['id', 'fullName', 'avatarUrl'] }],
      });
      return ok(reply, members, 'Members loaded');
    } catch (err) {
      request.log.error(err, 'MEMBERS_LIST_FAILED');
      return error(reply, 500, 'MEMBERS_LIST_FAILED', 'Failed to load members');
    }
  });

  fastify.post('/:id/subscribe', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const existing = await ThreadSubscription.findOne({ where: { groupId: id, userId: request.user!.sub } });
      if (existing) return error(reply, 409, 'ALREADY_SUBSCRIBED', 'Already subscribed');
      await ThreadSubscription.create({ groupId: id, userId: request.user!.sub });
      return created(reply, null, 'Subscribed');
    } catch (err) {
      request.log.error(err, 'SUBSCRIBE_FAILED');
      return error(reply, 500, 'SUBSCRIBE_FAILED', 'Failed to subscribe');
    }
  });

  fastify.post('/:id/unsubscribe', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await ThreadSubscription.destroy({ where: { groupId: id, userId: request.user!.sub } });
      return ok(reply, null, 'Unsubscribed');
    } catch (err) {
      request.log.error(err, 'UNSUBSCRIBE_FAILED');
      return error(reply, 500, 'UNSUBSCRIBE_FAILED', 'Failed to unsubscribe');
    }
  });

  fastify.get('/:id/subscribers', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const group = await DiscussionGroup.findByPk(id, { attributes: ['isPublic'] });
      if (!group) return error(reply, 404, 'NOT_FOUND', 'Group not found');
      if (!group.isPublic) {
        const membership = await GroupMember.findOne({ where: { groupId: id, userId: request.user!.sub } });
        if (!membership) return error(reply, 403, 'FORBIDDEN', 'Private group');
      }
      const subs = await ThreadSubscription.findAll({
        where: { groupId: id },
        include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }],
      });
      return ok(reply, subs, 'Subscribers loaded');
    } catch (err) {
      request.log.error(err, 'SUBSCRIBERS_LIST_FAILED');
      return error(reply, 500, 'SUBSCRIBERS_LIST_FAILED', 'Failed to load subscribers');
    }
  });
}
