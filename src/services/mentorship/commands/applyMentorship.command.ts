import { MentorshipApplication, Course, Enrollment } from '../../../models';

export class ApplyMentorshipCommand {
  async execute(
    userId: string,
    courseId: string,
    message?: string,
    certificationRequirements?: string,
    portfolioUrl?: string,
    category?: string,
  ): Promise<MentorshipApplication> {
    if (!courseId) {
      const err: any = new Error('courseId is required');
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

    const completed = await Enrollment.findOne({
      where: { UserId: userId, CourseId: courseId, status: 'completed' },
    });
    if (!completed) {
      const err: any = new Error('You must complete the course before applying for mentorship');
      err.code = 'COURSE_NOT_COMPLETED';
      err.statusCode = 400;
      throw err;
    }

    const existing = await MentorshipApplication.findOne({
      where: { UserId: userId, CourseId: courseId },
    });
    if (existing) return existing;

    return MentorshipApplication.create({
      UserId: userId,
      CourseId: courseId,
      message: message || null,
      certificationRequirements: certificationRequirements || null,
      portfolioUrl: portfolioUrl || null,
      category: category || null,
    });
  }
}
export const applyMentorshipCommand = new ApplyMentorshipCommand();
