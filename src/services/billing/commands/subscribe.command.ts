import { Subscription, User } from '../../../models';
import { sendEmail, templates } from '../../mail';
import { UserStatus } from '../../../enums';
import { AppError } from '../../../errors';

const allowedPlans = (process.env.BILLING_PLANS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export class SubscribeCommand {
  async execute(userId: string, plan: string): Promise<Subscription> {
    const normalizedPlan = String(plan || '').trim().toLowerCase();
    if (!normalizedPlan) {
      throw new AppError('plan is required', 'VALIDATION_ERROR', 400);
    }
    if (normalizedPlan.length > 60) {
      throw new AppError('plan is too long', 'VALIDATION_ERROR', 400);
    }
    if (allowedPlans.length > 0 && !allowedPlans.includes(normalizedPlan)) {
      throw new AppError('plan is not supported', 'INVALID_PLAN', 400);
    }

    const existing = await Subscription.findOne({
      where: { UserId: userId, status: UserStatus.ACTIVE },
      order: [['createdAt', 'DESC']],
    });

    const user = await User.findByPk(userId, { attributes: ['email'] });
    const billingUrl = process.env.BRAND_APP_URL
      ? `${process.env.BRAND_APP_URL}/billing`
      : undefined;

    if (existing) {
      existing.plan = normalizedPlan;
      await existing.save();
      if (user?.email) {
        const payload = typeof existing.toJSON === 'function' ? existing.toJSON() : existing;
        await sendEmail({
          to: user.email,
          ...templates.subscriptionUpdated({
            plan: existing.plan,
            status: existing.status,
            startedAt: existing.startedAt,
            endsAt: existing.endsAt,
            provider: existing.provider,
            externalId: existing.externalId,
            billingUrl,
            payload,
          }),
        });
      }
      return existing;
    }

    const subscription = await Subscription.create({
      UserId: userId,
      plan: normalizedPlan,
      status: UserStatus.ACTIVE,
      startedAt: new Date().toISOString(),
    });
    if (user?.email) {
      const payload = typeof subscription.toJSON === 'function' ? subscription.toJSON() : subscription;
      await sendEmail({
        to: user.email,
        ...templates.subscriptionUpdated({
          plan: subscription.plan,
          status: subscription.status,
          startedAt: subscription.startedAt,
          endsAt: subscription.endsAt,
          provider: subscription.provider,
          externalId: subscription.externalId,
          billingUrl,
          payload,
        }),
      });
    }
    return subscription;
  }
}

export const subscribeCommand = new SubscribeCommand();
