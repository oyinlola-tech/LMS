import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';
import { UserRole } from '../../../enums';

export class GetSubmissionDetailQuery {
  async execute(assignmentId: string, submissionId: string, userId: string, userRole: string): Promise<any> {
    const assignment = await assignmentRepository.findById(assignmentId);
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

    if (userRole !== UserRole.TUTOR) {
      const err: any = new Error('Only tutors can view submissions');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const submission = await assignmentSubmissionRepository.findByIdAndAssignment(
      submissionId,
      assignmentId,
      true,
    );
    if (!submission) {
      const err: any = new Error('Submission not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    return submission;
  }
}

export const getSubmissionDetailQuery = new GetSubmissionDetailQuery();
