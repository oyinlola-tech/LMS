import { Course, Lesson, LessonContent } from '../../../models';

export class AddLessonContentCommand {
  async execute(lessonId: string, userId: string, body: { heading: string; subheading?: string; content: string; position?: number }): Promise<LessonContent> {
    if (!body.heading || !body.content) {
      const err: any = new Error('heading and content are required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const lesson = await Lesson.findByPk(lessonId, { include: [{ model: Course }] });
    if (!lesson) {
      const err: any = new Error('Lesson not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if ((lesson as any).Course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    return LessonContent.create({
      LessonId: lesson.id,
      heading: body.heading,
      subheading: body.subheading || null,
      content: body.content,
      position: body.position || 0,
    });
  }
}
export const addLessonContentCommand = new AddLessonContentCommand();
