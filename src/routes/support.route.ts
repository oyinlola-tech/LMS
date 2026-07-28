import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  addTicketMessage,
} from '../controllers/support.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/tickets', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createTicket);

  fastify.get('/tickets', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listTickets);

  fastify.get('/tickets/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getTicket);

  fastify.put('/tickets/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateTicket);

  fastify.post('/tickets/:id/messages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addTicketMessage);
}