import { SupportTicket } from '../../../models';

export class CreateInstructorTicketCommand {
  async execute(userId: string, body: { subject: string; message: string; priority?: string }): Promise<SupportTicket> {
    const { subject, message, priority } = body;
    if (!subject || !message) {
      const err: any = new Error('subject and message are required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    return SupportTicket.create({ UserId: userId, subject, message, priority: priority || 'medium', category: 'instructor' });
  }
}
export const createInstructorTicketCommand = new CreateInstructorTicketCommand();
