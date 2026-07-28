import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getFinancialOverview, listTutorEarnings, getRevenueChart, getTutorFinancialDetail, listPayouts, updatePayout, getPlatformSettings, updatePlatformSettings } from '../controllers/adminFinancials.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/financials/overview', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getFinancialOverview);

  fastify.get('/financials/tutors', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listTutorEarnings);

  fastify.get('/financials/chart', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getRevenueChart);

  fastify.get('/financials/tutor/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getTutorFinancialDetail);

  fastify.get('/payouts', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listPayouts);

  fastify.patch('/payouts/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updatePayout);

  fastify.get('/settings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPlatformSettings);

  fastify.put('/settings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updatePlatformSettings);
}