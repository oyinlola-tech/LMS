import { SupportTicket } from '../../../models';

export class CreateTicketCommand {
  async execute(userId: string, body: { subject: string; message: string; priority?: string; category?: string }): Promise<SupportTicket> {
    const { subject, message, priority, category } = body;
    if (!subject || !message) {
      const err: any = new Error('subject and message are required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      const err: any = new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    return SupportTicket.create({
      UserId: userId,
      subject,
      message,
      priority: priority || 'medium',
      category: category || null,
    });
  }
}
export const createTicketCommand = new CreateTicketCommand();
