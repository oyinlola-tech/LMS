import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { User, TutorProfile, LearnerStats, UserStreak, Milestone, UserSkillProgress, Follow, UserInterest } from '../models';
import { ok, error } from '../utils/response.util';
import { getCurrentUserQuery } from '../services/user/queries/getCurrentUser.query';
import { updateProfileCommand } from '../services/user/commands/updateProfile.command';
import { updateAvatarCommand } from '../services/user/commands/updateAvatar.command';
import { updateInterestsCommand } from '../services/user/commands/updateInterests.command';
import { updateEmailCommand } from '../services/user/commands/updateEmail.command';
import { updateWeeklyGoalCommand } from '../services/user/commands/updateWeeklyGoal.command';
import { AppError } from '../errors';
import {
  validateUpdateProfile,
  validateUpdateAvatar,
  validateUpdateInterests,
  validateUpdateEmail,
  validateUpdateWeeklyGoal,
} from '../validators/user.validator';
import type { UpdateProfileBody, UpdateAvatarBody, UpdateInterestsBody, UpdateEmailBody, UpdateWeeklyGoalBody } from '../types';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await User.findByPk(id, {
        attributes: ['id', 'fullName', 'email', 'role', 'bio', 'avatarUrl', 'location', 'skills'],
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

      return ok(reply, { ...user.toJSON(), followerCount, followingCount }, 'Profile loaded');
    } catch {
      return error(reply, 500, 'PROFILE_LOAD_FAILED', 'Failed to load profile');
    }
  });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getCurrentUserQuery.execute(request.user!.sub);
      return ok(reply, result, 'Profile loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'PROFILE_LOAD_FAILED', 'Failed to load profile');
    }
  });

  fastify.put('/me/profile', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
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
  });

  fastify.put('/me/avatar', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
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
  });

  fastify.put('/me/interests', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
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
    } catch {
      return error(reply, 500, 'INTERESTS_UPDATE_FAILED', 'Failed to update interests');
    }
  });

  fastify.put('/me/email', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
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
  });

  fastify.put('/me/weekly-goal', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
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
    } catch {
      return error(reply, 500, 'WEEKLY_GOAL_UPDATE_FAILED', 'Failed to update weekly goal');
    }
  });

  fastify.put('/fcm-token', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token } = (request.body || {}) as { token?: string };
      if (!token) return error(reply, 400, 'VALIDATION_ERROR', 'Token is required');
      await User.update({ fcmToken: token }, { where: { id: request.user!.sub } });
      return ok(reply, null, 'FCM token saved');
    } catch {
      return error(reply, 500, 'FCM_TOKEN_FAILED', 'Failed to save FCM token');
    }
  });
}
