import { CourseCertificate, Course, User } from '../../../models';

export class VerifyCertificateQuery {
  async execute(certId: string): Promise<{ id: string; courseTitle: string; studentName: string; issuedAt: Date; certificateUrl: string } | null> {
    const cert = await CourseCertificate.findByPk(certId, {
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: User, attributes: ['id', 'fullName'] },
      ],
    });
    if (!cert) return null;
    return {
      id: cert.id,
      courseTitle: (cert as any).Course.title,
      studentName: (cert as any).User.fullName,
      issuedAt: new Date(cert.issuedAt as unknown as string),
      certificateUrl: cert.certificateUrl,
    };
  }
}
export const verifyCertificateQuery = new VerifyCertificateQuery();
