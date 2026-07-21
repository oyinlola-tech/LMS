import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';

export interface UpdateSubmissionInput {
  assignmentId: string;
  submissionId: string;
  userId: string;
  submissionNotes?: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
}

export class UpdateSubmissionCommand {
  async execute(input: UpdateSubmissionInput): Promise<any> {
    const { assignmentId, submissionId, userId, submissionNotes, fileUrl, fileType, fileSizeMb } = input;

    const submission = await assignmentSubmissionRepository.findByIdAndAssignmentAndUser(
      submissionId,
      assignmentId,
      userId,
    );
    if (!submission) {
      const err: any = new Error('Submission not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (submissionNotes !== undefined) submission.submissionNotes = submissionNotes;
    if (fileUrl) submission.fileUrl = fileUrl;
    if (fileType) submission.fileType = fileType;
    if (typeof fileSizeMb === 'number') submission.fileSizeMb = fileSizeMb;
    submission.status = 'submitted';

    await assignmentSubmissionRepository.save(submission);
    return submission;
  }
}

export const updateSubmissionCommand = new UpdateSubmissionCommand();
