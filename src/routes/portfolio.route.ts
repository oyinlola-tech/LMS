import { FastifyInstance } from 'fastify';
import { UserRole } from '../enums';
import {
  getPublicPortfolio, getMyPortfolio, savePortfolio, getPortfolioCourses,
  listThemes, listPlans,
  savePage, deletePage, listPages,
  submitContact, listContacts, markContactRead,
  saveDomain, verifyDomain,
  exportCV, adminSavePlan, uploadPortfolioImage,
  submitReview, listReviews, topReviews, deleteReview,
} from '../controllers/portfolio.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/themes', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listThemes);

  fastify.get('/plans', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listPlans);

  fastify.get('/cv', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, exportCV);

  fastify.get('/public', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPublicPortfolio);

  fastify.post('/contact', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, submitContact);

  fastify.post('/reviews', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, submitReview);

  fastify.get('/reviews', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listReviews);

  fastify.get('/reviews/top', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, topReviews);

  fastify.get('/me/courses', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPortfolioCourses);

  fastify.get('/:userId/courses', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPortfolioCourses);

  fastify.get('/me/contacts', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listContacts);

  fastify.put('/me/contacts/:id/read', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, markContactRead);

  fastify.get('/me', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getMyPortfolio);

  fastify.put('/me', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, savePortfolio);

  fastify.get('/me/pages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listPages);

  fastify.post('/me/pages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, savePage);

  fastify.put('/me/pages/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, savePage);

  fastify.delete('/me/pages/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deletePage);

  fastify.delete('/me/reviews/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteReview);

  fastify.post('/me/upload', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadPortfolioImage);

  fastify.post('/me/domain', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, saveDomain);

  fastify.post('/me/domain/verify', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, verifyDomain);

  fastify.get('/admin/plans', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listPlans);

  fastify.post('/admin/plans', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, adminSavePlan);

  fastify.put('/admin/plans/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, adminSavePlan);
}
