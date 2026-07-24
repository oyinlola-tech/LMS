import { Payment, Enrollment } from '../../../models';
import { PaymentStatus } from '../../../enums';
import { AppError } from '../../../errors';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL || 'https://api.paystack.co';

export class VerifyPaymentCommand {
  async execute(userId: string, reference: string): Promise<{ enrolled: boolean; payment: Payment }> {
    if (!PAYSTACK_SECRET_KEY) {
      throw new AppError('Payment not configured', 'PAYMENT_NOT_CONFIGURED', 503);
    }

    const payment = await Payment.findOne({ where: { reference, UserId: userId } });
    if (!payment) throw new AppError('Payment not found', 'NOT_FOUND', 404);

    if (payment.status === PaymentStatus.COMPLETED) {
      return { enrolled: true, payment };
    }

    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const result = await response.json() as any;

    if (!result.status || !result.data) {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
      throw new AppError('Payment verification failed', 'VERIFICATION_FAILED', 502);
    }

    if (result.data.status === 'success') {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date().toISOString();
      await payment.save();

      const existingEnrollment = await Enrollment.findOne({
        where: { UserId: userId, CourseId: payment.CourseId },
      });
      if (!existingEnrollment) {
        await Enrollment.create({
          UserId: userId,
          CourseId: payment.CourseId,
          status: 'active',
          pricePaid: payment.amount,
          currency: payment.currency,
          startedAt: new Date().toISOString(),
        });
      }

      return { enrolled: true, payment };
    }

    payment.status = PaymentStatus.FAILED;
    await payment.save();
    throw new AppError('Payment was not successful', 'PAYMENT_FAILED', 400);
  }
}

export const verifyPaymentCommand = new VerifyPaymentCommand();
