import { Payment } from '../../../models';

export class GetPaymentQuery {
  async execute(userId: string, courseId?: string): Promise<Payment | Payment[] | null> {
    const where: any = { UserId: userId };
    if (courseId) where.CourseId = courseId;
    if (courseId) {
      return Payment.findOne({ where, order: [['createdAt', 'DESC']] });
    }
    return Payment.findAll({ where, order: [['createdAt', 'DESC']] });
  }
}

export const getPaymentQuery = new GetPaymentQuery();
