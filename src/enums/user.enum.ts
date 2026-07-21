export enum UserRole {
  LEARNER = 'learner',
  TUTOR = 'tutor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.LEARNER]: 0,
  [UserRole.TUTOR]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}
