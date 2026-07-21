import { CourseAnnouncement } from '../models/CourseAnnouncement.model';

export class CourseAnnouncementRepository {
  async findByCourseId(courseId: string): Promise<any[]> {
    return CourseAnnouncement.findAll({
      where: { CourseId: courseId },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return CourseAnnouncement.create(data);
  }
}

export const courseAnnouncementRepository = new CourseAnnouncementRepository();
