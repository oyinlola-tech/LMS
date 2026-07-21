import { Assignment, AssignmentRequirement } from '../../../models';
import { sequelize } from '../../../config/db.config';

export class ManageAssignmentCommand {
  async createDraft(data: {
    tutorId: string;
    title: string;
    description?: string;
    instructions?: string;
    type?: string;
    difficulty?: string;
    totalPoints?: number;
    estimatedTime?: number;
    attemptsAllowed?: number;
    submissionType?: string;
    dueDate?: string;
    lateSubmissionPolicy?: string;
    coreObjective?: string;
    CourseId: string;
    moduleId: string;
  }): Promise<any> {
    const assignment = await Assignment.create({
      title: data.title || 'Untitled Assignment',
      description: data.description || null,
      instructions: data.instructions || null,
      type: data.type || 'essay',
      difficulty: data.difficulty || 'intermediate',
      totalPoints: data.totalPoints || 100,
      estimatedTime: data.estimatedTime || null,
      attemptsAllowed: data.attemptsAllowed ?? 1,
      submissionType: data.submissionType || 'file',
      dueDate: data.dueDate || null,
      lateSubmissionPolicy: data.lateSubmissionPolicy || null,
      coreObjective: data.coreObjective || null,
      status: 'draft',
      CourseId: data.CourseId,
      moduleId: data.moduleId,
      createdById: data.tutorId,
    });
    return { id: (assignment as any).id };
  }

  async saveDetails(params: {
    assignmentId: string;
    tutorId: string;
    title?: string;
    description?: string;
    instructions?: string;
    type?: string;
    difficulty?: string;
    totalPoints?: number;
    estimatedTime?: number;
    attemptsAllowed?: number;
    submissionType?: string;
    dueDate?: string;
    lateSubmissionPolicy?: string;
    coreObjective?: string;
    proTip?: string;
    keyDeliverables?: any;
    downloadAssetsUrl?: string;
    moduleNumber?: number;
    CourseId?: string;
    moduleId?: string;
  }): Promise<void> {
    const assignment = await Assignment.findByPk(params.assignmentId);
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    if ((assignment as any).createdById !== params.tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    const updates: Record<string, any> = {};
    ['title', 'description', 'instructions', 'type', 'difficulty', 'totalPoints',
     'estimatedTime', 'attemptsAllowed', 'submissionType', 'dueDate',
     'lateSubmissionPolicy', 'coreObjective', 'proTip', 'keyDeliverables',
     'downloadAssetsUrl', 'moduleNumber', 'CourseId', 'moduleId'].forEach(k => {
      if (params[k as keyof typeof params] !== undefined) updates[k] = params[k as keyof typeof params];
    });
    await Assignment.update(updates, { where: { id: params.assignmentId } });
  }

  async saveSubmissionConfig(params: {
    assignmentId: string;
    tutorId: string;
    submissionType?: string;
    attemptsAllowed?: number;
    lateSubmissionPolicy?: string;
    fileTypes?: string[];
    maxFileSizeMb?: number;
    notes?: string;
  }): Promise<void> {
    const assignment = await Assignment.findByPk(params.assignmentId);
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    if ((assignment as any).createdById !== params.tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    const assignmentUpdates: Record<string, any> = {};
    ['submissionType', 'attemptsAllowed', 'lateSubmissionPolicy'].forEach(k => {
      if (params[k as keyof typeof params] !== undefined) assignmentUpdates[k] = params[k as keyof typeof params];
    });
    if (Object.keys(assignmentUpdates).length) {
      await Assignment.update(assignmentUpdates, { where: { id: params.assignmentId } });
    }
    let req = await AssignmentRequirement.findOne({ where: { AssignmentId: params.assignmentId } });
    if (params.fileTypes || params.maxFileSizeMb !== undefined || params.notes !== undefined) {
      const reqData: Record<string, any> = {};
      if (params.fileTypes !== undefined) reqData.fileTypes = params.fileTypes;
      if (params.maxFileSizeMb !== undefined) reqData.maxFileSizeMb = params.maxFileSizeMb;
      if (params.notes !== undefined) reqData.notes = params.notes;
      if (req) {
        await req.update(reqData);
      } else {
        await AssignmentRequirement.create({ ...reqData, AssignmentId: params.assignmentId });
      }
    }
  }

  async publish(assignmentId: string, tutorId: string): Promise<void> {
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    if ((assignment as any).createdById !== tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    if (!(assignment as any).title || (assignment as any).title === 'Untitled Assignment') {
      const err: any = new Error('Assignment title is required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    if (!(assignment as any).CourseId) {
      const err: any = new Error('Course selection is required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    await Assignment.update({ status: 'published' }, { where: { id: assignmentId } });
  }
}
export const manageAssignmentCommand = new ManageAssignmentCommand();
