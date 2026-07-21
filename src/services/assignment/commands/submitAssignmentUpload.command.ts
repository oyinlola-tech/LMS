import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';

export interface SubmitAssignmentUploadInput {
  assignmentId: string;
  userId: string;
  userRole: string;
  file: any;
  submissionNotes?: string;
  publicBaseUrl: string;
}

export class SubmitAssignmentUploadCommand {
  async execute(input: SubmitAssignmentUploadInput): Promise<any> {
    const { assignmentId, userId, userRole, file, submissionNotes, publicBaseUrl } = input;

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
    const fileSizeMb = file.size / (1024 * 1024);
    if (reqs && reqs.maxFileSizeMb && fileSizeMb > reqs.maxFileSizeMb) {
      const err: any = new Error('File size exceeds limit');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    const fileUrl = `${publicBaseUrl}/uploads/${file.filename}`;
    const fileType = file.originalname.split('.').pop()?.toLowerCase() || '';

    const submission = await assignmentSubmissionRepository.create({
      AssignmentId: assignmentId,
      UserId: userId,
      fileUrl,
      fileType,
      fileSizeMb,
      submissionNotes,
      status: 'submitted',
    });

    return { submissionId: submission.id, fileUrl };
  }
}

export const submitAssignmentUploadCommand = new SubmitAssignmentUploadCommand();
