import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as { name: string; email: string; message: string };
    if (!body.name || !body.email || !body.message) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Name, email, and message are required');
    }
    try {
      const { sendEmail, templates } = await import('../services/mail');
      await sendEmail({
        to: process.env.CONTACT_EMAIL || 'hello@learnbridge.com',
        ...templates.contactForm(body.name, body.email, body.message),
      });
      return created(reply, null, 'Message sent. We will get back to you soon.');
    } catch {
      return ok(reply, null, 'Message received. We will get back to you soon.');
    }
  });
}
