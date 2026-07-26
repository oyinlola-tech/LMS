import { Op } from 'sequelize';
import { OfficeHour, Enrollment } from '../../../models';

export class ListTutorOfficeHoursQuery {
  async execute(tutorId: string) {
    return OfficeHour.findAll({
      where: { tutorId },
      include: [{ model: require('../../../models').Course, attributes: ['id', 'title'] }],
      order: [['startsAt', 'ASC']],
    });
  }
}

export class ListStudentOfficeHoursQuery {
  async execute(studentId: string) {
    const enrollments = await Enrollment.findAll({
      where: { UserId: studentId },
      attributes: ['CourseId'],
    });
    const courseIds = enrollments.map((e: any) => e.CourseId);
    if (!courseIds.length) return [];
    return OfficeHour.findAll({
      where: { CourseId: { [Op.in]: courseIds } },
      include: [{ model: require('../../../models').Course, attributes: ['id', 'title'] }, { model: require('../../../models').User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['startsAt', 'ASC']],
    });
  }
}
