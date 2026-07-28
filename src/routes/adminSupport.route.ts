import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listTickets, getTicketDetail } from '../controllers/adminSupport.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/tickets', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listTickets);

  fastify.get('/tickets/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getTicketDetail);
}