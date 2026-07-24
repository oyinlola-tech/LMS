import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listActiveCareers, listAllCareers, getCareer, createCareer, updateCareer, deleteCareer } from '../controllers/career.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listActiveCareers);

  fastify.get('/all', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, listAllCareers);

  fastify.get('/:id', getCareer);

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, createCareer);

  fastify.put('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, updateCareer);

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, deleteCareer);
}
