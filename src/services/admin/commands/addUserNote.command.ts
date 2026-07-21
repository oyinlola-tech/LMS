import { UserAdminNote } from '../../../models';

export class AddUserNoteCommand {
  async execute(userId: string, adminId: string, note: string): Promise<UserAdminNote> {
    if (!note) {
      const err: any = new Error('note is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    return UserAdminNote.create({
      UserId: userId,
      adminId,
      note,
    });
  }
}
export const addUserNoteCommand = new AddUserNoteCommand();
