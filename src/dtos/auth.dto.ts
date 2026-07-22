export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface VerifyOtpDto {
  identifier: string;
  code: string;
}

export interface ResendOtpDto {
  identifier: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokenResponse {
  token: string;
}

export interface AuthOtpRequiredResponse {
  requiresOtp: true;
  userId: string;
}

export interface AuthUserIdResponse {
  userId: string;
}

export interface MessageResponse {
  message: string;
}

export interface OAuthCallbackResult {
  token: string;
  redirectUrl?: string;
}
