import { AssignmentResource } from '../../../models';
import { Assignment } from '../../../models/Assignment.model';

export class ManageResourceCommand {
  async add(params: {
    assignmentId: string;
    tutorId: string;
    title: string;
    type: string;
    url?: string;
    description?: string;
    fileSize?: number;
  }): Promise<any> {
    const assignment = await Assignment.findByPk(params.assignmentId);
    if (!assignment || (assignment as any).createdById !== params.tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    const resource = await AssignmentResource.create({
      title: params.title,
      type: params.type || 'file',
      url: params.url || null,
      description: params.description || null,
      fileSize: params.fileSize || null,
      AssignmentId: params.assignmentId,
    });
    return { id: (resource as any).id };
  }

  async remove(resourceId: string, tutorId: string): Promise<void> {
    const resource = await AssignmentResource.findByPk(resourceId, {
      include: [{ model: Assignment, attributes: ['createdById'] }],
    });
    if (!resource) {
      const err: any = new Error('Resource not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    const r = resource as any;
    if (r.Assignment?.createdById !== tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    await resource.destroy();
  }

  async update(params: {
    resourceId: string;
    tutorId: string;
    title?: string;
    type?: string;
    url?: string;
    description?: string;
    fileSize?: number;
  }): Promise<void> {
    const resource = await AssignmentResource.findByPk(params.resourceId, {
      include: [{ model: Assignment, attributes: ['createdById'] }],
    });
    if (!resource) {
      const err: any = new Error('Resource not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    const r = resource as any;
    if (r.Assignment?.createdById !== params.tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }
    const updates: Record<string, any> = {};
    ['title', 'type', 'url', 'description', 'fileSize'].forEach(k => {
      if (params[k as keyof typeof params] !== undefined) updates[k] = params[k as keyof typeof params];
    });
    await resource.update(updates);
  }
}
export const manageResourceCommand = new ManageResourceCommand();
