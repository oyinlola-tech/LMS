import { assignmentRepository } from '../../../repositories/assignment.repository';

export class StartAssignmentCommand {
  async execute(assignmentId: string, userId: string, userRole: string): Promise<void> {
    const assignment = await assignmentRepository.findByIdWithCourseAndTutor(assignmentId);
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
  }
}

export const startAssignmentCommand = new StartAssignmentCommand();
