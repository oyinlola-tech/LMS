import { CourseCertificate } from '../../../models';

export class GetCertificateFileQuery {
  async execute(certId: string): Promise<{ certificateUrl: string } | null> {
    const cert = await CourseCertificate.findByPk(certId);
    if (!cert || !cert.certificateUrl) return null;
    return { certificateUrl: cert.certificateUrl };
  }
}
export const getCertificateFileQuery = new GetCertificateFileQuery();
