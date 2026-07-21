import { OfficeHour } from '../../../models';

export class ScheduleOfficeHourCommand {
  async execute(tutorId: string, body: { title: string; startsAt: string; durationMinutes?: number; meetingUrl?: string; courseId?: string }): Promise<OfficeHour> {
    const { title, startsAt, durationMinutes, meetingUrl, courseId } = body;
    if (!title || !startsAt) {
      const err: any = new Error('title and startsAt are required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    return OfficeHour.create({ tutorId, CourseId: courseId || null, title, startsAt, durationMinutes, meetingUrl });
  }
}
export const scheduleOfficeHourCommand = new ScheduleOfficeHourCommand();
