import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { applyMentorshipCommand } from '../services/mentorship/commands/applyMentorship.command';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/apply', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (request.user!.role !== UserRole.LEARNER) return error(reply, 403, 'FORBIDDEN', 'Only learners can apply');
      const { courseId, message } = (request.body as Record<string, any>) || {};
      const application = await applyMentorshipCommand.execute(request.user!.sub, courseId, message);
      return created(reply, application, 'Mentorship application submitted');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'MENTORSHIP_APPLY_FAILED', err.message || 'Failed to submit application');
    }
  });
}
