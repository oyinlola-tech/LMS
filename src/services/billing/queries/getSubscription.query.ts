import { Subscription } from '../../../models';

export class GetSubscriptionQuery {
  async execute(userId: string): Promise<Subscription | null> {
    return Subscription.findOne({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']],
    });
  }
}

export const getSubscriptionQuery = new GetSubscriptionQuery();
