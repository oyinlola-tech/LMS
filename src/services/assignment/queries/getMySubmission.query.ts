import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';

export class GetMySubmissionQuery {
  async execute(assignmentId: string, userId: string): Promise<any> {
    const submission = await assignmentSubmissionRepository.findLatestByUser(assignmentId, userId);
    if (!submission) {
      const err: any = new Error('Submission not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    return submission;
  }
}

export const getMySubmissionQuery = new GetMySubmissionQuery();
