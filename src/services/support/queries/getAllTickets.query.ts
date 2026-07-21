import { SupportTicket } from '../../../models';

export class GetAllTicketsQuery {
  async execute(): Promise<SupportTicket[]> {
    return SupportTicket.findAll({ order: [['createdAt', 'DESC']] });
  }
}
export const getAllTicketsQuery = new GetAllTicketsQuery();
