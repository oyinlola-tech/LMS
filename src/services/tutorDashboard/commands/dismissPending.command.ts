import { AssignmentSubmission } from '../../../models';

export class DismissPendingCommand {
  async execute(submissionId: string): Promise<void> {
    await AssignmentSubmission.update({ status: 'graded' }, { where: { id: submissionId, status: 'submitted' } });
  }
}
export const dismissPendingCommand = new DismissPendingCommand();
