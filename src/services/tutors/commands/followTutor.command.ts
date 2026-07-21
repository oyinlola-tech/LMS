import { User, TutorFollow } from '../../../models';
import { UserRole } from '../../../enums';

export class FollowTutorCommand {
  async execute(followerId: string, tutorId: string): Promise<void> {
    if (followerId === tutorId) {
      const err: any = new Error('You cannot follow yourself');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    const tutor = await User.findByPk(tutorId);
    if (!tutor || tutor.role !== UserRole.TUTOR) {
      const err: any = new Error('Tutor not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    const existing = await TutorFollow.findOne({ where: { tutorId, followerId } });
    if (existing) return;
    await TutorFollow.create({ tutorId, followerId });
  }
}
export const followTutorCommand = new FollowTutorCommand();
