import { SupportTicket } from '../../../models';

export class ListTicketsQuery {
  async execute(userId?: string, isAdmin?: boolean): Promise<SupportTicket[]> {
    const where = isAdmin ? {} : { UserId: userId };
    return SupportTicket.findAll({ where, order: [['createdAt', 'DESC']] });
  }
}
export const listTicketsQuery = new ListTicketsQuery();
