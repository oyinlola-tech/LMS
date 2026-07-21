import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';
import { UserRole } from '../../../enums';

export interface ListAssignmentsInput {
  userId: string;
  userRole: string;
  page: number;
  limit: number;
}

export class ListAssignmentsQuery {
  async execute(input: ListAssignmentsInput): Promise<any> {
    const { userId, userRole, page, limit } = input;
    const courseIds = await assignmentRepository.getCourseIdsForUser(userId, userRole);
    const learnerView = userRole === UserRole.LEARNER;

    const { rows, count } = await assignmentRepository.findAndCountAllByCourseIds(
      courseIds,
      learnerView,
      limit,
      (page - 1) * limit,
    );

    let submissionMap: Record<string, any> = {};
    if (learnerView && rows.length) {
      const submissions = await assignmentSubmissionRepository.findLatestForAssignments(
        rows.map((a: any) => a.id),
        userId,
      );
      submissionMap = submissions.reduce((acc: Record<string, any>, s: any) => {
        acc[s.AssignmentId] = s;
        return acc;
      }, {});
    }

    const items = rows.map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title,
      status: assignment.status,
      dueDate: assignment.dueDate,
      moduleNumber: assignment.moduleNumber,
      moduleName: assignment.module?.title,
      course: assignment.Course || null,
      submissionStatus: submissionMap[assignment.id]?.status || 'not_submitted',
    }));

    return {
      items,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export const listAssignmentsQuery = new ListAssignmentsQuery();
