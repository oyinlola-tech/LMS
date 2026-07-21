import { Course, Assignment } from '../../../models';

export class DeleteAssignmentCommand {
  async execute(assignmentId: string, userId: string): Promise<void> {
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
    await assignment.destroy();
  }
}
export const deleteAssignmentCommand = new DeleteAssignmentCommand();
