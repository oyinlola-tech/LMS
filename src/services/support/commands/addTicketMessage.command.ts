import { SupportTicket, SupportTicketMessage } from '../../../models';

export class AddTicketMessageCommand {
  async execute(ticketId: string, userId: string, userRole: string, body: string): Promise<SupportTicketMessage> {
    if (!body) {
      const err: any = new Error('body is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      const err: any = new Error('Ticket not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (userRole !== 'admin' && ticket.UserId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    return SupportTicketMessage.create({
      SupportTicketId: ticket.id,
      senderId: userId,
      senderRole: userRole === 'admin' ? 'admin' : 'user',
      body,
    });
  }
}
export const addTicketMessageCommand = new AddTicketMessageCommand();
