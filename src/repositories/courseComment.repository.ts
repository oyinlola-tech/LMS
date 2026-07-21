import { Op } from 'sequelize';
import { CourseComment } from '../models/CourseComment.model';
import { User } from '../models/User.model';

const commentIncludes = [
  { model: User, attributes: ['id', 'fullName', 'avatarUrl'] },
];

export class CourseCommentRepository {
  async findTopLevel(courseId: string, page: number = 1, limit: number = 10): Promise<{ rows: any[]; count: number }> {
    const offset = (page - 1) * limit;
    return CourseComment.findAndCountAll({
      where: { CourseId: courseId, parentId: null },
      include: commentIncludes,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });
  }

  async findReplies(parentId: string, page: number = 1, limit: number = 20): Promise<{ rows: any[]; count: number }> {
    const offset = (page - 1) * limit;
    return CourseComment.findAndCountAll({
      where: { parentId },
      include: commentIncludes,
      order: [['createdAt', 'ASC']],
      limit,
      offset,
      distinct: true,
    });
  }

  async getReplyCount(parentId: string): Promise<number> {
    return CourseComment.count({ where: { parentId } });
  }

  async findById(id: string): Promise<any> {
    return CourseComment.findByPk(id, { include: commentIncludes });
  }

  async create(data: Record<string, any>): Promise<any> {
    return CourseComment.create(data);
  }
}

export const courseCommentRepository = new CourseCommentRepository();
