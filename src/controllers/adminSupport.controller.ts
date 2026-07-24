import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { getAllTicketsQuery } from '../services/support/queries/getAllTickets.query';
import { getTicketDetailQuery } from '../services/support/queries/getTicketDetail.query';

export const listTickets = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tickets = await getAllTicketsQuery.execute();
    return ok(reply, tickets, 'Support tickets loaded');
  } catch (err: any) {
    return error(reply, 500, 'SUPPORT_LIST_FAILED', 'Failed to load support tickets');
  }
};

export const getTicketDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const ticket = await getTicketDetailQuery.execute((request.params as any).id);
    if (!ticket) return error(reply, 404, 'NOT_FOUND', 'Ticket not found');
    return ok(reply, ticket, 'Support ticket loaded');
  } catch (err: any) {
    return error(reply, 500, 'SUPPORT_LOAD_FAILED', 'Failed to load support ticket');
  }
};