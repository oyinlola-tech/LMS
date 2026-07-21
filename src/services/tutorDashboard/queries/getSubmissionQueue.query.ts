import { Op } from 'sequelize';
import { Course, Assignment, AssignmentSubmission, User } from '../../../models';

export class GetSubmissionQueueQuery {
  async execute(tutorId: string, sort: string = 'pending'): Promise<any[]> {
    const urgentDays = Number(process.env.SUBMISSION_URGENT_DAYS) || 0;
    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);

    const submissions = await AssignmentSubmission.findAll({
      where: { status: 'submitted' },
      include: [
        { model: User, attributes: ['id', 'fullName', 'avatarUrl'] },
        { model: Assignment, attributes: ['id', 'title', 'dueDate', 'CourseId'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const filtered = submissions.filter((s: any) => courseIds.includes(s.Assignment?.CourseId));
    const now = Date.now();
    const queue = filtered.map((s: any) => {
      const submittedAgoMinutes = Math.floor((now - new Date(s.createdAt).getTime()) / 60000);
      const isUrgent = urgentDays > 0 && s.Assignment?.dueDate
        ? (new Date(s.Assignment.dueDate).getTime() - now) <= urgentDays * 24 * 60 * 60 * 1000
        : false;
      return {
        submissionId: s.id, assignmentId: s.AssignmentId,
        assignmentTitle: s.Assignment?.title, student: s.User,
        submittedAgoMinutes, previewUrl: s.fileUrl,
        reviewUrl: `/assignments/${s.AssignmentId}/submissions/${s.id}`,
        attachmentCount: 1, attachmentSizeMb: s.fileSizeMb || null, urgent: isUrgent,
      };
    });

    if (sort === 'urgent') {
      queue.sort((a: any, b: any) => Number(b.urgent) - Number(a.urgent));
    }

    return queue;
  }
}
export const getSubmissionQueueQuery = new GetSubmissionQueueQuery();
