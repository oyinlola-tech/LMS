import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Op, col, fn } from 'sequelize';
import { UserRole } from '../enums';
import { ok, error } from '../utils/response.util';
import { User, Enrollment, Course, CourseCertificate, PayoutRequest, PlatformSetting } from '../models';
import { hasPermission } from '../utils/permissions.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/financials/overview', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const totalRevenue = await Enrollment.sum('pricePaid') || 0;
      const totalPayouts = await PayoutRequest.sum('amount', { where: { status: 'approved' } }) || 0;
      const totalEnrollments = await Enrollment.count();
      const totalCertificates = await CourseCertificate.count();
      const activeStudents = await User.count({ where: { role: UserRole.LEARNER, status: 'active' } });
      const activeTutors = await User.count({ where: { role: UserRole.TUTOR, status: 'active' } });
      const commissionSetting = await PlatformSetting.findByPk('commission_percent');
      const commissionPercent = commissionSetting ? parseFloat(commissionSetting.value) : 15;

      return ok(reply, {
        totalRevenue,
        totalPayouts,
        platformNet: totalRevenue - totalPayouts,
        totalEnrollments,
        totalCertificates,
        activeStudents,
        activeTutors,
        commissionPercent,
      });
    } catch (err: any) {
      return error(reply, 500, 'FINANCIALS_FAILED', 'Failed to load financial overview');
    }
  });

  fastify.get('/financials/tutors', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = '1', limit = '20' } = request.query as any;
      const offset = (Number(page) - 1) * Number(limit);
      const tutors = await User.findAll({
        where: { role: UserRole.TUTOR },
        attributes: ['id', 'fullName', 'email', 'avatarUrl', 'createdAt'],
        limit: Number(limit),
        offset,
        subQuery: false,
      });

      const tutorEarnings = await Promise.all(tutors.map(async (tutor) => {
        const courseIds = (await Course.findAll({ where: { tutorId: tutor.id }, attributes: ['id'] })).map(c => c.id);
        if (courseIds.length === 0) return { ...tutor.toJSON(), totalEarnings: 0, totalStudents: 0, courseCount: 0 };
        const earnings = await Enrollment.sum('pricePaid', { where: { CourseId: { [Op.in]: courseIds } } as any }) || 0;
        const students = await Enrollment.count({ where: { CourseId: { [Op.in]: courseIds } } as any });
        return { ...tutor.toJSON(), totalEarnings: earnings, totalStudents: students, courseCount: courseIds.length };
      }));

      return ok(reply, { tutors: tutorEarnings, total: tutors.length });
    } catch (err: any) {
      return error(reply, 500, 'TUTOR_FINANCIALS_FAILED', 'Failed to load tutor earnings');
    }
  });

  fastify.get('/financials/chart', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { range = '12m' } = request.query as any;
      const monthsBack = range === '30d' ? 1 : range === '6m' ? 6 : 12;
      const since = new Date();
      since.setMonth(since.getMonth() - monthsBack);

      const enrollments = await Enrollment.findAll({
        where: { createdAt: { [Op.gte]: since } } as any,
        attributes: [[fn('date_trunc', 'month', col('createdAt')), 'month'], [fn('SUM', col('pricePaid')), 'revenue'], [fn('COUNT', col('id')), 'count']],
        group: ['month'],
        order: [[col('month'), 'ASC']],
        raw: true,
      });

      return ok(reply, { data: enrollments, range });
    } catch (err: any) {
      return error(reply, 500, 'CHART_FAILED', 'Failed to load chart data');
    }
  });

  fastify.get('/financials/tutor/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tutorId = (request.params as any).id;
      const tutor = await User.findByPk(tutorId, { attributes: ['id', 'fullName', 'email', 'avatarUrl'] });
      if (!tutor || tutor.role !== UserRole.TUTOR) return error(reply, 404, 'NOT_FOUND', 'Tutor not found');
      const courseIds = (await Course.findAll({ where: { tutorId }, attributes: ['id'] })).map(c => c.id);
      if (courseIds.length === 0) return ok(reply, { tutor, totalEarnings: 0, totalStudents: 0, courseCount: 0, pendingPayouts: 0 });
      const earnings = await Enrollment.sum('pricePaid', { where: { CourseId: { [Op.in]: courseIds } } as any }) || 0;
      const students = await Enrollment.count({ where: { CourseId: { [Op.in]: courseIds } } as any });
      const pendingPayouts = await PayoutRequest.sum('amount', { where: { tutorId, status: 'pending' } }) || 0;
      return ok(reply, { tutor, totalEarnings: earnings, totalStudents: students, courseCount: courseIds.length, pendingPayouts });
    } catch (err: any) {
      return error(reply, 500, 'TUTOR_FINANCIAL_FAILED', 'Failed to load tutor financial detail');
    }
  });

  fastify.get('/payouts', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, page = '1', limit = '20' } = request.query as any;
      const where: any = {};
      if (status) where.status = status;
      const offset = (Number(page) - 1) * Number(limit);
      const payouts = await PayoutRequest.findAndCountAll({
        where,
        include: [
          { model: User, as: 'tutor', attributes: ['id', 'fullName', 'email'] },
          { model: User, as: 'approvedBy', attributes: ['id', 'fullName'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
      });
      return ok(reply, { payouts: payouts.rows, total: payouts.count });
    } catch (err: any) {
      return error(reply, 500, 'PAYOUTS_FAILED', 'Failed to load payouts');
    }
  });

  fastify.patch('/payouts/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!hasPermission(request.user?.role, 'manage_payouts')) {
      return error(reply, 403, 'FORBIDDEN', 'Only super admin can manage payouts');
    }
    try {
      const { id } = request.params as any;
      const { status, adminNote } = (request.body as any) || {};
      if (!['approved', 'rejected'].includes(status)) return error(reply, 400, 'VALIDATION_ERROR', 'Status must be approved or rejected');
      const payout = await PayoutRequest.findByPk(id);
      if (!payout) return error(reply, 404, 'NOT_FOUND', 'Payout not found');
      await payout.update({
        status,
        adminNote: adminNote || null,
        approvedAt: status === 'approved' ? new Date() : undefined,
        approvedById: status === 'approved' ? request.user!.sub : null,
      });
      return ok(reply, payout, `Payout ${status}`);
    } catch (err: any) {
      return error(reply, 500, 'PAYOUT_UPDATE_FAILED', 'Failed to update payout');
    }
  });

  fastify.get('/settings', { preHandler: [fastify.authenticate] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    if (!hasPermission(_request.user?.role, 'manage_platform_settings')) {
      return error(reply, 403, 'FORBIDDEN', 'Only super admin can view settings');
    }
    try {
      const settings = await PlatformSetting.findAll();
      const map: Record<string, string> = {};
      settings.forEach(s => { map[s.key] = s.value; });
      return ok(reply, map);
    } catch (err: any) {
      return error(reply, 500, 'SETTINGS_FAILED', 'Failed to load settings');
    }
  });

  fastify.put('/settings', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!hasPermission(request.user?.role, 'manage_platform_settings')) {
      return error(reply, 403, 'FORBIDDEN', 'Only super admin can update settings');
    }
    try {
      const body = (request.body as Record<string, any>) || {};
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string') {
          await PlatformSetting.upsert({ key, value });
        }
      }
      return ok(reply, null, 'Settings updated');
    } catch (err: any) {
      return error(reply, 500, 'SETTINGS_UPDATE_FAILED', 'Failed to update settings');
    }
  });
}
