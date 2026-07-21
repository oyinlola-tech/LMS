import { Quiz } from '../models/Quiz.model';
import { QuizQuestion } from '../models/QuizQuestion.model';
import { QuizOption } from '../models/QuizOption.model';

export class QuizRepository {
  async findByLesson(lessonId: string): Promise<any> {
    return Quiz.findOne({
      where: { LessonId: lessonId },
      include: [{ model: QuizQuestion, include: [{ model: QuizOption }] }],
    });
  }

  async findByLessonWithOrderedQuestions(lessonId: string): Promise<any> {
    return Quiz.findOne({
      where: { LessonId: lessonId },
      include: [{
        model: QuizQuestion,
        include: [{ model: QuizOption }],
        order: [['position', 'ASC']],
      }],
    });
  }
}

export const quizRepository = new QuizRepository();
