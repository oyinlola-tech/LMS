import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';

export const welcome = ({ fullName }: any) => ({
  subject: `Welcome to ${APP_NAME}, ${escapeHtml(fullName || 'there')}!`,
  html: baseTemplate({
    title: `Welcome to ${APP_NAME}`,
    icon: 'star',
    preheader: 'Start your learning journey',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Welcome aboard, ${escapeHtml(fullName || 'learner')}!
      </p>
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        You've joined a community of lifelong learners. Here's how to get started:
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td style="padding:8px 0; font-size:16px; color:#334155;">1. Complete your profile</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:16px; color:#334155;">2. Set your learning goals</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:16px; color:#334155;">3. Explore our course catalog</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-size:16px; color:#334155;">4. Start your first lesson</td>
        </tr>
      </table>
    `,
    action: { label: 'Get Started', url: BRAND_APP_URL },
    highlight: 'The hardest step is starting — you just took it.',
  }),
  text: `Welcome to ${APP_NAME}, ${fullName || 'learner'}! Complete your profile, set goals, and start learning.`,
});

export const notificationDetailed = ({ title, message, notificationType, notificationUrl }: any) => ({
  subject: (() => {
    const type = String(notificationType || '').toLowerCase();
    const haystack = `${String(title || '')} ${String(message || '')}`.toLowerCase();
    if (haystack.includes('certificate')) return `Certificate issued from ${APP_NAME}`;
    if (haystack.includes('payment') && haystack.includes('fail')) return `Payment failed on ${APP_NAME}`;
    if (haystack.includes('payment')) return `Payment update from ${APP_NAME}`;
    if (haystack.includes('subscription')) return `Subscription update from ${APP_NAME}`;
    if (type === 'event') return `Event notification from ${APP_NAME}`;
    if (type === 'feedback') return `Assignment feedback from ${APP_NAME}`;
    if (type === 'announcement') return `Course announcement from ${APP_NAME}`;
    if (type === 'reminder') return `Reminder from ${APP_NAME}`;
    if (type === 'system') return `Account alert from ${APP_NAME}`;
    return `New ${APP_NAME} notification`;
  })(),
  html: baseTemplate({
    title: 'You have a new notification',
    icon: 'info',
    preheader: escapeHtml(title || 'New notification'),
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        <strong>${escapeHtml(title || 'Notification')}</strong>
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        ${escapeHtml(message || 'You have a new update in your account.')}
      </p>
    `,
    action: { label: 'View Notification', url: escapeHtml(notificationUrl || BRAND_APP_URL) },
    highlight: 'Open the app for full context and next steps.',
  }),
  text: `${title || 'Notification'} — ${message || ''}`,
});

export const mentorAssigned = ({ mentorName, mentorProfileUrl }: any) => ({
  subject: `A mentor has been assigned to you on ${APP_NAME}`,
  html: baseTemplate({
    title: 'Mentor assigned',
    icon: 'user',
    preheader: `Your mentor is ${escapeHtml(mentorName || 'ready')}`,
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Great news! <strong>${escapeHtml(mentorName || 'A mentor')}</strong> has been assigned to guide you.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Connect with your mentor, schedule sessions, and get personalized guidance.
      </p>
    `,
    action: { label: 'View Mentor Profile', url: escapeHtml(mentorProfileUrl || BRAND_APP_URL) },
    highlight: 'A mentor can make all the difference in your learning journey.',
  }),
  text: `${mentorName || 'A mentor'} has been assigned to you on ${APP_NAME}. Connect and start learning together!`,
});

export const weeklyDigest = ({ fullName, completedLessons, hoursSpent, coursesActive, streakDays, dashboardUrl }: any) => ({
  subject: `Your weekly digest — ${APP_NAME}`,
  html: baseTemplate({
    title: 'Your weekly learning recap',
    icon: 'star',
    preheader: 'See your progress this week',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hi ${escapeHtml(fullName || 'there')}, here's your weekly learning summary:
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
            ${completedLessons !== undefined ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">LESSONS COMPLETED</p><p style="margin:0 0 16px; font-size:24px; font-weight:700; color:#000000;">${completedLessons}</p>` : ''}
            ${hoursSpent !== undefined ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">HOURS SPENT</p><p style="margin:0 0 16px; font-size:24px; font-weight:700; color:#000000;">${hoursSpent}</p>` : ''}
            ${coursesActive !== undefined ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">ACTIVE COURSES</p><p style="margin:0 0 16px; font-size:24px; font-weight:700; color:#000000;">${coursesActive}</p>` : ''}
            ${streakDays !== undefined ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">STREAK</p><p style="margin:0; font-size:24px; font-weight:700; color:#000000;">${streakDays} days</p>` : ''}
          </td>
        </tr>
      </table>
    `,
    action: { label: 'View Full Dashboard', url: escapeHtml(dashboardUrl || BRAND_APP_URL) },
    highlight: 'Small steps every day lead to big results.',
  }),
  text: `Your weekly digest: ${completedLessons || 0} lessons completed, ${hoursSpent || 0} hours spent, ${streakDays || 0} day streak.`,
});
