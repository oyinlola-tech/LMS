import { FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { User, TutorProfile, LearnerStats, UserStreak, Milestone, UserSkillProgress, Follow, UserInterest, UserWarning } from '../models';
import { ok, error } from '../utils/response.util';
import { getCurrentUserQuery } from '../services/user/queries/getCurrentUser.query';
import { updateProfileCommand } from '../services/user/commands/updateProfile.command';
import { updateAvatarCommand } from '../services/user/commands/updateAvatar.command';
import { updateInterestsCommand } from '../services/user/commands/updateInterests.command';
import { updateEmailCommand } from '../services/user/commands/updateEmail.command';
import { updateWeeklyGoalCommand } from '../services/user/commands/updateWeeklyGoal.command';
import { AppError } from '../errors';
import { verifyPassword, hashPassword } from '../utils/password.util';
import {
  validateUpdateProfile,
  validateUpdateAvatar,
  validateUpdateInterests,
  validateUpdateEmail,
  validateUpdateWeeklyGoal,
} from '../validators/user.validator';
import type { UpdateProfileBody, UpdateAvatarBody, UpdateInterestsBody, UpdateEmailBody, UpdateWeeklyGoalBody } from '../types';

export const searchUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { q, studentId, role, tutorId, adminId, limit: queryLimit } = request.query as {
      q?: string; studentId?: string; role?: string; tutorId?: string; adminId?: string; limit?: string;
    };
    const where: Record<string, any> = {};
    if (role) where.role = role;

    if (studentId) {
      where.studentId = studentId;
    } else if (tutorId) {
      where.tutorId = tutorId;
    } else if (adminId) {
      where.adminId = adminId;
    } else if (q) {
      if (String(q).length > 100) {
        return error(reply, 400, 'VALIDATION_ERROR', 'Search query too long');
      }
      const escaped = String(q).replace(/[\\%_]/g, '\\$&');
      where[Op.or as any] = [
        { fullName: { [Op.like]: `%${escaped}%` } },
        { email: { [Op.like]: `%${escaped}%` } },
        { studentId: { [Op.like]: `%${escaped}%` } },
        { tutorId: { [Op.like]: `%${escaped}%` } },
        { adminId: { [Op.like]: `%${escaped}%` } },
      ];
    } else {
      return error(reply, 400, 'VALIDATION_ERROR', 'Provide q, studentId, tutorId, or adminId parameter');
    }

    const limit = Math.min(50, Math.max(1, Number(queryLimit) || 20));
    const users = await User.findAll({
      where,
      attributes: ['id', 'fullName', 'email', 'role', 'avatarUrl', 'coverUrl', 'studentId', 'tutorId', 'adminId', 'isVerified', 'checkmarkType', 'isPrivate'],
      limit,
      order: [['fullName', 'ASC']],
    });

    return ok(reply, users, 'Users found');
  } catch (err) {
    request.log.error(err, 'SEARCH_FAILED');
    return error(reply, 500, 'SEARCH_FAILED', 'Failed to search users');
  }
};

