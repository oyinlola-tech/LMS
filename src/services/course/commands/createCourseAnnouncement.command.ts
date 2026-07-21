import { courseRepository } from '../../../repositories/course.repository';
import { courseAnnouncementRepository } from '../../../repositories/courseAnnouncement.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { notificationRepository } from '../../../repositories/notification.repository';
import { sendEmail, templates } from '../../../services/mail';
import { User } from '../../../models/User.model';

export interface CreateCourseAnnouncementInput {
  courseId: string;
  createdById: string;
  title: string;
  body: string;
}

export class CreateCourseAnnouncementCommand {
  async execute(input: CreateCourseAnnouncementInput): Promise<any> {
    const { courseId, createdById, title, body } = input;

    const course = await courseRepository.findByIdWithIncludes(courseId, [
      { model: User, as: 'tutor', attributes: ['fullName'] },
    ]);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (course.tutorId !== createdById) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const announcement = await courseAnnouncementRepository.create({
      CourseId: courseId,
      createdById,
      title,
      body,
    });

    const enrollments = await enrollmentRepository.findByCourseIdWithUser(courseId);
    const courseUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/courses/${course.id}`
      : undefined;
    const announcementUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/courses/${course.id}/announcements/${announcement.id}`
      : undefined;

    await Promise.all(enrollments.map((e: any) =>
      notificationRepository.create({
        UserId: e.UserId,
        type: 'announcement',
        title: `Announcement in ${course.title}`,
        message: title,
        data: { courseId: course.id, announcementId: announcement.id },
      })
    ));

    await Promise.all(enrollments.map((e: any) =>
      sendEmail({
        to: e.User?.email,
        ...templates.courseAnnouncement({
          announcementTitle: title,
          announcementBody: body,
          courseTitle: course.title,
          instructorName: course.tutor?.fullName,
          courseUrl,
          announcementUrl,
        }),
      })
    ));

    return announcement;
  }
}

export const createCourseAnnouncementCommand = new CreateCourseAnnouncementCommand();
