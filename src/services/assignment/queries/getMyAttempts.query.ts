import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';

export class GetMyAttemptsQuery {
  async execute(assignmentId: string, userId: string, userRole: string): Promise<any[]> {
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

    return assignmentSubmissionRepository.findAllByUser(assignmentId, userId);
  }
}

export const getMyAttemptsQuery = new GetMyAttemptsQuery();
