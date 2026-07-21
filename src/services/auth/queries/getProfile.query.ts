import { User } from '../../../models';

export class GetProfileQuery {
  async execute(userId: string): Promise<User | null> {
    return User.findByPk(userId, {
      attributes: { exclude: ['passwordHash', 'trustedDeviceHash', 'trustedIp'] },
    });
  }
}
export const getProfileQuery = new GetProfileQuery();
