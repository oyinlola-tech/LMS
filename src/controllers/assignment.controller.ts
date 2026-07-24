import { FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs';
import { ok, created, error } from '../utils/response.util';
import { listAssignmentsQuery } from '../services/assignment/queries/listAssignments.query';
import { getAssignmentDetailQuery } from '../services/assignment/queries/getAssignmentDetail.query';
import { getMySubmissionQuery } from '../services/assignment/queries/getMySubmission.query';
import { getMyAttemptsQuery } from '../services/assignment/queries/getMyAttempts.query';
import { getAssignmentsByCourseQuery } from '../services/assignment/queries/getAssignmentsByCourse.query';
import { getAssignmentsByModuleQuery } from '../services/assignment/queries/getAssignmentsByModule.query';
import { listSubmissionsQuery } from '../services/assignment/queries/listSubmissions.query';
import { getSubmissionDetailQuery } from '../services/assignment/queries/getSubmissionDetail.query';
import { getStudentAssignmentViewQuery } from '../services/assignment/queries/getStudentAssignmentView.query';
import { startAssignmentCommand } from '../services/assignment/commands/startAssignment.command';
import { submitAssignmentCommand } from '../services/assignment/commands/submitAssignment.command';
import { submitAssignmentUploadCommand } from '../services/assignment/commands/submitAssignmentUpload.command';
import { updateSubmissionCommand } from '../services/assignment/commands/updateSubmission.command';
import { gradeSubmissionCommand } from '../services/assignment/commands/gradeSubmission.command';
import { Assignment } from '../models/Assignment.model';
import { AssignmentRequirement } from '../models/AssignmentRequirement.model';
import { AppError } from '../errors';
import { UserRole } from '../enums';
import {
  validateSubmitInput,
  validateGradeInput,
} from '../validators/assignment.validator';
import type { IdParams, IdSubmissionIdParams, CourseIdParams, ModuleIdParams, PaginationQuery, SubmitAssignmentBody, GradeSubmissionBody, UpdateSubmissionBody, MulterFile } from '../types';

const uploadDir = process.env.UPLOAD_DIR;
const uploadMaxMb = Number(process.env.UPLOAD_MAX_MB);
const uploadAllowedMime = (process.env.UPLOAD_ALLOWED_MIME || '').split(',').map((v: string) => v.trim()).filter(Boolean);

const mimeByExtension: Record<string, string[]> = {
  pdf: ['application/pdf'],
  zip: ['application/zip', 'application/x-zip-compressed'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  gif: ['image/gif'],
  mp4: ['video/mp4'],
};

export const handleFileUpload = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  if (!uploadDir) {
    return error(reply, 500, 'CONFIG_ERROR', 'UPLOAD_DIR not configured');
  }

  const data = await request.file();
  if (!data) {
    return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
  }

  const { file: stream, filename: originalname, mimetype, fields } = data;

  if (uploadMaxMb) {
    const maxBytes = uploadMaxMb * 1024 * 1024;
    if (stream.truncated) {
      return error(reply, 400, 'VALIDATION_ERROR', 'File size exceeds limit');
    }
  }

  if (uploadAllowedMime.length > 0 && !uploadAllowedMime.includes(mimetype)) {
    return error(reply, 400, 'VALIDATION_ERROR', 'File MIME type not allowed');
  }

  const assignmentId = (request.params as Record<string, string>).id;
  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: AssignmentRequirement }],
  });
  if (!assignment) {
    return error(reply, 404, 'NOT_FOUND', 'Assignment not found');
  }

  const reqs = (assignment as any).AssignmentRequirement;
  const ext = path.extname(originalname).replace('.', '').toLowerCase();

  if (reqs && reqs.fileTypes && reqs.fileTypes.length > 0) {
    const allowed = reqs.fileTypes.map((t: string) => String(t).toLowerCase());
    if (!allowed.includes(ext)) {
      return error(reply, 400, 'VALIDATION_ERROR', 'File type not allowed');
    }
    if (mimeByExtension[ext] && !mimeByExtension[ext].includes(mimetype)) {
      return error(reply, 400, 'VALIDATION_ERROR', 'File MIME type not allowed');
    }
  }

  fs.mkdirSync(uploadDir, { recursive: true });
  const unique = Date.now() + '-' + crypto.randomUUID();
  const safe = originalname.replace(/[^a-zA-Z0-9._-]/g, '');
  const filename = unique + '-' + safe;
  const filePath = path.join(uploadDir, filename);

  const writeStream = fs.createWriteStream(filePath);
  await new Promise<void>((resolve, reject) => {
    stream.pipe(writeStream);
    stream.on('end', resolve);
    stream.on('error', reject);
    writeStream.on('error', reject);
  });

  const stats = fs.statSync(filePath);

  (request as any).file = {
    size: stats.size,
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype,
    destination: uploadDir,
    filename,
    path: filePath,
  };

  const notesField = Array.isArray(fields?.submissionNotes) ? fields.submissionNotes[0] : fields?.submissionNotes;
  if ((notesField as any)?.value) {
    (request.body as any) = { submissionNotes: (notesField as any).value };
  }
};

const handleDomainError = (reply: FastifyReply, err: unknown, fallbackCode: string, fallbackMsg: string) => {
  if (err instanceof AppError) {
    if (err.code === 'VALIDATION_ERROR') return error(reply, 400, err.code, err.message);
    if (err.code === 'NOT_FOUND') return error(reply, 404, err.code, err.message);
    if (err.code === 'FORBIDDEN') return error(reply, 403, err.code, err.message);
    return error(reply, 500, fallbackCode, fallbackMsg);
  }
  return error(reply, 500, fallbackCode, fallbackMsg);
};

