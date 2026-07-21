import { Lesson } from '../models/Lesson.model';
import { LessonContent } from '../models/LessonContent.model';
import { LessonResource } from '../models/LessonResource.model';
import { LessonProgress } from '../models/LessonProgress.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Assignment } from '../models/Assignment.model';
import { UserRole } from '../enums';

export interface AccessCheckResult {
  allowed: boolean;
  lesson?: any;
  enrollment?: any;
  code?: string;
  status?: number;
}

export class LessonRepository {
  async findById(id: string): Promise<any> {
    return Lesson.findByPk(id);
  }

  async findDetail(id: string): Promise<any> {
    return Lesson.findByPk(id, {
      include: [
        { model: LessonContent, order: [['position', 'ASC']] },
        { model: LessonResource },
      ],
    });
  }

  async checkAccess(lessonId: string, userId: string, userRole: string): Promise<AccessCheckResult> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return { allowed: false, code: 'NOT_FOUND', status: 404 };
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course) {
      return { allowed: false, code: 'NOT_FOUND', status: 404 };
    }

    if (userRole === UserRole.TUTOR) {
      if (course.tutorId !== userId) {
        return { allowed: false, code: 'FORBIDDEN', status: 403 };
      }
      return { allowed: true, lesson };
    }

    const enrollment = await Enrollment.findOne({
      where: { UserId: userId, CourseId: course.id },
    });
    if (!enrollment) {
      return { allowed: false, code: 'FORBIDDEN', status: 403 };
    }

    return { allowed: true, lesson, enrollment };
  }

  async findAssignment(courseId: string, sectionId: string): Promise<any> {
    return Assignment.findOne({
      where: { CourseId: courseId, moduleId: sectionId },
    });
  }

  async findProgress(lessonId: string, userId: string): Promise<any> {
    return LessonProgress.findOne({ where: { LessonId: lessonId, UserId: userId } });
  }
}

export const lessonRepository = new LessonRepository();
