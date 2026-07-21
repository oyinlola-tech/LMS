export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const validStatuses = ['submitted', 'graded', 'needs_changes'];
const validRubrics = ['exceeds', 'meets', 'partial', 'redo'];

export function validateSubmitInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.fileUrl || typeof body.fileUrl !== 'string') {
    errors.push('fileUrl is required');
  }
  return { valid: errors.length === 0, errors };
}

export function validateGradeInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.submissionId || typeof body.submissionId !== 'string') {
    errors.push('submissionId is required');
  }
  if (!body.status || typeof body.status !== 'string') {
    errors.push('status is required');
  } else if (!validStatuses.includes(body.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  if (body.rubric && typeof body.rubric === 'string' && !validRubrics.includes(body.rubric)) {
    errors.push(`Invalid rubric. Must be one of: ${validRubrics.join(', ')}`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateUpdateSubmissionInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  return { valid: errors.length === 0, errors };
}