export const listAssignments = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = request.query as PaginationQuery;
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const result = await listAssignmentsQuery.execute({
      userId: request.user!.sub,
      userRole: request.user!.role,
      page,
      limit,
    });
    return ok(reply, result, 'Assignments loaded');
  } catch {
    return error(reply, 500, 'ASSIGNMENT_LIST_FAILED', 'Failed to load assignments');
  }
};

export const getAssignmentsByCourse = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { courseId } = request.params as CourseIdParams;
    const result = await getAssignmentsByCourseQuery.execute(courseId, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Assignments loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ASSIGNMENT_LIST_FAILED', 'Failed to load assignments');
  }
};

export const getAssignmentsByModule = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { moduleId } = request.params as ModuleIdParams;
    const result = await getAssignmentsByModuleQuery.execute(moduleId, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Assignments loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ASSIGNMENT_LIST_FAILED', 'Failed to load assignments');
  }
};

export const getAssignmentDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IdParams;
    const result = await getAssignmentDetailQuery.execute(id, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Assignment loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ASSIGNMENT_LOAD_FAILED', 'Failed to load assignment');
  }
};

export const startAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IdParams;
    await startAssignmentCommand.execute(id, request.user!.sub, request.user!.role);
    return ok(reply, null, 'Assignment started');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ASSIGNMENT_START_FAILED', 'Failed to start assignment');
  }
};

export const submitAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as SubmitAssignmentBody;
  const validation = validateSubmitInput(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
  }
  try {
    const { id } = request.params as IdParams;
    const result = await submitAssignmentCommand.execute({
      assignmentId: id,
      userId: request.user!.sub,
      userRole: request.user!.role,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      fileSizeMb: body.fileSizeMb,
      submissionNotes: body.submissionNotes,
    });
    return created(reply, result, 'Assignment submitted');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ASSIGNMENT_SUBMIT_FAILED', 'Failed to submit assignment');
  }
};

export const submitAssignmentUpload = async (request: FastifyRequest, reply: FastifyReply) => {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;
  if (!publicBaseUrl) {
    return error(reply, 500, 'CONFIG_ERROR', 'PUBLIC_BASE_URL not configured');
  }
  if (!request.file) {
    return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
  }
  try {
    const { id } = request.params as IdParams;
    const result = await submitAssignmentUploadCommand.execute({
      assignmentId: id,
      userId: request.user!.sub,
      userRole: request.user!.role,
      file: request.file as unknown as MulterFile,
      submissionNotes: ((request.body || {}) as Record<string, string>).submissionNotes,
      publicBaseUrl,
    });
    return created(reply, result, 'Assignment submitted');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ASSIGNMENT_SUBMIT_FAILED', 'Failed to submit assignment');
  }
};

export const gradeAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as GradeSubmissionBody;
  const validation = validateGradeInput(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
  }
  try {
    const { id } = request.params as IdParams;
    await gradeSubmissionCommand.execute({
      assignmentId: id,
      userId: request.user!.sub,
      userRole: request.user!.role,
      submissionId: body.submissionId,
      status: body.status,
      feedback: body.feedback,
      score: body.score,
      rubric: body.rubric,
    });
    return ok(reply, null, 'Submission graded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'GRADE_FAILED', 'Failed to grade submission');
  }
};

export const getMySubmission = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IdParams;
    const result = await getMySubmissionQuery.execute(id, request.user!.sub);
    return ok(reply, result, 'Submission loaded');
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return error(reply, 404, err.code, err.message);
    }
    return error(reply, 500, 'SUBMISSION_LOAD_FAILED', 'Failed to load submission');
  }
};

export const getMyAttempts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IdParams;
    const result = await getMyAttemptsQuery.execute(id, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Assignment attempts loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'ATTEMPTS_LOAD_FAILED', 'Failed to load attempts');
  }
};

export const updateSubmission = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id, submissionId } = request.params as IdSubmissionIdParams;
    const body = (request.body || {}) as UpdateSubmissionBody;
    const result = await updateSubmissionCommand.execute({
      assignmentId: id,
      submissionId,
      userId: request.user!.sub,
      submissionNotes: body.submissionNotes,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      fileSizeMb: body.fileSizeMb,
    });
    return ok(reply, result, 'Submission updated');
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return error(reply, 404, err.code, err.message);
    }
    return error(reply, 500, 'SUBMISSION_UPDATE_FAILED', 'Failed to update submission');
  }
};

export const listSubmissions = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IdParams;
    const result = await listSubmissionsQuery.execute(id, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Submissions loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'SUBMISSIONS_LOAD_FAILED', 'Failed to load submissions');
  }
};

export const getSubmissionDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id, submissionId } = request.params as IdSubmissionIdParams;
    const result = await getSubmissionDetailQuery.execute(id, submissionId, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Submission loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'SUBMISSION_LOAD_FAILED', 'Failed to load submission');
  }
};

export const downloadSubmission = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id, submissionId } = request.params as IdSubmissionIdParams;
    const assignment = await getSubmissionDetailQuery.execute(id, submissionId, request.user!.sub, request.user!.role);
    return reply.redirect(assignment.fileUrl);
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'SUBMISSION_LOAD_FAILED', 'Failed to load submission');
  }
};

export const getStudentAssignmentView = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IdParams;
    const result = await getStudentAssignmentViewQuery.execute(id, request.user!.sub, request.user!.role);
    return ok(reply, result, 'Assignment view loaded');
  } catch (err: unknown) {
    return handleDomainError(reply, err, 'VIEW_FAILED', 'Failed to load assignment view');
  }
};