export const getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const currentUserId = request.user?.sub || null;
    const isOwner = currentUserId === id;

    const user = await User.findByPk(id, {
      attributes: ['id', 'fullName', 'role', 'bio', 'avatarUrl', 'coverUrl', 'location', 'skills', 'isPrivate', 'isVerified', 'checkmarkType'],
      include: [
        { model: TutorProfile, attributes: ['headline'] },
        { model: LearnerStats, attributes: ['coursesActive', 'coursesCompleted', 'hoursSpent', 'weeklyGoalHours', 'weeklyGoalProgressHours'] },
        { model: UserStreak, attributes: ['currentStreak', 'longestStreak', 'lastActiveDate'] },
        { model: Milestone, attributes: ['id', 'title', 'dueDate', 'completedAt'], limit: 10, order: [['createdAt', 'DESC']] },
        { model: UserSkillProgress, attributes: ['skill', 'level', 'percent', 'lessonsCompleted', 'hoursSpent'], limit: 20 },
      ],
    });
    if (!user) return error(reply, 404, 'NOT_FOUND', 'User not found');

    const followerCount = await Follow.count({ where: { followingId: id } });
    const followingCount = await Follow.count({ where: { followerId: id } });

    let isFollowing = false;
    let isPending = false;
    let doesFollowBack = false;
    if (currentUserId && !isOwner) {
      const followRel = await Follow.findOne({ where: { followerId: currentUserId, followingId: id } });
      if (followRel) {
        isFollowing = followRel.status === 'accepted';
        isPending = followRel.status === 'pending';
      }
      const followBack = await Follow.findOne({ where: { followerId: id, followingId: currentUserId, status: 'accepted' } });
      doesFollowBack = !!followBack;
    }

    if (user.isPrivate && !isOwner && !isFollowing) {
      const publicData: any = {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        avatarUrl: null,
        coverUrl: null,
        isPrivate: true,
        isPending,
        isVerified: user.isVerified,
        checkmarkType: user.checkmarkType,
        followerCount,
        followingCount,
        isFollowing: false,
        doesFollowBack,
      };
      if (isPending) {
        publicData.message = 'Follow request pending';
      } else {
        publicData.message = 'This profile is private';
      }
      return ok(reply, publicData, 'Profile is private');
    }

    const profileData: any = {
      ...user.toJSON(),
      followerCount,
      followingCount,
      isFollowing,
      isPending,
      doesFollowBack,
      isOwner,
    };
    if (!isOwner) {
      delete profileData.studentId;
      delete profileData.tutorId;
      delete profileData.adminId;
    }
    return ok(reply, profileData, 'Profile loaded');
  } catch (err) {
    request.log.error(err, 'PROFILE_LOAD_FAILED');
    return error(reply, 500, 'PROFILE_LOAD_FAILED', 'Failed to load profile');
  }
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await getCurrentUserQuery.execute(request.user!.sub);
    return ok(reply, result, 'Profile loaded');
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return error(reply, 404, err.code, err.message);
    }
    return error(reply, 500, 'PROFILE_LOAD_FAILED', 'Failed to load profile');
  }
};

export const updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as UpdateProfileBody;
  const validation = validateUpdateProfile(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, validation.errorCode!, validation.errorMessage!);
  }
  try {
    await updateProfileCommand.execute({
      userId: request.user!.sub,
      bio: body.bio,
      skills: body.skills,
      avatarUrl: body.avatarUrl,
    });
    return ok(reply, null, 'Profile updated');
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return error(reply, 404, err.code, err.message);
    }
    return error(reply, 500, 'PROFILE_UPDATE_FAILED', 'Failed to update profile');
  }
};

export const updateAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as UpdateAvatarBody;
  const validation = validateUpdateAvatar(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, validation.errorCode!, validation.errorMessage!);
  }
  try {
    const result = await updateAvatarCommand.execute({
      userId: request.user!.sub,
      avatarUrl: body.avatarUrl,
    });
    return ok(reply, { avatarUrl: result.avatarUrl }, 'Avatar updated');
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return error(reply, 404, err.code, err.message);
    }
    return error(reply, 500, 'AVATAR_UPDATE_FAILED', 'Failed to update avatar');
  }
};

export const updateCover = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { coverUrl } = (request.body || {}) as { coverUrl?: string };
    if (!coverUrl) return error(reply, 400, 'VALIDATION_ERROR', 'coverUrl is required');
    await User.update({ coverUrl }, { where: { id: request.user!.sub } });
    return ok(reply, { coverUrl }, 'Cover photo updated');
  } catch (err) {
    request.log.error(err, 'COVER_UPDATE_FAILED');
    return error(reply, 500, 'COVER_UPDATE_FAILED', 'Failed to update cover photo');
  }
};

export const updatePrivacy = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { isPrivate } = (request.body || {}) as { isPrivate?: boolean };
    if (typeof isPrivate !== 'boolean') return error(reply, 400, 'VALIDATION_ERROR', 'isPrivate (boolean) is required');
    await User.update({ isPrivate }, { where: { id: request.user!.sub } });
    return ok(reply, { isPrivate }, `Profile set to ${isPrivate ? 'private' : 'public'}`);
  } catch (err) {
    request.log.error(err, 'PRIVACY_UPDATE_FAILED');
    return error(reply, 500, 'PRIVACY_UPDATE_FAILED', 'Failed to update privacy');
  }
};

export const updateInterests = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as UpdateInterestsBody;
  const validation = validateUpdateInterests(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, validation.errorCode!, validation.errorMessage!);
  }
  try {
    const result = await updateInterestsCommand.execute({
      userId: request.user!.sub,
      interests: body.interests,
    });
    return ok(reply, result, 'Interests updated');
  } catch (err) {
    request.log.error(err, 'INTERESTS_UPDATE_FAILED');
    return error(reply, 500, 'INTERESTS_UPDATE_FAILED', 'Failed to update interests');
  }
};

