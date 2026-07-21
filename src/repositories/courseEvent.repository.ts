import { CourseEvent } from '../models/CourseEvent.model';

export class CourseEventRepository {
  async findByCourseId(courseId: string): Promise<any[]> {
    return CourseEvent.findAll({
      where: { CourseId: courseId },
      order: [['startsAt', 'ASC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return CourseEvent.create(data);
  }
}

export const courseEventRepository = new CourseEventRepository();
