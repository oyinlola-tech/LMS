import { Op } from 'sequelize';
import { PasswordReset } from '../models/PasswordReset.model';
import { User } from '../models/User.model';

export interface IPasswordResetAttributes {
  id: string;
  UserId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  User?: {
    id: string;
    email: string;
    passwordHash: string;
    save(): Promise<void>;
  } | null;
  save(): Promise<IPasswordResetAttributes>;
}

export class PasswordResetRepository {
  async findValidById(id: string): Promise<IPasswordResetAttributes | null> {
    const reset = await PasswordReset.findOne({
      where: { id, usedAt: null, expiresAt: { [Op.gt]: new Date() } },
      include: [{ model: User }],
    });
    return reset as unknown as IPasswordResetAttributes | null;
  }

  async create(data: Record<string, unknown>): Promise<IPasswordResetAttributes> {
    const reset = await PasswordReset.create(data);
    return reset as unknown as IPasswordResetAttributes;
  }
}

export const passwordResetRepository = new PasswordResetRepository();
