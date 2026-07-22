export interface OAuthCallbackResult {
  token?: string;
  redirectUrl?: string;
}

export interface AuthUser {
  sub: string;
  role: string;
  email?: string;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginBody {
  identifier: string;
  password: string;
}

export interface VerifyOtpBody {
  identifier: string;
  code: string;
}

export interface ResendOtpBody {
  identifier: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}
