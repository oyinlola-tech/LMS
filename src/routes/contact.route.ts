import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as { name: string; email: string; message: string };
    if (!body.name || !body.email || !body.message) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Name, email, and message are required');
    }
    try {
      const { sendEmail } = await import('../services/mail');
      await sendEmail({
        to: process.env.CONTACT_EMAIL || 'hello@learnbridge.com',
        subject: 'New Contact Form Message from ' + body.name,
        html: '<p><strong>Name:</strong> ' + body.name + '</p><p><strong>Email:</strong> ' + body.email + '</p><p><strong>Message:</strong></p><p>' + body.message + '</p>',
        text: 'Name: ' + body.name + '\nEmail: ' + body.email + '\nMessage:\n' + body.message,
      });
      return created(reply, null, 'Message sent. We will get back to you soon.');
    } catch {
      return ok(reply, null, 'Message received. We will get back to you soon.');
    }
  });
}
