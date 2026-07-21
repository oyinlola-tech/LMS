import { Op } from 'sequelize';
import { Course, Enrollment, User, TutorBroadcast } from '../../../models';
import { sendEmail } from '../../mail';

export class EmailStudentsCommand {
  async execute(tutorId: string, subject: string, body: string): Promise<number> {
    if (!subject || !body) {
      const err: any = new Error('subject and body are required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);
    const enrollments = courseIds.length
      ? await Enrollment.findAll({ where: { CourseId: { [Op.in]: courseIds } }, include: [{ model: User }] })
      : [];
    const recipients = Array.from(new Set(enrollments.map((e: any) => e.User?.email).filter(Boolean)));
    await Promise.all(recipients.map((email) => sendEmail({ to: email, subject, text: body, html: body })));
    await TutorBroadcast.create({ tutorId, subject, body });
    return recipients.length;
  }
}
export const emailStudentsCommand = new EmailStudentsCommand();
