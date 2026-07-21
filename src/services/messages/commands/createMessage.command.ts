import { Op } from 'sequelize';
import { MessageThread, Message, User } from '../../../models';
import { sendChatMessageToRecipients } from '../../../utils/wsHub.util';

const findThreadForUsers = async (userAId: string, userBId: string) => {
  return MessageThread.findOne({
    where: {
      [Op.or]: [
        { userAId, userBId },
        { userAId: userBId, userBId: userAId },
      ],
    },
  });
};

export class SendMessageCommand {
  async execute(userId: string, participantId: string, body: { subject?: string; message?: string }): Promise<{ threadId: string; message: Message | null }> {
    if (!participantId) {
      const err: any = new Error('participantId is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (String(participantId) === String(userId)) {
      const err: any = new Error('Cannot message yourself');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const otherUser = await User.findByPk(participantId, { attributes: ['id', 'status'] });
    if (!otherUser) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (otherUser.status && otherUser.status !== 'active') {
      const err: any = new Error('User is not active');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    let thread = await findThreadForUsers(userId, participantId);
    if (!thread) {
      thread = await MessageThread.create({
        userAId: userId,
        userBId: participantId,
        subject: body.subject || null,
        lastMessageAt: body.message ? new Date().toISOString() : null,
      });
    }

    let newMessage = null;
    if (body.message) {
      newMessage = await Message.create({
        MessageThreadId: thread.id,
        senderId: userId,
        body: body.message,
      });
      thread.lastMessageAt = newMessage.createdAt;
      await thread.save();
      sendChatMessageToRecipients({
        threadId: thread.id,
        senderId: userId,
        recipientIds: [userId, participantId],
        body: body.message,
        createdAt: newMessage.createdAt,
      });
    }

    return { threadId: thread.id, message: newMessage };
  }
}
export const sendMessageCommand = new SendMessageCommand();
