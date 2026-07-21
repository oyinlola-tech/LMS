import { Course, Lesson } from '../../../models';

export class UpdateLessonCommand {
  async execute(lessonId: string, userId: string, body: Record<string, any>): Promise<Lesson> {
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

    const { title, type, durationMinutes, position, pdfPages, quizDueDate } = body;
    if (title) lesson.title = title;
    if (type) {
      const validTypes = ['video', 'pdf', 'quiz', 'note'];
      if (!validTypes.includes(type)) {
        const err: any = new Error(`Invalid lesson type. Must be one of: ${validTypes.join(', ')}`);
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
      lesson.type = type;
    }
    if (durationMinutes !== undefined) lesson.durationMinutes = durationMinutes;
    if (position !== undefined) lesson.position = position;
    if (pdfPages !== undefined) lesson.pdfPages = pdfPages;
    if (quizDueDate !== undefined) lesson.quizDueDate = quizDueDate;
    await lesson.save();
    return lesson;
  }
}
export const updateLessonCommand = new UpdateLessonCommand();
