import { Otp } from '../models/Otp.model';

export interface IOtpAttributes {
  id: string;
  UserId: string;
  codeHash: string;
  expiresAt: Date;
  purpose: string;
  createdAt: Date;
  destroy(): Promise<void>;
}

export class OtpRepository {
  async findLatestByUserId(userId: string, purpose: string): Promise<IOtpAttributes | null> {
    const otp = await Otp.findOne({
      where: { UserId: userId, purpose },
      order: [['createdAt', 'DESC']],
    });
    return otp as unknown as IOtpAttributes | null;
  }

  async create(data: Record<string, unknown>): Promise<IOtpAttributes> {
    const otp = await Otp.create(data);
    return otp as unknown as IOtpAttributes;
  }
}

export const otpRepository = new OtpRepository();
