import type {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dtos/auth.dto';

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

export const normalizeEmail = (email: string): string => {
  return String(email || '').trim().toLowerCase();
};

export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const isStrongPassword = (pw: string): boolean => {
  return (
    typeof pw === 'string' &&
    pw.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
};

export const PASSWORD_MIN_LENGTH_CONST = PASSWORD_MIN_LENGTH;

export interface ValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export const validateRegister = (body: Record<string, unknown>): ValidationResult => {
  const { fullName, email, password, confirmPassword } = body as unknown as RegisterDto;
  if (!fullName || !email || !password || !confirmPassword) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'All fields are required' };
  }
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Invalid email address' };
  }
  if (!isStrongPassword(password)) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and contain letters and numbers` };
  }
  if (password !== confirmPassword) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Passwords do not match' };
  }
  return { valid: true };
};

export const validateLogin = (body: Record<string, unknown>): ValidationResult => {
  const { identifier, password } = body as unknown as LoginDto;
  if (!identifier || !password) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Email/Matric Number and password are required' };
  }
  return { valid: true };
};

export const validateVerifyOtp = (body: Record<string, unknown>): ValidationResult => {
  const { identifier, code } = body as unknown as VerifyOtpDto;
  if (!identifier || !code) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Identifier and code are required' };
  }
  return { valid: true };
};

export const validateResendOtp = (body: Record<string, unknown>): ValidationResult => {
  const { identifier } = body as unknown as ResendOtpDto;
  if (!identifier) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Identifier is required' };
  }
  return { valid: true };
};

export const validateForgotPassword = (body: Record<string, unknown>): ValidationResult => {
  const { email } = body as unknown as ForgotPasswordDto;
  if (!email) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Email is required' };
  }
  return { valid: true };
};

export const validateResetPassword = (body: Record<string, unknown>): ValidationResult => {
  const { token, password, confirmPassword } = body as unknown as ResetPasswordDto;
  if (!token || !password || !confirmPassword) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Token and passwords are required' };
  }
  if (!isStrongPassword(password)) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and contain uppercase, lowercase, and a digit` };
  }
  if (password !== confirmPassword) {
    return { valid: false, errorCode: 'VALIDATION_ERROR', errorMessage: 'Passwords do not match' };
  }
  return { valid: true };
};
