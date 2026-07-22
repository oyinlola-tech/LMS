import { User } from '../models/User.model';

export interface IUserAttributes {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string | null;
  role: string;
  isEmailVerified: boolean;
  isLegacyUser: boolean;
  status: string;
  bio?: string | null;
  skills?: string[] | null;
  avatarUrl?: string | null;
  trustedDeviceHash?: string | null;
  trustedIp?: string | null;
  googleId?: string | null;
  githubId?: string | null;
  save(): Promise<IUserAttributes>;
  update(data: Record<string, unknown>): Promise<IUserAttributes>;
}

export class UserRepository {
  async findByEmail(email: string): Promise<IUserAttributes | null> {
    const user = await User.findOne({ where: { email } });
    return user as unknown as IUserAttributes | null;
  }

  async findById(id: string): Promise<IUserAttributes | null> {
    const user = await User.findByPk(id);
    return user as unknown as IUserAttributes | null;
  }

  async findByGoogleId(googleId: string): Promise<IUserAttributes | null> {
    const user = await User.findOne({ where: { googleId } });
    return user as unknown as IUserAttributes | null;
  }

  async findByStudentId(studentId: string): Promise<IUserAttributes | null> {
    const user = await User.findOne({ where: { studentId } });
    return user as unknown as IUserAttributes | null;
  }

  async findByGithubId(githubId: string): Promise<IUserAttributes | null> {
    const user = await User.findOne({ where: { githubId } });
    return user as unknown as IUserAttributes | null;
  }

  async create(data: Record<string, unknown>): Promise<IUserAttributes> {
    const user = await User.create(data);
    return user as unknown as IUserAttributes;
  }

  async findByIdWithStatus(id: string): Promise<{ id: string; status: string } | null> {
    const user = await User.findByPk(id, { attributes: ['id', 'status'] });
    return user as unknown as { id: string; status: string } | null;
  }

  async findByPkWithAttributes(
    id: string,
    attributes: string[]
  ): Promise<Record<string, unknown> | null> {
    const user = await User.findByPk(id, { attributes });
    return user as unknown as Record<string, unknown> | null;
  }
}

export const userRepository = new UserRepository();
