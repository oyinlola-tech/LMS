export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProgressInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const { progressPercent, lastPositionSeconds, minutesSpent } = body;

  if (progressPercent !== undefined) {
    const p = Number(progressPercent);
    if (!isFinite(p) || p < 0 || p > 100) {
      errors.push('progressPercent must be a number between 0 and 100');
    }
  }
  if (lastPositionSeconds !== undefined) {
    const l = Number(lastPositionSeconds);
    if (!isFinite(l) || l < 0) {
      errors.push('lastPositionSeconds must be a non-negative number');
    }
  }
  if (minutesSpent !== undefined) {
    const m = Number(minutesSpent);
    if (!isFinite(m) || m < 0) {
      errors.push('minutesSpent must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateNoteInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    errors.push('Content is required');
  }
  if (body.timestampSeconds !== undefined) {
    const t = Number(body.timestampSeconds);
    if (!isFinite(t) || t < 0) {
      errors.push('timestampSeconds must be a non-negative number');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateBookmarkInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (body.timestampSeconds !== undefined) {
    const t = Number(body.timestampSeconds);
    if (!isFinite(t) || t < 0) {
      errors.push('timestampSeconds must be a non-negative number');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateCommentInput(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    errors.push('Content is required');
  }
  return { valid: errors.length === 0, errors };
}

export function validateQuizSubmit(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.attemptId || typeof body.attemptId !== 'string') {
    errors.push('attemptId is required');
  }
  if (!Array.isArray(body.answers)) {
    errors.push('answers must be an array');
  } else {
    body.answers.forEach((a: unknown, i: number) => {
      if (!a || typeof a !== 'object' || Array.isArray(a)) {
        errors.push(`answers[${i}] must be a non-null object`);
        return;
      }
      const ans = a as Record<string, unknown>;
      if (!ans.questionId || typeof ans.questionId !== 'string') {
        errors.push(`answers[${i}].questionId is required and must be a string`);
      }
      if (!ans.optionId || typeof ans.optionId !== 'string') {
        errors.push(`answers[${i}].optionId is required and must be a string`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}
