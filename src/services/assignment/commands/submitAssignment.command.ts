import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';

export interface SubmitAssignmentInput {
  assignmentId: string;
  userId: string;
  userRole: string;
  fileUrl: string;
  fileType?: string;
  fileSizeMb?: number;
  submissionNotes?: string;
}

export class SubmitAssignmentCommand {
  async execute(input: SubmitAssignmentInput): Promise<any> {
    const { assignmentId, userId, userRole, fileUrl, fileType, fileSizeMb, submissionNotes } = input;

    const assignment = await assignmentRepository.findByIdWithRequirement(assignmentId);
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const access = await assignmentRepository.checkAccess(assignment, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.message || 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    const reqs = assignment.AssignmentRequirement;
    if (reqs) {
      if (reqs.maxFileSizeMb && fileSizeMb && fileSizeMb > reqs.maxFileSizeMb) {
        const err: any = new Error('File size exceeds limit');
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
      if (reqs.fileTypes && fileType && !reqs.fileTypes.includes(fileType)) {
        const err: any = new Error('File type not allowed');
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
    }

    const submission = await assignmentSubmissionRepository.create({
      AssignmentId: assignmentId,
      UserId: userId,
      fileUrl,
      fileType,
      fileSizeMb,
      submissionNotes,
      status: 'submitted',
    });

    return { submissionId: submission.id };
  }
}

export const submitAssignmentCommand = new SubmitAssignmentCommand();
