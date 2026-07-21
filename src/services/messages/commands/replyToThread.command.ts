import { MessageThread, Message } from '../../../models';
import { sendChatMessageToRecipients } from '../../../utils/wsHub.util';

export class ReplyToThreadCommand {
  async execute(userId: string, threadId: string, body: string): Promise<Message> {
    if (!body) {
      const err: any = new Error('body is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const thread = await MessageThread.findByPk(threadId);
    if (!thread) {
      const err: any = new Error('Thread not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (![thread.userAId, thread.userBId].includes(userId)) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const message = await Message.create({
      MessageThreadId: thread.id,
      senderId: userId,
      body,
    });
    thread.lastMessageAt = message.createdAt.toISOString();
    await thread.save();

    sendChatMessageToRecipients({
      threadId: thread.id,
      senderId: userId,
      recipientIds: [thread.userAId, thread.userBId],
      body,
      createdAt: message.createdAt,
    });

    return message;
  }
}
export const replyToThreadCommand = new ReplyToThreadCommand();
