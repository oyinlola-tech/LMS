import { courseRepository } from '../../../repositories/course.repository';
import { courseEventRepository } from '../../../repositories/courseEvent.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { notificationRepository } from '../../../repositories/notification.repository';
import { sendEmail, templates } from '../../../services/mail';
import { User } from '../../../models/User.model';

export interface CreateCourseEventInput {
  courseId: string;
  createdById: string;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt?: Date;
  meetingUrl?: string;
}

export class CreateCourseEventCommand {
  async execute(input: CreateCourseEventInput): Promise<any> {
    const { courseId, createdById, title, description, startsAt, endsAt, meetingUrl } = input;

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

    const event = await courseEventRepository.create({
      CourseId: courseId,
      createdById,
      title,
      description,
      startsAt,
      endsAt,
      meetingUrl,
    });

    const enrollments = await enrollmentRepository.findByCourseIdWithUser(courseId);
    const courseUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/courses/${course.id}`
      : undefined;
    const eventUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/courses/${course.id}/events/${event.id}`
      : undefined;

    await Promise.all(enrollments.map((e: any) =>
      notificationRepository.create({
        UserId: e.UserId,
        type: 'event',
        title: `New event in ${course.title}`,
        message: title,
        data: { courseId: course.id, eventId: event.id },
      })
    ));

    const eventPayload = typeof event.toJSON === 'function' ? event.toJSON() : event;
    await Promise.all(enrollments.map((e: any) =>
      sendEmail({
        to: e.User?.email,
        ...templates.courseEvent({
          eventTitle: title,
          description,
          startsAt,
          endsAt,
          meetingUrl,
          courseTitle: course.title,
          instructorName: course.tutor?.fullName,
          courseUrl,
          eventUrl,
          eventPayload,
        }),
      })
    ));

    return event;
  }
}

export const createCourseEventCommand = new CreateCourseEventCommand();
