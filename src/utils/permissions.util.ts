import { UserRole } from '../enums';

export const Permissions = {
  delete_user: [UserRole.SUPER_ADMIN],
  create_admin: [UserRole.SUPER_ADMIN],
  create_user: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  view_all_users: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  manage_platform_settings: [UserRole.SUPER_ADMIN],
  manage_payouts: [UserRole.SUPER_ADMIN],
  view_financials_all: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  view_financials_own: [UserRole.TUTOR],
  request_payout: [UserRole.TUTOR],
  set_course_price: [UserRole.TUTOR],
  manage_courses_own: [UserRole.TUTOR],
  suspend_user: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  create_career: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  create_blog_post: [UserRole.ADMIN, UserRole.TUTOR, UserRole.SUPER_ADMIN],
};

export function hasPermission(role: string | undefined, permission: keyof typeof Permissions): boolean {
  if (!role) return false;
  const allowed = Permissions[permission];
  return allowed.includes(role as UserRole);
}
