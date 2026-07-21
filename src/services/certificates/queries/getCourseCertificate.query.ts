import { CourseCertificate } from '../../../models';

export class GetCourseCertificateQuery {
  async execute(userId: string, courseId: string): Promise<CourseCertificate | null> {
    return CourseCertificate.findOne({
      where: { UserId: userId, CourseId: courseId },
    });
  }
}
export const getCourseCertificateQuery = new GetCourseCertificateQuery();
