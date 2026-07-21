import { CourseCertificate, Course } from '../../../models';

export class GetUserCertificatesQuery {
  async execute(userId: string): Promise<CourseCertificate[]> {
    return CourseCertificate.findAll({
      where: { UserId: userId },
      include: [{ model: Course, attributes: ['id', 'title'] }],
      order: [['issuedAt', 'DESC']],
    });
  }
}
export const getUserCertificatesQuery = new GetUserCertificatesQuery();
