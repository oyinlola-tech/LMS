import { User, UserInterest, Follow } from '../../../models';

export interface CurrentUserResult {
  id: string;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  skills?: string[] | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  studentId?: string | null;
  tutorId?: string | null;
  adminId?: string | null;
  isPrivate: boolean;
  isVerified: boolean;
  checkmarkType?: string | null;
  isEmailVerified: boolean;
  followerCount: number;
  followingCount: number;
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

    const followerCount = await Follow.count({ where: { followingId: userId } });
    const followingCount = await Follow.count({ where: { followerId: userId } });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills as unknown as string[],
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      phoneNumber: user.phoneNumber,
      location: user.location,
      studentId: user.studentId,
      tutorId: user.tutorId,
      adminId: user.adminId,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      checkmarkType: user.checkmarkType,
      isEmailVerified: user.isEmailVerified,
      followerCount,
      followingCount,
      UserInterests: interests.map((i: any) => ({ id: i.id, name: i.name })),
    };
  }
}

export const getCurrentUserQuery = new GetCurrentUserQuery();
