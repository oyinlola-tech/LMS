import { Course } from '../../../models';

export class GetTutorCoursesQuery {
  async execute(tutorId: string): Promise<Course[]> {
    return Course.findAll({
      where: { tutorId },
      order: [['updatedAt', 'DESC']],
    });
  }
}
export const getTutorCoursesQuery = new GetTutorCoursesQuery();
