import { Course, CourseCoupon } from '../../../models';

export class ApplyCouponCommand {
  async execute(courseId: string, userId: string, code: string): Promise<{ original: number; discounted: number; discountPercent: number }> {
    if (!code) {
      const err: any = new Error('code is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const course = await Course.findByPk(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const coupon = await CourseCoupon.findOne({
      where: { CourseId: course.id, code: String(code).toUpperCase(), isActive: true },
    });
    if (!coupon) {
      const err: any = new Error('Coupon not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      const err: any = new Error('Coupon expired');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const price = course.price || 0;
    const discounted = Math.max(0, price - (price * coupon.discountPercent) / 100);
    return { original: price, discounted, discountPercent: coupon.discountPercent };
  }
}
export const applyCouponCommand = new ApplyCouponCommand();
