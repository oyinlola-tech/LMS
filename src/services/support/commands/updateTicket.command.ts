import { SupportTicket } from '../../../models';

export class UpdateTicketCommand {
  async execute(ticketId: string, body: { status?: string; priority?: string }): Promise<SupportTicket> {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      const err: any = new Error('Ticket not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const { status, priority } = body;
    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        const err: any = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
      ticket.status = status;
    }
    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        const err: any = new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
      ticket.priority = priority;
    }
    await ticket.save();
    return ticket;
  }
}
export const updateTicketCommand = new UpdateTicketCommand();
