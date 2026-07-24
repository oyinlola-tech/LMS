import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { Report, UserWarning, Notification, AdminAuditLog } from '../models';
import { sendEmail, templates } from '../services/mail';

export async function listReports(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = '1', limit = '20', status } = request.query as any;
    const where: any = {};
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await (Report as any).findAndCountAll({
      where,
      include: [
        { model: require('../models').User, as: 'reporter', attributes: ['id', 'fullName', 'email', 'avatarUrl'] },
        { model: require('../models').User, as: 'reported', attributes: ['id', 'fullName', 'email', 'avatarUrl', 'status', 'role'] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return ok(reply, { items: rows, total: count, page: Number(page), limit: Number(limit) }, 'Reports loaded');
  } catch (err) {
    request.log.error(err, 'REPORTS_LOAD_FAILED');
    return error(reply, 500, 'REPORTS_FAILED', 'Failed to load reports');
  }
}

export async function getReport(request: FastifyRequest, reply: FastifyReply) {
  try {
    const report = await Report.findByPk((request.params as any).id, {
      include: [
        { model: require('../models').User, as: 'reporter', attributes: ['id', 'fullName', 'email', 'avatarUrl'] },
        { model: require('../models').User, as: 'reported', attributes: ['id', 'fullName', 'email', 'avatarUrl', 'status', 'role'] },
      ],
    });
    if (!report) return error(reply, 404, 'NOT_FOUND', 'Report not found');
    return ok(reply, report, 'Report loaded');
  } catch (err) {
    request.log.error(err, 'REPORT_LOAD_FAILED');
    return error(reply, 500, 'REPORT_FAILED', 'Failed to load report');
  }
}

export async function resolveReport(request: FastifyRequest, reply: FastifyReply) {
  try {
    const report = await Report.findByPk((request.params as any).id);
    if (!report) return error(reply, 404, 'NOT_FOUND', 'Report not found');
    if (report.status !== 'open') return error(reply, 400, 'INVALID_STATE', 'Report is not open');

    const { action, reason } = (request.body as Record<string, any>) || {};
    const actorId = request.user!.sub;

    if (action === 'warn') {
      await UserWarning.create({
        userId: report.reportedId,
        issuedById: actorId,
        reason: reason || report.reason,
      });

      await Notification.create({
        UserId: report.reportedId,
        type: 'system',
        title: 'You have received a warning',
        message: reason || 'A moderator has issued a warning on your account.',
        data: { reportId: report.id },
      });

      const { User } = require('../models');
      const reportedUser = await User.findByPk(report.reportedId, { attributes: ['email', 'fullName'] });
      if (reportedUser) {
        await sendEmail({ to: reportedUser.email, ...templates.accountWarning({ fullName: reportedUser.fullName, reason: reason || report.reason }) });
      }

      report.status = 'resolved';
      await report.save();

      await (AdminAuditLog as any).create({
        actorId,
        title: 'Warning issued',
        content: `A warning was issued to user ${report.reportedId} for report ${report.id}.`,
        status: 'warning',
        meta: JSON.stringify({ reportId: report.id, reason }),
      });

      return ok(reply, { status: 'warned' }, 'Warning issued');
    }

    if (action === 'dismiss') {
      report.status = 'dismissed';
      await report.save();

      await (AdminAuditLog as any).create({
        actorId,
        title: 'Report dismissed',
        content: `Report ${report.id} was dismissed.`,
        status: 'success',
        meta: JSON.stringify({ reportId: report.id }),
      });

      return ok(reply, { status: 'dismissed' }, 'Report dismissed');
    }

    return error(reply, 400, 'VALIDATION_ERROR', 'action must be warn or dismiss');
  } catch (err) {
    request.log.error(err, 'REPORT_RESOLVE_FAILED');
    return error(reply, 500, 'REPORT_RESOLVE_FAILED', 'Failed to resolve report');
  }
}

export async function listWarnings(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = '1', limit = '20' } = request.query as any;
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await (UserWarning as any).findAndCountAll({
      include: [
        { model: require('../models').User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatarUrl'] },
        { model: require('../models').User, as: 'issuedBy', attributes: ['id', 'fullName', 'email'] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return ok(reply, { items: rows, total: count, page: Number(page), limit: Number(limit) }, 'Warnings loaded');
  } catch (err) {
    request.log.error(err, 'WARNINGS_LOAD_FAILED');
    return error(reply, 500, 'WARNINGS_FAILED', 'Failed to load warnings');
  }
}
