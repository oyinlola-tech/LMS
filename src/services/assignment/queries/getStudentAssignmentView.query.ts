import {
  Assignment, AssignmentRequirement, AssignmentResource, GradingRubricCriterion,
  AssignmentSubmission, Course, CourseSection, User, Enrollment,
} from '../../../models';
import { UserRole } from '../../../enums';

export interface StudentAssignmentView {
  id: string;
  title: string;
  description: string | null;
  type: string;
  totalPoints: number | null;
  status: string;
  dueDate: string | null;
  daysLeft: number | null;
  estimatedTime: number | null;
  attemptsAllowed: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  submissionType: string;
  lateSubmissionPolicy: string | null;
  difficulty: string;
  proTip: string | null;
  coreObjective: string | null;
  keyDeliverables: any[];
  instructions: string | null;
  downloadAssetsUrl: string | null;
  course: { id: string; title: string; thumbnailUrl: string | null } | null;
  module: { id: string; title: string } | null;
  instructor: { id: string; fullName: string; avatarUrl: string | null } | null;
  requirement: {
    fileTypes: string[];
    maxFileSizeMb: number | null;
    notes: string | null;
  } | null;
  resources: Array<{
    id: string; title: string; type: string; url: string | null;
    description: string | null; fileSize: number | null;
  }>;
  rubric: Array<{
    id: string; title: string; description: string | null;
    weight: number; maxScore: number | null;
  }>;
  submission: {
    id: string; status: string; fileUrl: string; fileType: string | null;
    fileSizeMb: number | null; submissionNotes: string | null;
    feedback: string | null; score: number | null; rubricRating: string | null;
    gradedAt: string | null; createdAt: string;
  } | null;
  previousAttempts: Array<{
    id: string; attemptNumber: number; status: string; fileUrl: string;
    fileType: string | null; fileSizeMb: number | null; score: number | null;
    feedback: string | null; gradedAt: string | null; createdAt: string;
  }>;
  timeline: Array<{ event: string; date: string | null; completed: boolean }>;
}

