import { DiscussionThread, Course } from '../../../models';
import { sanitizeHtml, sanitizeRichText } from '../../../utils/sanitize.util';

export class CreateThreadCommand {
  async execute(userId: string, body: { title: string; body: string; courseId?: string }): Promise<DiscussionThread> {
    const { title, body: threadBody, courseId } = body;
    if (!title || !threadBody) {
      const err: any = new Error('title and body are required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    if (courseId) {
      const course = await Course.findByPk(courseId);
      if (!course) {
        const err: any = new Error('Course not found');
        err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
      }
    }
    return DiscussionThread.create({
      title: sanitizeHtml(String(title).trim()),
      body: sanitizeRichText(String(threadBody).trim()),
      CourseId: courseId || null,
      UserId: userId,
    });
  }
}
export const createThreadCommand = new CreateThreadCommand();
