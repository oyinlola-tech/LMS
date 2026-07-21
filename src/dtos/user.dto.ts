export interface UpdateProfileDto {
  bio?: string;
  skills?: string[] | string;
  avatarUrl?: string;
}

export interface UpdateAvatarDto {
  avatarUrl: string;
}

export interface UpdateInterestsDto {
  interests: string[];
}

export interface UpdateEmailDto {
  email: string;
}

export interface UpdateWeeklyGoalDto {
  weeklyGoalHours: number;
  weeklyGoalProgressHours?: number;
}

export interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  skills?: string[] | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

export interface InterestsResponse {
  interests: string[];
}
