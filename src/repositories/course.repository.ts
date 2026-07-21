import { Op } from 'sequelize';
import { Course } from '../models/Course.model';
import { User } from '../models/User.model';
import { Specialization } from '../models/Specialization.model';
import { CourseSection } from '../models/CourseSection.model';
import { Lesson } from '../models/Lesson.model';
import { TutorProfile } from '../models/TutorProfile.model';

export class CourseRepository {
  async findFeatured(): Promise<any[]> {
    return Course.findAll({
      where: { isPublished: true },
      include: [{ model: User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['updatedAt', 'DESC']],
      limit: 8,
    });
  }

  async findRecommendedByInterests(names: string[]): Promise<any[]> {
    const include: any[] = [
      { model: User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] },
    ];
    if (names.length) {
      include.push({ model: Specialization, where: { name: { [Op.in]: names } } });
    } else {
      include.push({ model: Specialization, required: false });
    }
    return Course.findAll({
      where: { isPublished: true },
      include,
      order: [['updatedAt', 'DESC']],
      limit: 12,
    });
  }

  async findPublishedWithFilters(
    where: Record<string, any>,
    include: any[],
  ): Promise<any[]> {
    return Course.findAll({ where, include, order: [['updatedAt', 'DESC']], limit: 50 });
  }

  async findById(id: string): Promise<any> {
    return Course.findByPk(id);
  }

  async findByIdWithIncludes(id: string, includes: any[]): Promise<any> {
    return Course.findByPk(id, { include: includes });
  }

  async findByIdWithOrder(id: string, includes: any[], order: any[]): Promise<any> {
    return Course.findByPk(id, { include: includes, order });
  }

  async findDetail(id: string): Promise<any> {
    return Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'avatarUrl', 'bio'],
          include: [{ model: TutorProfile }],
        },
        { model: Specialization, required: false },
        { model: CourseSection, include: [{ model: Lesson }] },
      ],
      order: [
        [CourseSection, 'position', 'ASC'],
        [CourseSection, Lesson, 'position', 'ASC'],
      ],
    });
  }

  async findPreview(id: string): Promise<any> {
    return Course.findByPk(id, {
      include: [
        { model: User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl', 'bio'] },
        { model: Specialization, required: false },
      ],
    });
  }
}

export const courseRepository = new CourseRepository();
