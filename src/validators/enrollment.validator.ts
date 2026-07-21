export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUpdateProgress(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const { progressPercent, lastLessonId, lastPositionSeconds, hoursSpent } = body;

  if (progressPercent !== undefined && typeof progressPercent !== 'number') {
    errors.push('progressPercent must be a number');
  }
  if (lastLessonId !== undefined && typeof lastLessonId !== 'string') {
    errors.push('lastLessonId must be a string');
  }
  if (lastPositionSeconds !== undefined && typeof lastPositionSeconds !== 'number') {
    errors.push('lastPositionSeconds must be a number');
  }
  if (hoursSpent !== undefined && typeof hoursSpent !== 'number') {
    errors.push('hoursSpent must be a number');
  }

  return { valid: errors.length === 0, errors };
}
