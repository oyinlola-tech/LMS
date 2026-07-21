import { Course, Assignment, AssignmentRequirement } from '../../../models';

export class UpdateAssignmentCommand {
  async execute(assignmentId: string, userId: string, body: Record<string, any>): Promise<Assignment> {
    const { title, description, dueDate, totalPoints, fileTypes, maxFileSizeMb, proTip, coreObjective, keyDeliverables, status } = body;
    const assignment = await Assignment.findByPk(assignmentId, { include: [{ model: Course }] });
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if ((assignment as any).Course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (totalPoints !== undefined) assignment.totalPoints = totalPoints;
    if (proTip !== undefined) assignment.proTip = proTip;
    if (coreObjective !== undefined) assignment.coreObjective = coreObjective;
    if (keyDeliverables !== undefined) assignment.keyDeliverables = keyDeliverables;
    if (status) {
      const validStatus = ['draft', 'published'];
      if (!validStatus.includes(status)) {
        const err: any = new Error(`Invalid status. Must be one of: ${validStatus.join(', ')}`);
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
      assignment.status = status;
    }
    await assignment.save();

    const reqs = await AssignmentRequirement.findOne({ where: { AssignmentId: assignment.id } });
    if (reqs) {
      if (fileTypes !== undefined) reqs.fileTypes = fileTypes;
      if (maxFileSizeMb !== undefined) reqs.maxFileSizeMb = maxFileSizeMb;
      await reqs.save();
    }

    return assignment;
  }
}
export const updateAssignmentCommand = new UpdateAssignmentCommand();
