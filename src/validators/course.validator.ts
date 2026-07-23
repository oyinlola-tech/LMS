export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEnroll(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.courseId || typeof body.courseId !== 'string' || !(body.courseId as string).trim()) {
    errors.push('courseId is required');
  }
  return { valid: errors.length === 0, errors };
}

export function validateCourseAnnouncement(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('Title is required');
  }
  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    errors.push('Content is required');
  }
  return { valid: errors.length === 0, errors };
}

export function validateCourseEvent(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('Title is required');
  }
  if (!body.type || typeof body.type !== 'string' || !body.type.trim()) {
    errors.push('Type is required');
  }
  if (!body.startTime) {
    errors.push('Start time is required');
  }
  if (!body.endTime) {
    errors.push('End time is required');
  }
  if (body.startTime && body.endTime) {
    const start = new Date(body.startTime as string);
    const end = new Date(body.endTime as string);
    if (isNaN(start.getTime())) {
      errors.push('Invalid start time');
    }
    if (isNaN(end.getTime())) {
      errors.push('Invalid end time');
    }
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
      errors.push('End time must be after start time');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateCourseComment(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    errors.push('Content is required');
  }
  return { valid: errors.length === 0, errors };
}
