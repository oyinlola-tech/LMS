import { AssignmentSubmission, Assignment } from '../../../models';

export interface CreateSubmissionInput {
  assignmentId: string;
  userId: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
  submissionNotes?: string;
}

export class CreateSubmissionCommand {
  async execute(input: CreateSubmissionInput): Promise<AssignmentSubmission> {
    const assignment = await Assignment.findByPk(input.assignmentId);
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const existing = await AssignmentSubmission.findOne({
      where: { AssignmentId: input.assignmentId, UserId: input.userId },
    });
    if (existing) {
      const err: any = new Error('Already submitted');
      err.code = 'ALREADY_SUBMITTED';
      err.statusCode = 409;
      throw err;
    }

    const submission = await AssignmentSubmission.create({
      AssignmentId: input.assignmentId,
      UserId: input.userId,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSizeMb: input.fileSizeMb,
      submissionNotes: input.submissionNotes,
      status: 'submitted',
    });

    return submission;
  }
}
export const createSubmissionCommand = new CreateSubmissionCommand();