export const updateEmail = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as UpdateEmailBody;
  const validation = validateUpdateEmail(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, validation.errorCode!, validation.errorMessage!);
  }
  try {
    const result = await updateEmailCommand.execute({
      userId: request.user!.sub,
      email: body.email,
    });
    return ok(reply, { email: result.email }, 'Email updated, verification required');
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return error(reply, 404, err.code, err.message);
    }
    if (err instanceof AppError && err.code === 'EMAIL_EXISTS') {
      return error(reply, 409, err.code, err.message);
    }
    return error(reply, 500, 'EMAIL_UPDATE_FAILED', 'Failed to update email');
  }
};

export const updateWeeklyGoal = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body || {}) as UpdateWeeklyGoalBody;
  const validation = validateUpdateWeeklyGoal(body as Record<string, any>);
  if (!validation.valid) {
    return error(reply, 400, validation.errorCode!, validation.errorMessage!);
  }
  try {
    await updateWeeklyGoalCommand.execute({
      userId: request.user!.sub,
      weeklyGoalHours: body.weeklyGoalHours,
      weeklyGoalProgressHours: body.weeklyGoalProgressHours,
    });
    return ok(reply, null, 'Weekly goal updated');
  } catch (err) {
    request.log.error(err, 'WEEKLY_GOAL_UPDATE_FAILED');
    return error(reply, 500, 'WEEKLY_GOAL_UPDATE_FAILED', 'Failed to update weekly goal');
  }
};

export const updateFcmToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { token } = (request.body || {}) as { token?: string };
    if (!token) return error(reply, 400, 'VALIDATION_ERROR', 'Token is required');
    await User.update({ fcmToken: token }, { where: { id: request.user!.sub } });
    return ok(reply, null, 'FCM token saved');
  } catch (err) {
    request.log.error(err, 'FCM_TOKEN_FAILED');
    return error(reply, 500, 'FCM_TOKEN_FAILED', 'Failed to save FCM token');
  }
};

export const getUserWarnings = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const warnings = await UserWarning.findAll({
      where: { userId: request.user!.sub },
      include: [{ model: User, as: 'issuedBy', attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    return ok(reply, warnings, 'Warnings loaded');
  } catch (err) {
    request.log.error(err, 'WARNINGS_LOAD_FAILED');
    return error(reply, 500, 'WARNINGS_FAILED', 'Failed to load warnings');
  }
};

export const getNotificationPreferences = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await User.findByPk(request.user!.sub, { attributes: ['notificationPreferences'] });
    const prefs = (user as any)?.notificationPreferences || {
      email: {
        courseUpdates: true,
        announcements: true,
        messages: true,
        weeklyDigest: false,
      },
      push: {
        assignments: true,
        announcements: true,
        messages: true,
      },
    };
    return ok(reply, prefs, 'Notification preferences loaded');
  } catch (err) {
    request.log.error(err, 'NOTIFICATION_PREFS_LOAD_FAILED');
    return error(reply, 500, 'NOTIFICATION_PREFS_LOAD_FAILED', 'Failed to load notification preferences');
  }
};

export const updateNotificationPreferences = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = (request.body || {}) as {
      email?: Record<string, boolean>;
      push?: Record<string, boolean>;
    };
    const preferences = {
      email: body.email || {},
      push: body.push || {},
    };
    await User.update({ notificationPreferences: preferences }, { where: { id: request.user!.sub } });
    return ok(reply, preferences, 'Notification preferences updated');
  } catch (err) {
    request.log.error(err, 'NOTIFICATION_PREFS_FAILED');
    return error(reply, 500, 'NOTIFICATION_PREFS_FAILED', 'Failed to update notification preferences');
  }
};

export const changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { currentPassword, newPassword } = (request.body || {}) as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return error(reply, 400, 'VALIDATION_ERROR', 'currentPassword and newPassword are required');
    }
    if (newPassword.length < 8) {
      return error(reply, 400, 'VALIDATION_ERROR', 'newPassword must be at least 8 characters');
    }
    const user = await User.findByPk(request.user!.sub);
    if (!user || !user.passwordHash) {
      return error(reply, 400, 'VALIDATION_ERROR', 'User not found or has no password');
    }
    const valid = await verifyPassword(user.passwordHash, currentPassword);
    if (!valid) {
      return error(reply, 401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
    }
    const newHash = await hashPassword(newPassword);
    await user.update({ passwordHash: newHash });
    return ok(reply, null, 'Password changed successfully');
  } catch (err) {
    request.log.error(err, 'PASSWORD_CHANGE_FAILED');
    return error(reply, 500, 'PASSWORD_CHANGE_FAILED', 'Failed to change password');
  }
};
