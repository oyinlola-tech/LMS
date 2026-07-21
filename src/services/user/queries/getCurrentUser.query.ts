import { User, UserInterest } from '../../../models';

export interface CurrentUserResult {
  id: string;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  skills?: string[] | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  studentId?: string | null;
  isEmailVerified: boolean;
  UserInterests?: Array<{ id: string; name: string }>;
}

export class GetCurrentUserQuery {
  async execute(userId: string): Promise<CurrentUserResult> {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const interests = await UserInterest.findAll({
      where: { UserId: userId },
      attributes: ['id', 'name'],
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills as unknown as string[],
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      location: user.location,
      studentId: user.studentId,
      isEmailVerified: user.isEmailVerified,
      UserInterests: interests.map((i: any) => ({ id: i.id, name: i.name })),
    };
  }
}

export const getCurrentUserQuery = new GetCurrentUserQuery();
