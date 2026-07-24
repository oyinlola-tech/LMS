import { FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { User, Enrollment, Course, PlatformSetting, PayoutRequest } from '../models';
import { ok, created, error } from '../utils/response.util';

export const getEarnings = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutorId = request.user!.sub;
    const courseIds = (await Course.findAll({ where: { tutorId }, attributes: ['id'] })).map(c => c.id);
    if (courseIds.length === 0) return ok(reply, { totalEarnings: 0, totalStudents: 0, courseCount: 0, pendingPayouts: 0, commissionPercent: 15 });

    const totalEarnings = await Enrollment.sum('pricePaid', { where: { CourseId: { [Op.in]: courseIds } } as any }) || 0;
    const totalStudents = await Enrollment.count({ where: { CourseId: { [Op.in]: courseIds } } as any });
    const pendingPayouts = await PayoutRequest.sum('amount', { where: { tutorId, status: 'pending' } }) || 0;
    const payoutsApproved = await PayoutRequest.sum('amount', { where: { tutorId, status: 'approved' } }) || 0;
    const commissionSetting = await PlatformSetting.findByPk('commission_percent');
    const commissionPercent = commissionSetting ? parseFloat(commissionSetting.value) : 15;

    return ok(reply, {
      totalEarnings,
      totalStudents,
      courseCount: courseIds.length,
      pendingPayouts,
      payoutsApproved,
      availableForPayout: totalEarnings - payoutsApproved - pendingPayouts,
      commissionPercent,
    });
  } catch (err: any) {
    return error(reply, 500, 'EARNINGS_FAILED', 'Failed to load earnings');
  }
};

export const getCourseAnalytics = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutorId = request.user!.sub;
    const courses = await Course.findAll({
      where: { tutorId },
      attributes: ['id', 'title', 'price', 'createdAt'],
    });
    const enriched = await Promise.all(courses.map(async (course) => {
      const enrollments = await Enrollment.count({ where: { CourseId: course.id } as any });
      const revenue = await Enrollment.sum('pricePaid', { where: { CourseId: course.id } as any }) || 0;
      return { ...course.toJSON(), totalEnrollments: enrollments, revenue };
    }));
    return ok(reply, enriched);
  } catch (err: any) {
    return error(reply, 500, 'COURSE_ANALYTICS_FAILED', 'Failed to load course analytics');
  }
};

export const requestPayout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutorId = request.user!.sub;
    const { amount } = (request.body as any) || {};
    if (!amount || amount <= 0) return error(reply, 400, 'VALIDATION_ERROR', 'Amount must be positive');
    const existingPending = await PayoutRequest.findOne({ where: { tutorId, status: 'pending' } });
    if (existingPending) return error(reply, 400, 'PENDING_EXISTS', 'You already have a pending payout request');

    const payout = await PayoutRequest.create({ tutorId, amount, currency: 'USD', status: 'pending' });
    return created(reply, payout, 'Payout requested');
  } catch (err: any) {
    return error(reply, 500, 'PAYOUT_REQUEST_FAILED', 'Failed to request payout');
  }
};

export const getPayoutHistory = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tutorId = request.user!.sub;
    const payouts = await PayoutRequest.findAll({
      where: { tutorId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return ok(reply, payouts);
  } catch (err: any) {
    return error(reply, 500, 'PAYOUT_HISTORY_FAILED', 'Failed to load payout history');
  }
};