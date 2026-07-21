import { CourseSection, Course, Lesson } from '../../../models';

export class CreateLessonCommand {
  async execute(moduleId: string, userId: string, body: { title: string; type?: string; durationMinutes?: number; position?: number; pdfPages?: number; quizDueDate?: string }): Promise<Lesson> {
    if (!body.title) {
      const err: any = new Error('title is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const validTypes = ['video', 'pdf', 'quiz', 'note'];
    if (body.type && !validTypes.includes(body.type)) {
      const err: any = new Error(`Invalid lesson type. Must be one of: ${validTypes.join(', ')}`);
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const courseSection = await CourseSection.findByPk(moduleId, { include: [{ model: Course }] });
    if (!courseSection) {
      const err: any = new Error('Module not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if ((courseSection as any).Course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    return Lesson.create({
      courseSectionId: courseSection.id,
      courseId: (courseSection as any).Course.id,
      title: body.title,
      type: body.type || 'video',
      durationMinutes: body.durationMinutes || 0,
      position: body.position || 0,
      pdfPages: body.pdfPages || null,
      quizDueDate: body.quizDueDate || null,
    });
  }
}
export const createLessonCommand = new CreateLessonCommand();
