import { UserStatus } from '../../../enums';
import { User, Notification, AdminAuditLog } from '../../../models';
import { sendEmail, templates } from '../../mail';

export class UpdateUserStatusCommand {
  async execute(actorId: string, userId: string, status: string, reason?: string): Promise<void> {
    if (!status) {
      const err: any = new Error('status is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      const err: any = new Error('invalid status');
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

    user.status = status;
    await user.save();

    await Notification.create({
      UserId: user.id,
      type: 'system',
      title: 'Account status updated',
      message: `Your account status is now ${status}`,
      data: { status },
    });

    if (status === UserStatus.SUSPENDED) {
      await sendEmail({ to: user.email, ...templates.accountSuspended({ fullName: user.fullName, reason }) });
    } else if (status === UserStatus.DEACTIVATED) {
      await sendEmail({ to: user.email, ...templates.accountDeactivated({ fullName: user.fullName, reason }) });
    } else if (status === 'active') {
      await sendEmail({ to: user.email, ...templates.accountReactivated({ fullName: user.fullName }) });
    }

    await AdminAuditLog.create({
      actorId,
      title: 'User status updated',
      content: `${user.fullName} (${user.email}) status set to ${status}.`,
      status: status === UserStatus.SUSPENDED ? 'security' : 'success',
      meta: JSON.stringify({ userId: user.id, status, reason }),
    });
  }
}
export const updateUserStatusCommand = new UpdateUserStatusCommand();
