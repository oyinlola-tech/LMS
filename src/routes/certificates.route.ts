import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listCertificates, getCourseCertificate, issueCertificate, verifyCertificate, verifyCertificatePage, downloadCertificate, getBadge, getBadgePage, getBadgePng, exportCertificate } from '../controllers/certificates.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listCertificates);

  fastify.get('/:courseId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourseCertificate);

  fastify.post('/issue', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, issueCertificate);

  fastify.get('/verify/:certId', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, verifyCertificate);

  fastify.get('/verify/:certId/page', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, verifyCertificatePage);

  fastify.get('/download/:certId', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, downloadCertificate);

  fastify.get('/badge', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getBadge);

  fastify.get('/badge/page', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getBadgePage);

  fastify.get('/badge.png', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getBadgePng);

  fastify.get('/export/:certId', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, exportCertificate);
}
