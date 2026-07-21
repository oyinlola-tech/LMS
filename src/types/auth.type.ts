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
  email: string;
  password: string;
}

export interface VerifyOtpBody {
  email: string;
  code: string;
}

export interface ResendOtpBody {
  email: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}
