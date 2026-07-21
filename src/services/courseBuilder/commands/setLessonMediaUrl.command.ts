import { Course, Lesson } from '../../../models';

export class SetLessonMediaUrlCommand {
  async execute(lessonId: string, userId: string, url: string): Promise<string> {
    if (!url) {
      const err: any = new Error('url is required');
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
    lesson.videoUrl = url;
    await lesson.save();
    return url;
  }
}
export const setLessonMediaUrlCommand = new SetLessonMediaUrlCommand();
