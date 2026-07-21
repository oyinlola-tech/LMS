import { User, UserRoleHistory, Notification, AdminAuditLog } from '../../../models';
import { sendEmail, templates } from '../../mail';

export class UpdateUserRoleCommand {
  async execute(actorId: string, userId: string, role: string): Promise<void> {
    if (!role) {
      const err: any = new Error('role is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (!['learner', 'tutor', 'admin'].includes(role)) {
      const err: any = new Error('invalid role');
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
    const previousRole = user.role;
    user.role = role;
    await user.save();

    await (UserRoleHistory as any).create({
      UserId: user.id,
      previousRole,
      newRole: role,
      changedById: actorId,
    });

    await Notification.create({
      UserId: user.id,
      type: 'system',
      title: 'Role updated',
      message: `Your role is now ${role}`,
      data: { role },
    });

    await sendEmail({ to: user.email, ...templates.roleChanged({ fullName: user.fullName, newRole: role }) });

    await AdminAuditLog.create({
      actorId,
      title: 'User role updated',
      content: `${user.fullName} (${user.email}) role changed from ${previousRole} to ${role}.`,
      status: 'success',
      meta: JSON.stringify({ userId: user.id, previousRole, newRole: role }),
    });
  }
}
export const updateUserRoleCommand = new UpdateUserRoleCommand();
