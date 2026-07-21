import { Course, Lesson } from '../../../models';

export class DeleteLessonCommand {
  async execute(lessonId: string, userId: string): Promise<void> {
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
    await lesson.destroy();
  }
}
export const deleteLessonCommand = new DeleteLessonCommand();
