import { Assignment, AssignmentResource, AssignmentRequirement, GradingRubricCriterion, Course, CourseSection, User } from '../../../models';

export class GetAssignmentForEditQuery {
  async execute(assignmentId: string, tutorId: string): Promise<any> {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [
        { model: AssignmentRequirement },
        { model: AssignmentResource },
        { model: GradingRubricCriterion },
        { model: Course, attributes: ['id', 'title'] },
        { model: CourseSection, as: 'module', attributes: ['id', 'title', 'position'] },
        { model: User, as: 'createdBy', attributes: ['id', 'fullName'] },
      ],
    });
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    if ((assignment as any).Course?.tutorId !== tutorId && (assignment as any).createdById !== tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    const a = assignment as any;
    return {
      id: a.id,
      title: a.title,
      description: a.description || '',
      instructions: a.instructions || '',
      type: a.type,
      difficulty: a.difficulty,
      totalPoints: a.totalPoints,
      status: a.status,
      dueDate: a.dueDate,
      estimatedTime: a.estimatedTime,
      attemptsAllowed: a.attemptsAllowed,
      submissionType: a.submissionType,
      lateSubmissionPolicy: a.lateSubmissionPolicy,
      coreObjective: a.coreObjective,
      proTip: a.proTip,
      keyDeliverables: a.keyDeliverables,
      downloadAssetsUrl: a.downloadAssetsUrl,
      moduleNumber: a.moduleNumber,
      CourseId: a.CourseId,
      moduleId: a.moduleId,
      course: a.Course ? { id: a.Course.id, title: a.Course.title } : null,
      module: a.module ? { id: a.module.id, title: a.module.title, position: a.module.position } : null,
      requirement: a.AssignmentRequirement ? {
        fileTypes: a.AssignmentRequirement.fileTypes,
        maxFileSizeMb: a.AssignmentRequirement.maxFileSizeMb,
        notes: a.AssignmentRequirement.notes,
      } : null,
      resources: (a.AssignmentResources || []).map((r: any) => ({
        id: r.id, title: r.title, type: r.type, url: r.url,
        description: r.description, fileSize: r.fileSize,
      })),
      rubricCriteria: (a.GradingRubricCriteria || []).map((c: any) => ({
        id: c.id, title: c.title, description: c.description,
        maxScore: c.maxScore, weight: c.weight,
      })),
    };
  }
}
export const getAssignmentForEditQuery = new GetAssignmentForEditQuery();
