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
  fastify.get('/themes', listThemes);

  fastify.get('/plans', listPlans);

  fastify.get('/cv', exportCV);

  fastify.get('/public', getPublicPortfolio);

  fastify.post('/contact', submitContact);

  fastify.post('/reviews', submitReview);

  fastify.get('/reviews', listReviews);

  fastify.get('/reviews/top', topReviews);

  fastify.get('/me/courses', { preHandler: [fastify.authenticate] }, getPortfolioCourses);

  fastify.get('/:userId/courses', getPortfolioCourses);

  fastify.get('/me/contacts', { preHandler: [fastify.authenticate] }, listContacts);

  fastify.put('/me/contacts/:id/read', { preHandler: [fastify.authenticate] }, markContactRead);

  fastify.get('/me', { preHandler: [fastify.authenticate] }, getMyPortfolio);

  fastify.put('/me', { preHandler: [fastify.authenticate] }, savePortfolio);

  fastify.get('/me/pages', { preHandler: [fastify.authenticate] }, listPages);

  fastify.post('/me/pages', { preHandler: [fastify.authenticate] }, savePage);

  fastify.put('/me/pages/:id', { preHandler: [fastify.authenticate] }, savePage);

  fastify.delete('/me/pages/:id', { preHandler: [fastify.authenticate] }, deletePage);

  fastify.delete('/me/reviews/:id', { preHandler: [fastify.authenticate] }, deleteReview);

  fastify.post('/me/upload', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadPortfolioImage);

  fastify.post('/me/domain', { preHandler: [fastify.authenticate] }, saveDomain);

  fastify.post('/me/domain/verify', { preHandler: [fastify.authenticate] }, verifyDomain);

  fastify.get('/admin/plans', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listPlans);

  fastify.post('/admin/plans', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, adminSavePlan);

  fastify.put('/admin/plans/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, adminSavePlan);
}
