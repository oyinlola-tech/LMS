import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';
import { UserRole } from '../../../enums';

export class ListSubmissionsQuery {
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

    if (userRole !== UserRole.TUTOR) {
      const err: any = new Error('Only tutors can view submissions');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    return assignmentSubmissionRepository.findAllByAssignment(assignmentId);
  }
}

export const listSubmissionsQuery = new ListSubmissionsQuery();
