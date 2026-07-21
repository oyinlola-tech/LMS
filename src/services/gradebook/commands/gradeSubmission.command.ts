import { Assignment, Course, User, AssignmentSubmission } from '../../../models';
import { sendEmail, templates } from '../../mail';

export class GradeSubmissionCommand {
  async execute(tutorId: string, studentId: string, assignmentId: string, body: { score: number; rubric?: string; feedback?: string }): Promise<AssignmentSubmission> {
    const { score, rubric, feedback } = body;
    if (score === undefined || score === null) {
      const err: any = new Error('score is required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    if (rubric) {
      const validRubrics = ['exceeds', 'meets', 'partial', 'redo'];
      if (!validRubrics.includes(rubric)) {
        const err: any = new Error(`Invalid rubric. Must be one of: ${validRubrics.join(', ')}`);
        err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
      }
    }

    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Course, include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] }],
    });
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    if ((assignment as any).Course.tutorId !== tutorId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN'; err.statusCode = 403; throw err;
    }

    const submission = await AssignmentSubmission.findOne({
      where: { AssignmentId: assignment.id, UserId: studentId },
      include: [{ model: User, attributes: ['fullName', 'email'] }],
    });
    if (!submission) {
      const err: any = new Error('Submission not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }

    submission.score = score;
    submission.rubric = rubric || submission.rubric;
    submission.feedback = feedback || submission.feedback;
    submission.status = 'graded';
    await submission.save();

    if ((submission as any).User?.email) {
      await sendEmail({
        to: (submission as any).User.email,
        ...templates.assignmentGraded({
          courseTitle: (assignment as any).Course?.title,
          instructorName: (assignment as any).Course?.tutor?.fullName,
          submissionUrl: submission.fileUrl,
          score: submission.score,
          rubric: submission.rubric,
        }),
      });
    }

    return submission;
  }
}
export const gradeSubmissionCommand = new GradeSubmissionCommand();
