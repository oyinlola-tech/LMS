import { DiscussionThread, DiscussionReply } from '../../../models';
import { sanitizeRichText } from '../../../utils/sanitize.util';

export class CreateReplyCommand {
  async execute(userId: string, threadId: string, body: string): Promise<DiscussionReply> {
    if (!body) {
      const err: any = new Error('body is required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    const thread = await DiscussionThread.findByPk(threadId);
    if (!thread) {
      const err: any = new Error('Thread not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    return DiscussionReply.create({
      DiscussionThreadId: thread.id,
      UserId: userId,
      body: sanitizeRichText(String(body).trim()),
    });
  }
}
export const createReplyCommand = new CreateReplyCommand();
