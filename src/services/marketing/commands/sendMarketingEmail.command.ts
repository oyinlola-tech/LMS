import { User, UserMarketingPreference } from '../../../models';
import { sendEmail, templates } from '../../../services/mail';
import { getSuggestedCoursesQuery } from '../queries';
import crypto from 'crypto';

export interface SendMarketingEmailInput {
  userId: string;
  subject?: string;
}

export class SendMarketingEmailCommand {
  async execute(input: SendMarketingEmailInput): Promise<{ sent: boolean; reason?: string }> {
    const user = await User.findByPk(input.userId);
    if (!user) return { sent: false, reason: 'User not found' };

    let pref = await UserMarketingPreference.findByPk(input.userId);
    if (!pref) {
      pref = await UserMarketingPreference.create({
        userId: input.userId,
        optOut: false,
        frequency: 'weekly',
      });
    }
    if (pref.optOut) return { sent: false, reason: 'User opted out of marketing emails' };

    const suggestedCourses = await getSuggestedCoursesQuery.execute(input.userId, 4);
    if (!suggestedCourses.length) return { sent: false, reason: 'No suggested courses' };

    if (!pref.unsubscribeToken) {
      pref.unsubscribeToken = crypto.randomBytes(24).toString('hex');
      await pref.save();
    }

    const baseUrl = process.env.PUBLIC_BASE_URL || '';
    const html = `
      <h2>Hi ${user.fullName},</h2>
      <p>We think you'd love these courses:</p>
      <ul>
        ${suggestedCourses.map(c => `<li><a href="${baseUrl}/courses/${c.id}">${c.title}</a> — ${c.reason}</li>`).join('')}
      </ul>
      <p><a href="${baseUrl}/marketing/unsubscribe?token=${pref.unsubscribeToken}">Unsubscribe</a></p>
    `;

    await sendEmail({
      to: user.email,
      subject: input.subject || 'Courses we think you\'ll love',
      html,
      text: `Hi ${user.fullName}, check out these courses: ${suggestedCourses.map(c => c.title).join(', ')}`,
    });

    pref.lastSentAt = new Date();
    await pref.save();

    return { sent: true };
  }
}

export const sendMarketingEmailCommand = new SendMarketingEmailCommand();
