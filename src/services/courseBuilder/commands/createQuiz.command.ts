import { Course, Lesson, Quiz, QuizQuestion, QuizOption } from '../../../models';

export class CreateQuizCommand {
  async execute(lessonId: string, userId: string, body: { title: string; passingScore?: number; timeLimitMinutes?: number; questions: Array<{ prompt: string; points?: number; position?: number; options: Array<{ text: string; isCorrect: boolean }> }> }): Promise<{ quizId: string }> {
    if (!body.title || !Array.isArray(body.questions) || body.questions.length === 0) {
      const err: any = new Error('title and questions are required');
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

    const quiz = await Quiz.create({
      LessonId: lesson.id,
      title: body.title,
      passingScore: body.passingScore || null,
      timeLimitMinutes: body.timeLimitMinutes || null,
    });

    for (const [index, q] of body.questions.entries()) {
      const question = await QuizQuestion.create({
        QuizId: quiz.id,
        prompt: q.prompt,
        points: q.points || 1,
        position: q.position || index + 1,
      });
      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          await QuizOption.create({
            QuizQuestionId: question.id,
            text: opt.text,
            isCorrect: Boolean(opt.isCorrect),
          });
        }
      }
    }

    return { quizId: quiz.id };
  }
}
export const createQuizCommand = new CreateQuizCommand();
