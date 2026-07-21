import { Course, CourseCoupon } from '../../../models';

export class CreateCouponCommand {
  async execute(courseId: string, userId: string, body: { code: string; discountPercent: number; expiresAt?: string }): Promise<CourseCoupon> {
    if (!body.code || !body.discountPercent) {
      const err: any = new Error('code and discountPercent are required');
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
    return CourseCoupon.create({
      CourseId: course.id,
      code: String(body.code).toUpperCase(),
      discountPercent: body.discountPercent,
      expiresAt: body.expiresAt || null,
    });
  }
}
export const createCouponCommand = new CreateCouponCommand();
