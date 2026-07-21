import { lessonRepository } from '../../../repositories/lesson.repository';
import { quizRepository } from '../../../repositories/quiz.repository';
import { quizAttemptRepository } from '../../../repositories/quizAttempt.repository';

const shuffle = (arr: any[]): any[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export class GetLessonQuizQuery {
  async execute(lessonId: string, userId: string, userRole: string): Promise<any> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    const quiz = await quizRepository.findByLesson(lessonId);
    if (!quiz) {
      const err: any = new Error('Quiz not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const totalPoints = quiz.QuizQuestions.reduce((sum: number, q: any) => sum + q.points, 0);

    const attempt = await quizAttemptRepository.create({
      QuizId: quiz.id,
      UserId: userId,
      status: 'in_progress',
      total: totalPoints,
    });

    const questions = quiz.QuizQuestions.map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      points: q.points,
      position: q.position,
      options: shuffle(q.QuizOptions.map((o: any) => ({
        id: o.id,
        text: o.text,
      }))),
    }));

    return {
      attemptId: attempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        timeLimitMinutes: quiz.timeLimitMinutes,
        passingScore: quiz.passingScore,
        questions: shuffle(questions),
      },
    };
  }
}

export const getLessonQuizQuery = new GetLessonQuizQuery();
