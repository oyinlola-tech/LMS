import { CourseComment } from '../models/CourseComment.model';
import { User } from '../models/User.model';

export class CourseCommentRepository {
  async findByCourseId(courseId: string): Promise<any[]> {
    return CourseComment.findAll({
      where: { CourseId: courseId },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return CourseComment.create(data);
  }
}

export const courseCommentRepository = new CourseCommentRepository();
