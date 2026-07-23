import crypto from 'crypto';
import { Payment, Course, Enrollment } from '../../../models';
import { PaymentStatus, PaymentProvider } from '../../../enums';
import { AppError } from '../../../errors';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

export class InitializePaymentCommand {
  async execute(userId: string, courseId: string): Promise<{ authorizationUrl: string; reference: string; accessCode: string; publicKey: string }> {
    if (!PAYSTACK_SECRET_KEY) {
      throw new AppError('Payment not configured', 'PAYMENT_NOT_CONFIGURED', 503);
    }

    const course = await Course.findByPk(courseId, { attributes: ['id', 'title', 'price', 'currency'] });
    if (!course) throw new AppError('Course not found', 'NOT_FOUND', 404);
    if (!course.price || course.price <= 0) {
      throw new AppError('This course is free — no payment needed', 'FREE_COURSE', 400);
    }

    const existing = await Enrollment.findOne({ where: { UserId: userId, CourseId: courseId } });
    if (existing) throw new AppError('Already enrolled', 'ALREADY_ENROLLED', 409);

    const existingPayment = await Payment.findOne({
      where: { UserId: userId, CourseId: courseId, status: PaymentStatus.PENDING },
    });
    if (existingPayment) {
      if (existingPayment.paystackAccessCode) {
        return {
          authorizationUrl: `https://checkout.paystack.com/${existingPayment.paystackAccessCode}`,
          reference: existingPayment.reference,
          accessCode: existingPayment.paystackAccessCode,
          publicKey: PAYSTACK_PUBLIC_KEY,
        };
      }
    }

    const reference = `LMS-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const amountInKobo = Math.round(course.price * 100);
    const currency = course.currency || 'USD';

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userId,
        amount: amountInKobo,
        currency: currency === 'USD' ? 'USD' : 'NGN',
        reference,
        callback_url: `${BASE_URL}/checkout/callback?reference=${reference}&courseId=${courseId}`,
        metadata: { userId, courseId, courseTitle: course.title },
      }),
    });

    const result = await response.json() as any;
    if (!result.status) {
      throw new AppError(result.message || 'Payment initialization failed', 'PAYSTACK_ERROR', 502);
    }

    await Payment.create({
      UserId: userId,
      CourseId: courseId,
      amount: course.price,
      currency,
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.PAYSTACK,
      reference,
      paystackAccessCode: result.data.access_code,
    });

    return {
      authorizationUrl: result.data.authorization_url,
      reference,
      accessCode: result.data.access_code,
      publicKey: PAYSTACK_PUBLIC_KEY,
    };
  }
}

export const initializePaymentCommand = new InitializePaymentCommand();
