import { User, TutorProfile } from '../../../models';
import { UserRole } from '../../../enums';

export class ListTutorsQuery {
  async execute(limit?: number) {
    const opts: any = { where: { role: UserRole.TUTOR }, include: [{ model: TutorProfile }], order: [['createdAt', 'DESC']] };
    if (limit) opts.limit = limit;
    return User.findAll(opts);
  }
}
export const listTutorsQuery = new ListTutorsQuery();
