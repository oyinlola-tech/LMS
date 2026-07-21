import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { subscribeCommand } from '../services/billing/commands/subscribe.command';
import { getSubscriptionQuery } from '../services/billing/queries/getSubscription.query';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/subscribe', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { plan } = (request.body as Record<string, any>) || {};
      const subscription = await subscribeCommand.execute(request.user!.sub, plan);
      return created(reply, subscription, 'Subscription created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'SUBSCRIBE_FAILED', err.message || 'Failed to subscribe');
    }
  });

  fastify.get('/subscription', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const subscription = await getSubscriptionQuery.execute(request.user!.sub);
      return ok(reply, subscription, 'Subscription loaded');
    } catch (err: any) {
      return error(reply, 500, 'SUBSCRIPTION_FAILED', 'Failed to load subscription');
    }
  });
}
