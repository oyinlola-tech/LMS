import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listActiveCareers, listAllCareers, getCareer, createCareer, updateCareer, deleteCareer } from '../controllers/career.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listActiveCareers);

  fastify.get('/all', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listAllCareers);

  fastify.get('/:id', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCareer);

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createCareer);

  fastify.put('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateCareer);

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteCareer);
}