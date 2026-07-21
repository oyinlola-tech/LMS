import { enrollmentRepository } from '../../../repositories/enrollment.repository';

export class GetEnrollmentDetailQuery {
  async execute(enrollmentId: string, userId: string): Promise<any> {
    const enrollment = await enrollmentRepository.findByIdAndUser(enrollmentId, userId);
    if (!enrollment) {
      const err: any = new Error('Enrollment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    return enrollment;
  }
}

export const getEnrollmentDetailQuery = new GetEnrollmentDetailQuery();
