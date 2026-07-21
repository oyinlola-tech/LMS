import { userRepository, IUserAttributes } from '../../../repositories/user.repository';

export interface CurrentUserResult {
  id: string;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  skills?: string[] | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

export class GetCurrentUserQuery {
  async execute(userId: string): Promise<CurrentUserResult> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
    };
  }
}

export const getCurrentUserQuery = new GetCurrentUserQuery();
