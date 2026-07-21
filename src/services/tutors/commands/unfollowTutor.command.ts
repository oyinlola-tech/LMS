import { TutorFollow } from '../../../models';

export class UnfollowTutorCommand {
  async execute(followerId: string, tutorId: string): Promise<void> {
    await TutorFollow.destroy({ where: { tutorId, followerId } });
  }
}
export const unfollowTutorCommand = new UnfollowTutorCommand();
