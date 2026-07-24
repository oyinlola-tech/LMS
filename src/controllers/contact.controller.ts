import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { sanitizeHtml } from '../utils/sanitize.util';

export async function submitContact(request: FastifyRequest, reply: FastifyReply) {
  const body = (request.body || {}) as { name: string; email: string; message: string };
  if (!body.name || !body.email || !body.message) {
    return error(reply, 400, 'VALIDATION_ERROR', 'Name, email, and message are required');
  }
  try {
    const { sendEmail } = await import('../services/mail');
    const safeName = sanitizeHtml(body.name);
    const safeMessage = sanitizeHtml(body.message);
    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'hello@learnbridge.com',
      subject: 'New Contact Form Message from ' + safeName,
      html: '<p><strong>Name:</strong> ' + safeName + '</p><p><strong>Email:</strong> ' + sanitizeHtml(body.email) + '</p><p><strong>Message:</strong></p><p>' + safeMessage + '</p>',
      text: 'Name: ' + body.name + '\nEmail: ' + body.email + '\nMessage:\n' + body.message,
    });
    return created(reply, null, 'Message sent. We will get back to you soon.');
  } catch (err) {
    request.log.error(err, '[contact] Email send failed');
    return error(reply, 500, 'EMAIL_SEND_FAILED', 'Failed to send message. Please try again later.');
  }
}
