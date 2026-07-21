import { enrollmentRepository } from '../../../repositories/enrollment.repository';

export class ListEnrollmentsQuery {
  async execute(userId: string): Promise<any[]> {
    return enrollmentRepository.findAllByUser(userId);
  }
}

export const listEnrollmentsQuery = new ListEnrollmentsQuery();
