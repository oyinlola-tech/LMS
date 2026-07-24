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
  fastify.post('/tickets', { preHandler: [fastify.authenticate] }, createTicket);

  fastify.get('/tickets', { preHandler: [fastify.authenticate] }, listTickets);

  fastify.get('/tickets/:id', { preHandler: [fastify.authenticate] }, getTicket);

  fastify.put('/tickets/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, updateTicket);

  fastify.post('/tickets/:id/messages', { preHandler: [fastify.authenticate] }, addTicketMessage);
}