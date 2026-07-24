import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { createTicketCommand } from '../services/support/commands/createTicket.command';
import { updateTicketCommand } from '../services/support/commands/updateTicket.command';
import { addTicketMessageCommand } from '../services/support/commands/addTicketMessage.command';
import { listTicketsQuery } from '../services/support/queries/listTickets.query';
import { getTicketDetailQuery } from '../services/support/queries/getTicketDetail.query';

export async function createTicket(request: FastifyRequest, reply: FastifyReply) {
  try {
    const ticket = await createTicketCommand.execute(request.user!.sub, (request.body as any) || {});
    return created(reply, ticket, 'Support ticket created');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'SUPPORT_CREATE_FAILED', err.message || 'Failed to create support ticket');
  }
}

export async function listTickets(request: FastifyRequest, reply: FastifyReply) {
  try {
    const tickets = await listTicketsQuery.execute(request.user!.sub, request.user!.role === UserRole.ADMIN);
    return ok(reply, tickets, 'Support tickets loaded');
  } catch (err: any) {
    return error(reply, 500, 'SUPPORT_LIST_FAILED', 'Failed to load support tickets');
  }
}

export async function getTicket(request: FastifyRequest, reply: FastifyReply) {
  try {
    const ticket = await getTicketDetailQuery.execute((request.params as any).id);
    if (!ticket) return error(reply, 404, 'NOT_FOUND', 'Ticket not found');
    if (request.user!.role !== UserRole.ADMIN && ticket.UserId !== request.user!.sub) return error(reply, 403, 'FORBIDDEN', 'Forbidden');
    return ok(reply, ticket, 'Support ticket loaded');
  } catch (err: any) {
    return error(reply, 500, 'SUPPORT_LOAD_FAILED', 'Failed to load support ticket');
  }
}

export async function updateTicket(request: FastifyRequest, reply: FastifyReply) {
  try {
    const ticket = await updateTicketCommand.execute((request.params as any).id, (request.body as any) || {});
    return ok(reply, ticket, 'Support ticket updated');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'SUPPORT_UPDATE_FAILED', err.message || 'Failed to update support ticket');
  }
}

export async function addTicketMessage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { body } = (request.body as Record<string, any>) || {};
    const message = await addTicketMessageCommand.execute((request.params as any).id, request.user!.sub, request.user!.role, body);
    return created(reply, message, 'Message added');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'SUPPORT_MESSAGE_FAILED', err.message || 'Failed to add message');
  }
}
