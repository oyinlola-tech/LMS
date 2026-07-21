import { AssignmentSubmission } from '../../../models';

export interface UpdateSubmissionInput {
  submissionId: string;
  userId: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
  submissionNotes?: string;
}

export class UpdateSubmissionCommand {
  async execute(input: UpdateSubmissionInput): Promise<AssignmentSubmission> {
    const submission = await AssignmentSubmission.findByPk(input.submissionId);
    if (!submission) {
      const err: any = new Error('Submission not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (submission.UserId !== input.userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    if (submission.status !== 'submitted') {
      const err: any = new Error('Cannot update a graded submission');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    if (input.fileUrl !== undefined) submission.fileUrl = input.fileUrl;
    if (input.fileType !== undefined) submission.fileType = input.fileType;
    if (input.fileSizeMb !== undefined) submission.fileSizeMb = input.fileSizeMb;
    if (input.submissionNotes !== undefined) submission.submissionNotes = input.submissionNotes;
    await submission.save();

    return submission;
  }
}
export const updateSubmissionCommand = new UpdateSubmissionCommand();
