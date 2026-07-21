import { sequelize } from '../config/db.config';
import { CourseSpecialization } from '../models/CourseSpecialization.model';

export class CourseSpecializationRepository {
  async getCourseCountsBySpecialization(): Promise<Record<string, number>> {
    const counts = await CourseSpecialization.findAll({
      attributes: ['SpecializationId', [sequelize.fn('COUNT', sequelize.col('CourseId')), 'courseCount']],
      group: ['SpecializationId'],
    });
    return counts.reduce((acc: Record<string, number>, row: any) => {
      acc[row.SpecializationId] = Number(row.get('courseCount'));
      return acc;
    }, {});
  }
}

export const courseSpecializationRepository = new CourseSpecializationRepository();
