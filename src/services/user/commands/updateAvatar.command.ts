import { userRepository } from '../../../repositories/user.repository';
import { sendEmail, templates } from '../../../services/mail';
import { logger } from '../../../core/loggers';

export interface UpdateAvatarResult {
  avatarUrl: string;
}

export class UpdateAvatarCommand {
  async execute(params: {
    userId: string;
    avatarUrl: string;
  }): Promise<UpdateAvatarResult> {
    const user = await userRepository.findById(params.userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    user.avatarUrl = String(params.avatarUrl).trim();
    await user.save();

    try {
      const emailPayload = templates.profileUpdated();
      await sendEmail({ to: user.email, ...emailPayload });
    } catch (mailErr: any) {
      logger.error('[users] avatar-updated email failed:', mailErr.message);
    }

    return { avatarUrl: user.avatarUrl };
  }
}

export const updateAvatarCommand = new UpdateAvatarCommand();
