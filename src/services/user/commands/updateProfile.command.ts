import { userRepository } from '../../../repositories/user.repository';
import { sendEmail, templates } from '../../../services/mail';
import { logger } from '../../../core/loggers';

export class UpdateProfileCommand {
  async execute(params: {
    userId: string;
    bio?: string;
    skills?: string[] | string;
    avatarUrl?: string;
  }): Promise<void> {
    const user = await userRepository.findById(params.userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (typeof params.bio === 'string') {
      user.bio = params.bio.trim();
    }

    if (Array.isArray(params.skills)) {
      user.skills = params.skills.map((s: string) => String(s).trim()).filter(Boolean);
    } else if (typeof params.skills === 'string') {
      user.skills = params.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (typeof params.avatarUrl === 'string') {
      user.avatarUrl = params.avatarUrl.trim();
    }

    await user.save();

    try {
      const emailPayload = templates.profileUpdated();
      await sendEmail({ to: user.email, ...emailPayload });
    } catch (mailErr: any) {
      logger.error('[users] profile-updated email failed:', mailErr.message);
    }
  }
}

export const updateProfileCommand = new UpdateProfileCommand();
