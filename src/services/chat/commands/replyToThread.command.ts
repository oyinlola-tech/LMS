import { MessageThread, Message } from '../../../models';
import { sendChatMessageToRecipients } from '../../../utils/wsHub.util';
import { containsFlaggedWords, MAX_MESSAGE_LENGTH } from '../../../utils/profanity.util';

export class ReplyToThreadCommand {
  async execute(userId: string, threadId: string, body: string, attachment?: { url?: string; type?: string; name?: string }): Promise<Message> {
    if (!body && !attachment?.url) {
      const err: any = new Error('body or attachment is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (body && body.length > MAX_MESSAGE_LENGTH) {
      const err: any = new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
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

    const flagged = body ? containsFlaggedWords(body) : false;
    const message = await Message.create({
      MessageThreadId: thread.id,
      senderId: userId,
      body: body || '',
      attachmentUrl: attachment?.url || null,
      attachmentType: attachment?.type || null,
      attachmentName: attachment?.name || null,
      flagged,
    });
    thread.lastMessageAt = message.createdAt.toISOString();
    await thread.save();

    sendChatMessageToRecipients({
      threadId: thread.id,
      senderId: userId,
      recipientIds: [thread.userAId, thread.userBId],
      body: body || '',
      createdAt: message.createdAt,
    });

    return message;
  }
}
export const replyToThreadCommand = new ReplyToThreadCommand();
