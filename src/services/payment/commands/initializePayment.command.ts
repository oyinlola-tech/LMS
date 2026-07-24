import crypto from 'crypto';
import { Payment, Course, Enrollment } from '../../../models';
import { PaymentStatus, PaymentProvider } from '../../../enums';
import { AppError } from '../../../errors';
import { toLowestUnit, getCurrencyDecimals } from '../../../utils/currency.util';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL || 'https://api.paystack.co';
const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
const PAYSTACK_SUPPORTED = new Set(['USD', 'NGN', 'GHS', 'KES', 'ZAR', 'EUR', 'GBP', 'XOF', 'EGP']);

function resolvePaystackCurrency(raw: string): string {
  const c = raw.toUpperCase();
  return PAYSTACK_SUPPORTED.has(c) ? c : 'USD';
}

export class InitializePaymentCommand {
  async execute(userId: string, courseId: string, email?: string): Promise<{ accessCode: string; reference: string; publicKey: string; email: string }> {
    if (!PAYSTACK_SECRET_KEY) {
      throw new AppError('Payment not configured', 'PAYMENT_NOT_CONFIGURED', 503);
    }

    const course = await Course.findByPk(courseId, { attributes: ['id', 'title', 'price', 'currency', 'thumbnailUrl', 'category'] });
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
          accessCode: existingPayment.paystackAccessCode,
          reference: existingPayment.reference,
          publicKey: PAYSTACK_PUBLIC_KEY,
          email: email || userId,
        };
      }
    }

    const reference = `LMS-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const rawCurrency = course.currency || 'USD';
    const currency = resolvePaystackCurrency(rawCurrency);
    const amountInLowest = toLowestUnit(course.price, rawCurrency);
    const customerEmail = email || userId;

    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: amountInLowest,
        currency,
        reference,
        callback_url: `${BASE_URL}/checkout/success?reference=${reference}&courseId=${courseId}`,
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
      currency: rawCurrency,
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.PAYSTACK,
      reference,
      paystackAccessCode: result.data.access_code,
    });

    return {
      accessCode: result.data.access_code,
      reference,
      publicKey: PAYSTACK_PUBLIC_KEY,
      email: customerEmail,
    };
  }
}

export const initializePaymentCommand = new InitializePaymentCommand();