export class GetStudentAssignmentViewQuery {
  async execute(assignmentId: string, userId: string, userRole: string): Promise<StudentAssignmentView> {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [
        { model: AssignmentRequirement },
        { model: AssignmentResource },
        { model: GradingRubricCriterion },
        { model: Course, attributes: ['id', 'title', 'thumbnailUrl'] },
        { model: CourseSection, as: 'module', attributes: ['id', 'title'] },
        { model: User, as: 'createdBy', attributes: ['id', 'fullName', 'avatarUrl'] },
      ],
    });

    if (!assignment) {
      const err: any = new Error('Assignment not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404;
      throw err;
    }

    if (userRole === UserRole.LEARNER) {
      const course = assignment as any;
      const enrollment = await Enrollment.findOne({
        where: { UserId: userId, CourseId: course.CourseId },
      });
      if (!enrollment) {
        const err: any = new Error('You are not enrolled in this course');
        err.code = 'FORBIDDEN'; err.statusCode = 403;
        throw err;
      }
    }

    const submissions = await AssignmentSubmission.findAll({
      where: { AssignmentId: assignmentId, UserId: userId },
      order: [['createdAt', 'DESC']],
    });

    const attemptsUsed = submissions.length;
    const attemptsAllowed = assignment.attemptsAllowed;
    const attemptsRemaining = Math.max(0, attemptsAllowed - attemptsUsed);

    const latestSubmission = submissions.length > 0 ? submissions[0] : null;
    const previousAttempts = submissions.length > 1 ? submissions.slice(1) : [];

    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const daysLeft = dueDate ? Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;

    const requirement = (assignment as any).AssignmentRequirement;
    const resources = (assignment as any).AssignmentResources || [];
    const rubric = (assignment as any).GradingRubricCriteria || [];
    const course = (assignment as any).Course || null;
    const module = (assignment as any).module || null;
    const instructor = (assignment as any).createdBy || null;

    const timeline: Array<{ event: string; date: string | null; completed: boolean }> = [
      { event: 'Assignment Published', date: (assignment as any).createdAt?.toISOString() || null, completed: true },
      { event: 'Assignment Started', date: null, completed: false },
      { event: 'Draft Saved', date: null, completed: false },
      { event: 'Files Uploaded', date: null, completed: false },
    ];

    if (latestSubmission) {
      timeline[1] = { event: 'Assignment Started', date: (latestSubmission as any).createdAt?.toISOString() || null, completed: true };
      timeline[2] = { event: 'Draft Saved', date: (latestSubmission as any).createdAt?.toISOString() || null, completed: true };
      if (latestSubmission.fileUrl) {
        timeline[3] = { event: 'Files Uploaded', date: (latestSubmission as any).createdAt?.toISOString() || null, completed: true };
      }
      timeline.push({ event: 'Submitted', date: (latestSubmission as any).createdAt?.toISOString() || null, completed: latestSubmission.status === 'submitted' || latestSubmission.status === 'graded' });
      timeline.push({ event: 'Graded', date: (latestSubmission as any).gradedAt?.toISOString() || null, completed: latestSubmission.status === 'graded' });
      timeline.push({
        event: 'Feedback Available',
        date: (latestSubmission as any).gradedAt?.toISOString() || null,
        completed: !!(latestSubmission.feedback || latestSubmission.score !== null),
      });
    }

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      totalPoints: assignment.totalPoints,
      status: assignment.status,
      dueDate: (assignment.dueDate as any)?.toISOString() || null,
      daysLeft,
      estimatedTime: assignment.estimatedTime,
      attemptsAllowed,
      attemptsUsed,
      attemptsRemaining,
      submissionType: assignment.submissionType,
      lateSubmissionPolicy: assignment.lateSubmissionPolicy,
      difficulty: assignment.difficulty,
      proTip: assignment.proTip,
      coreObjective: assignment.coreObjective,
      keyDeliverables: (assignment.keyDeliverables as any[]) || [],
      instructions: assignment.instructions,
      downloadAssetsUrl: assignment.downloadAssetsUrl,
      course: course ? { id: course.id, title: course.title, thumbnailUrl: course.thumbnailUrl } : null,
      module: module ? { id: module.id, title: module.title } : null,
      instructor: instructor ? { id: instructor.id, fullName: instructor.fullName, avatarUrl: instructor.avatarUrl } : null,
      requirement: requirement ? {
        fileTypes: (requirement.fileTypes as string[]) || [],
        maxFileSizeMb: requirement.maxFileSizeMb,
        notes: requirement.notes,
      } : null,
      resources: resources.map((r: any) => ({
        id: r.id, title: r.title, type: r.type, url: r.url,
        description: r.description, fileSize: r.fileSize,
      })),
      rubric: rubric.map((r: any) => ({
        id: r.id, title: r.title, description: r.description,
        weight: r.weight, maxScore: r.maxScore,
      })),
      submission: latestSubmission ? {
        id: latestSubmission.id,
        status: latestSubmission.status,
        fileUrl: latestSubmission.fileUrl,
        fileType: latestSubmission.fileType,
        fileSizeMb: latestSubmission.fileSizeMb,
        submissionNotes: latestSubmission.submissionNotes,
        feedback: latestSubmission.feedback,
        score: latestSubmission.score,
        rubricRating: latestSubmission.rubric,
        gradedAt: (latestSubmission as any).gradedAt?.toISOString() || null,
        createdAt: (latestSubmission as any).createdAt?.toISOString() || null,
      } : null,
      previousAttempts: previousAttempts.map((s: any) => ({
        id: s.id,
        attemptNumber: attemptsUsed - previousAttempts.indexOf(s),
        status: s.status,
        fileUrl: s.fileUrl,
        fileType: s.fileType,
        fileSizeMb: s.fileSizeMb,
        score: s.score,
        feedback: s.feedback,
        gradedAt: (s as any).gradedAt?.toISOString() || null,
        createdAt: (s as any).createdAt?.toISOString() || null,
      })),
      timeline,
    };
  }
}

export const getStudentAssignmentViewQuery = new GetStudentAssignmentViewQuery();
