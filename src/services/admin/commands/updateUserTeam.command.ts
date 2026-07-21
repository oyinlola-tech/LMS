import { User, AdminAuditLog } from '../../../models';

export class UpdateUserTeamCommand {
  async execute(actorId: string, userId: string, team: string): Promise<void> {
    if (!team) {
      const err: any = new Error('team is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    user.team = team;
    await user.save();

    await AdminAuditLog.create({
      actorId,
      title: 'User team assigned',
      content: `${user.fullName} (${user.email}) assigned to team ${team}.`,
      status: 'success',
      meta: JSON.stringify({ userId: user.id, team }),
    });
  }
}
export const updateUserTeamCommand = new UpdateUserTeamCommand();
