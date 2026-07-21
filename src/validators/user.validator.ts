import { isValidEmail } from './auth.validator';
import type { ValidationResult } from './auth.validator';

export const validateUpdateProfile = (body: Record<string, unknown>): ValidationResult => {
  const { bio, skills, avatarUrl } = body;
  if (bio !== undefined && typeof bio !== 'string') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'bio must be a string' };
  }
  if (skills !== undefined && !Array.isArray(skills) && typeof skills !== 'string') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'skills must be an array or a comma-separated string' };
  }
  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'avatarUrl must be a string' };
  }
  return { valid: true };
};

export const validateUpdateAvatar = (body: Record<string, unknown>): ValidationResult => {
  const { avatarUrl } = body;
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'avatarUrl is required' };
  }
  return { valid: true };
};

export const validateUpdateInterests = (body: Record<string, unknown>): ValidationResult => {
  const { interests } = body;
  if (!Array.isArray(interests)) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Interests must be an array of strings' };
  }
  return { valid: true };
};

export const validateUpdateEmail = (body: Record<string, unknown>): ValidationResult => {
  const { email } = body;
  if (!email || typeof email !== 'string') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'email is required' };
  }
  if (!isValidEmail(email)) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Invalid email format' };
  }
  return { valid: true };
};

export const validateUpdateWeeklyGoal = (body: Record<string, unknown>): ValidationResult => {
  const { weeklyGoalHours, weeklyGoalProgressHours } = body;
  if (typeof weeklyGoalHours !== 'number') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'weeklyGoalHours must be a number' };
  }
  if (weeklyGoalProgressHours !== undefined && typeof weeklyGoalProgressHours !== 'number') {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'weeklyGoalProgressHours must be a number' };
  }
  return { valid: true };
};
