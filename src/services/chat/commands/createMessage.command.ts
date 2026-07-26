import { Op } from 'sequelize';
import { MessageThread, Message, User, Follow } from '../../../models';
import { sendChatMessageToRecipients } from '../../../utils/wsHub.util';
import { containsFlaggedWords, MAX_MESSAGE_LENGTH } from '../../../utils/profanity.util';

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
  async execute(userId: string, participantId: string, body: { subject?: string; message?: string; attachmentUrl?: string; attachmentType?: string; attachmentName?: string }): Promise<{ threadId: string; message: Message | null }> {
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

    const followsYou = await Follow.count({ where: { followerId: participantId, followingId: userId } });
    const youFollow = await Follow.count({ where: { followerId: userId, followingId: participantId } });
    if (!followsYou && !youFollow) {
      const err: any = new Error('You must follow each other to message');
      err.code = 'FOLLOW_REQUIRED';
      err.statusCode = 403;
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

    if (body.message && body.message.length > MAX_MESSAGE_LENGTH) {
      const err: any = new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
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
    if (body.message || body.attachmentUrl) {
      const flagged = body.message ? containsFlaggedWords(body.message) : false;
      newMessage = await Message.create({
        MessageThreadId: thread.id,
        senderId: userId,
        body: body.message || '',
        attachmentUrl: body.attachmentUrl || null,
        attachmentType: body.attachmentType || null,
        attachmentName: body.attachmentName || null,
        flagged,
      });
      thread.lastMessageAt = newMessage.createdAt;
      await thread.save();
      sendChatMessageToRecipients({
        threadId: thread.id,
        senderId: userId,
        recipientIds: [userId, participantId],
        body: body.message || '',
        createdAt: newMessage.createdAt,
      });
    }

    return { threadId: thread.id, message: newMessage };
  }
}
export const sendMessageCommand = new SendMessageCommand();
