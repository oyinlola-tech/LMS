import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';

export class GetAssignmentDetailQuery {
  async execute(assignmentId: string, userId: string, userRole: string): Promise<any> {
    const assignment = await assignmentRepository.findByIdWithIncludes(assignmentId);
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

    const submission = await assignmentSubmissionRepository.findLatestByUser(assignmentId, userId);

    const now = new Date();
    const daysLeft = assignment.dueDate
      ? Math.max(0, Math.ceil((assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      status: assignment.status,
      moduleNumber: assignment.moduleNumber,
      moduleName: assignment.module?.title,
      dueDate: assignment.dueDate,
      daysLeft,
      proTip: assignment.proTip,
      coreObjective: assignment.coreObjective,
      keyDeliverables: assignment.keyDeliverables || [],
      requirement: assignment.AssignmentRequirement || null,
      instructor: assignment.createdBy,
      submissionStatus: submission ? submission.status : 'not_submitted',
      feedback: submission ? submission.feedback : null,
    };
  }
}

export const getAssignmentDetailQuery = new GetAssignmentDetailQuery();
