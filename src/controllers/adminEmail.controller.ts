import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { EmailLog } from '../models';

export async function listEmailLogs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = '1', limit = '20', status, to, search } = request.query as any;
    const where: any = {};
    if (status) where.status = status;
    if (to) where.to = { [require('sequelize').Op.like]: `%${to}%` };
    if (search) {
      where[require('sequelize').Op.or] = [
        { subject: { [require('sequelize').Op.like]: `%${search}%` } },
        { to: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await (EmailLog as any).findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return ok(reply, { items: rows, total: count, page: Number(page), limit: Number(limit) }, 'Email logs loaded');
  } catch (err) {
    request.log.error(err, 'EMAIL_LOGS_FAILED');
    return error(reply, 500, 'EMAIL_LOGS_FAILED', 'Failed to load email logs');
  }
}

export async function getEmailLog(request: FastifyRequest, reply: FastifyReply) {
  try {
    const log = await EmailLog.findByPk((request.params as any).id);
    if (!log) return error(reply, 404, 'NOT_FOUND', 'Email log not found');
    return ok(reply, log, 'Email log loaded');
  } catch (err) {
    request.log.error(err, 'EMAIL_LOG_FAILED');
    return error(reply, 500, 'EMAIL_LOG_FAILED', 'Failed to load email log');
  }
}
