import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Career } from '../models';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const careers = await Career.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        limit: 50,
      });
      return ok(reply, careers, 'Careers loaded');
    } catch {
      return error(reply, 500, 'CAREER_LIST_FAILED', 'Failed to load careers');
    }
  });

  fastify.get('/all', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const careers = await Career.findAll({ order: [['createdAt', 'DESC']] });
      return ok(reply, careers, 'All careers loaded');
    } catch {
      return error(reply, 500, 'CAREER_ALL_FAILED', 'Failed to load careers');
    }
  });

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const career = await Career.findByPk(id);
      if (!career) return error(reply, 404, 'NOT_FOUND', 'Career not found');
      return ok(reply, career, 'Career loaded');
    } catch {
      return error(reply, 500, 'CAREER_GET_FAILED', 'Failed to load career');
    }
  });

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as {
      title: string; description: string; location?: string; type?: string; isActive?: boolean;
    };
    if (!body.title || !body.description) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Title and description are required');
    }
    try {
      const career = await Career.create({
        title: body.title,
        description: body.description,
        location: body.location || null,
        type: (body.type as any) || 'full-time',
        isActive: body.isActive !== undefined ? body.isActive : true,
      });
      return created(reply, career, 'Career created');
    } catch {
      return error(reply, 500, 'CAREER_CREATE_FAILED', 'Failed to create career');
    }
  });

  fastify.put('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const career = await Career.findByPk(id);
      if (!career) return error(reply, 404, 'NOT_FOUND', 'Career not found');
      const body = (request.body || {}) as any;
      const updates: any = {};
      if (body.title !== undefined) updates.title = body.title;
      if (body.description !== undefined) updates.description = body.description;
      if (body.location !== undefined) updates.location = body.location;
      if (body.type !== undefined) updates.type = body.type;
      if (body.isActive !== undefined) updates.isActive = body.isActive;
      await career.update(updates);
      return ok(reply, career, 'Career updated');
    } catch {
      return error(reply, 500, 'CAREER_UPDATE_FAILED', 'Failed to update career');
    }
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const career = await Career.findByPk(id);
      if (!career) return error(reply, 404, 'NOT_FOUND', 'Career not found');
      await career.destroy();
      return ok(reply, null, 'Career deleted');
    } catch {
      return error(reply, 500, 'CAREER_DELETE_FAILED', 'Failed to delete career');
    }
  });
}
