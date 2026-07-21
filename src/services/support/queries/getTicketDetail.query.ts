import { SupportTicket, SupportTicketMessage, User } from '../../../models';

export class GetTicketDetailQuery {
  async execute(ticketId: string): Promise<SupportTicket | null> {
    return SupportTicket.findByPk(ticketId, {
      include: [{ model: SupportTicketMessage, include: [{ model: User, as: 'sender', attributes: ['id', 'fullName', 'avatarUrl'] }] }],
      order: [[SupportTicketMessage, 'createdAt', 'ASC']],
    });
  }
}
export const getTicketDetailQuery = new GetTicketDetailQuery();
