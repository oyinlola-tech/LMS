import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getFinancialOverview, listTutorEarnings, getRevenueChart, getTutorFinancialDetail, listPayouts, updatePayout, getPlatformSettings, updatePlatformSettings } from '../controllers/adminFinancials.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/financials/overview', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getFinancialOverview);

  fastify.get('/financials/tutors', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listTutorEarnings);

  fastify.get('/financials/chart', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getRevenueChart);

  fastify.get('/financials/tutor/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getTutorFinancialDetail);

  fastify.get('/payouts', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listPayouts);

  fastify.patch('/payouts/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, updatePayout);

  fastify.get('/settings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getPlatformSettings);

  fastify.put('/settings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, updatePlatformSettings);
}
