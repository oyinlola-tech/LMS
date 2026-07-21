import { assignmentRepository } from '../../../repositories/assignment.repository';
import { assignmentSubmissionRepository } from '../../../repositories/assignmentSubmission.repository';
import { notificationRepository } from '../../../repositories/notification.repository';
import { sendEmail, templates } from '../../../services/mail';
import { UserRole } from '../../../enums';

export interface GradeSubmissionInput {
  assignmentId: string;
  userId: string;
  userRole: string;
  submissionId: string;
  status: string;
  feedback?: string;
  score?: number;
  rubric?: string;
}

export class GradeSubmissionCommand {
  async execute(input: GradeSubmissionInput): Promise<void> {
    const { assignmentId, userId, userRole, submissionId, status, feedback, score, rubric } = input;

    const assignment = await assignmentRepository.findByIdWithCourseAndTutor(assignmentId);
    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const access = await assignmentRepository.checkAccess(assignment, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.message || 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    if (userRole !== UserRole.TUTOR) {
      const err: any = new Error('Only tutors can grade');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const submission = await assignmentSubmissionRepository.findByIdAndAssignment(
      submissionId,
      assignmentId,
      true,
    );
    if (!submission) {
      const err: any = new Error('Submission not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    submission.status = status;
    submission.feedback = feedback || submission.feedback;
    if (typeof score === 'number') submission.score = score;
    if (rubric) submission.rubric = rubric;
    submission.gradedAt = new Date();
    await assignmentSubmissionRepository.save(submission);

    await notificationRepository.create({
      UserId: submission.UserId,
      type: 'feedback',
      title: 'Assignment graded',
      message: `Your submission was graded: ${status}`,
      data: { assignmentId, submissionId: submission.id },
    });

    const submissionUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/assignments/${assignmentId}/submission`
      : undefined;

    await sendEmail({
      to: submission.User?.email,
      ...templates.assignmentGraded({
        courseTitle: assignment.Course?.title,
        instructorName: assignment.Course?.tutor?.fullName,
        submissionUrl,
        score,
        rubric,
      }),
    });
  }
}

export const gradeSubmissionCommand = new GradeSubmissionCommand();
