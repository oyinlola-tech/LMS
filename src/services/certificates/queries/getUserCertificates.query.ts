import { CourseCertificate, Course, User } from '../../../models';

export class GetUserCertificatesQuery {
  async execute(userId: string): Promise<CourseCertificate[]> {
    return CourseCertificate.findAll({
      where: { UserId: userId },
      include: [
        { model: Course, attributes: ['id', 'title'], include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] },
        { model: User, attributes: ['id', 'fullName'] },
      ],
      order: [['issuedAt', 'DESC']],
    });
  }
}
export const getUserCertificatesQuery = new GetUserCertificatesQuery();
