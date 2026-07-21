import { Course, Assignment, AssignmentRequirement } from '../../../models';

export class CreateAssignmentCommand {
  async execute(courseId: string, userId: string, body: Record<string, any>): Promise<Assignment> {
    const { title, moduleId, description, dueDate, totalPoints, fileTypes, maxFileSizeMb, proTip, coreObjective, keyDeliverables } = body;
    if (!title || !moduleId) {
      const err: any = new Error('title and moduleId are required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const course = await Course.findByPk(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const assignment = await Assignment.create({
      CourseId: course.id,
      moduleId,
      title,
      description: description || null,
      dueDate: dueDate || null,
      totalPoints: totalPoints || null,
      status: 'draft',
      proTip: proTip || null,
      coreObjective: coreObjective || null,
      keyDeliverables: Array.isArray(keyDeliverables) ? keyDeliverables : null,
      createdById: userId,
    });

    await AssignmentRequirement.create({
      AssignmentId: assignment.id,
      fileTypes: Array.isArray(fileTypes) ? fileTypes : null,
      maxFileSizeMb: maxFileSizeMb || null,
    });

    return assignment;
  }
}
export const createAssignmentCommand = new CreateAssignmentCommand();
