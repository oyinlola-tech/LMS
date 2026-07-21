import { lessonRepository } from '../../../repositories/lesson.repository';
import { quizRepository } from '../../../repositories/quiz.repository';
import { quizAttemptRepository } from '../../../repositories/quizAttempt.repository';
import { Course } from '../../../models/Course.model';
import { User } from '../../../models/User.model';
import { sendEmail, templates } from '../../../services/mail';
import { logger } from '../../../core/loggers';

export interface SubmitQuizInput {
  lessonId: string;
  userId: string;
  userRole: string;
  attemptId: string;
  answers: { questionId: string; optionId: string }[];
  userEmail: string;
}

export class SubmitQuizCommand {
  async execute(input: SubmitQuizInput): Promise<any> {
    const { lessonId, userId, userRole, attemptId, answers, userEmail } = input;

    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    const attempt = await quizAttemptRepository.findByIdAndUser(attemptId, userId);
    if (!attempt) {
      const err: any = new Error('Attempt not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (attempt.status === 'submitted') {
      const err: any = new Error('Quiz already submitted');
      err.code = 'ALREADY_SUBMITTED';
      err.statusCode = 409;
      throw err;
    }

    const quiz = await quizRepository.findByLessonWithOrderedQuestions(lessonId);
    if (!quiz) {
      const err: any = new Error('Quiz not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const answerMap: Record<string, string> = {};
    for (const a of answers) {
      answerMap[a.questionId] = a.optionId;
    }

    let score = 0;
    let total = 0;
    for (const question of quiz.QuizQuestions) {
      total += question.points;
      const correctOption = question.QuizOptions.find((o: any) => o.isCorrect);
      if (correctOption && answerMap[question.id] === correctOption.id) {
        score += question.points;
      }
    }

    attempt.score = score;
    attempt.total = total;
    attempt.status = 'submitted';
    attempt.answers = answers;
    await quizAttemptRepository.save(attempt);

    const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0;

    const course = await Course.findByPk(access.lesson.CourseId, {
      include: [{ model: User, as: 'tutor', attributes: ['fullName'] }],
    });

    const quizPraiseThreshold = Number(process.env.QUIZ_PRAISE_THRESHOLD);
    const quizAvgThreshold = Number(process.env.QUIZ_AVG_THRESHOLD);
    const courseUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/courses/${access.lesson.CourseId}`
      : undefined;
    const lessonUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/lessons/${lessonId}`
      : undefined;

    const emailCtx = {
      scorePercent,
      courseTitle: course?.title,
      instructorName: (course as any)?.tutor?.fullName,
      courseUrl,
      lessonUrl,
    };

    let emailTemplate: { subject: string; html: string; text: string };
    if (!isNaN(quizPraiseThreshold) && scorePercent >= quizPraiseThreshold) {
      emailTemplate = templates.quizScoreHigh(emailCtx);
    } else if (!isNaN(quizAvgThreshold) && scorePercent >= quizAvgThreshold) {
      emailTemplate = templates.quizScoreAverage(emailCtx);
    } else {
      emailTemplate = templates.quizScoreLow(emailCtx);
    }

    setImmediate(async () => {
      try {
        await sendEmail({ to: userEmail, ...emailTemplate });
      } catch (err) {
        logger.error('[QuizEmail]', err);
      }
    });

    return { score, total, scorePercent };
  }
}

export const submitQuizCommand = new SubmitQuizCommand();
