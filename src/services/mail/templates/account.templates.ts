import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@learnbridge.app';

export const socialWelcome = ({ provider }: any) => ({
  subject: `Welcome to ${APP_NAME}`,
  html: baseTemplate({
    title: `Welcome to ${APP_NAME}`,
    icon: 'star',
    preheader: 'Your account is ready',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Welcome! Your account was created using ${escapeHtml(provider)}.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Complete your profile and start learning today.
      </p>
    `,
    action: { label: 'Complete Profile', url: BRAND_APP_URL },
    highlight: 'Set your goals to get personalized learning paths.',
  }),
  text: `Welcome to ${APP_NAME}! Your account was created using ${provider}.`,
});

export const profileUpdated = () => ({
  subject: `Your ${APP_NAME} profile was updated`,
  html: baseTemplate({
    title: 'Profile updated',
    icon: 'user',
    preheader: 'Your profile details have been updated',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your profile details were updated successfully.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        If you did not make this change, please review your account.
      </p>
    `,
    action: { label: 'View Profile', url: BRAND_APP_URL },
    highlight: 'Keep your profile current to get better recommendations.',
  }),
  text: `Your ${APP_NAME} profile was updated. If you did not make this change, review your account.`,
});

export const accountSuspended = ({ fullName, reason }: any) => ({
  subject: `Your ${APP_NAME} account was suspended`,
  html: baseTemplate({
    title: 'Account suspended',
    icon: 'warning',
    preheader: 'Your account is temporarily suspended',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hello ${escapeHtml(fullName || 'there')},
      </p>
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your account has been suspended by an administrator.
      </p>
      ${reason ? `<p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : '<p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">If you believe this is a mistake, contact support.</p>'}
    `,
    action: { label: 'Contact Support', url: `mailto:${SUPPORT_EMAIL}` },
    highlight: 'Access to learning content is restricted while suspended.',
  }),
  text: `Your account was suspended. ${reason ? `Reason: ${reason}` : ''}`,
});

export const accountReactivated = ({ fullName }: any) => ({
  subject: `Your ${APP_NAME} account is active again`,
  html: baseTemplate({
    title: 'Account reactivated',
    icon: 'checkCircle',
    preheader: 'Your account has been restored',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hello ${escapeHtml(fullName || 'there')},
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Your account has been reactivated. You can sign in and continue learning.
      </p>
    `,
    action: { label: 'Go to Dashboard', url: BRAND_APP_URL },
    highlight: 'Welcome back — keep the momentum going.',
  }),
  text: `Your account has been reactivated. You can sign in now.`,
});

export const accountDeactivated = ({ fullName, reason }: any) => ({
  subject: `Your ${APP_NAME} account was deactivated`,
  html: baseTemplate({
    title: 'Account deactivated',
    icon: 'warning',
    preheader: 'Your account was deactivated',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hello ${escapeHtml(fullName || 'there')},
      </p>
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your account has been deactivated by an administrator.
      </p>
      ${reason ? `<p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : '<p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">If you need assistance, please contact support.</p>'}
    `,
    action: { label: 'Contact Support', url: `mailto:${SUPPORT_EMAIL}` },
    highlight: 'We are here to help if you need assistance.',
  }),
  text: `Your account was deactivated. ${reason ? `Reason: ${reason}` : ''}`,
});

export const roleChanged = ({ fullName, newRole }: any) => ({
  subject: `Your ${APP_NAME} role was updated`,
  html: baseTemplate({
    title: 'Role updated',
    icon: 'shield',
    preheader: 'Your access level has changed',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hello ${escapeHtml(fullName || 'there')},
      </p>
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your role has been updated to <strong>${escapeHtml(newRole)}</strong>.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Sign in to see your updated permissions.
      </p>
    `,
    action: { label: 'Go to Dashboard', url: BRAND_APP_URL },
    highlight: 'If you believe this is incorrect, contact support.',
  }),
  text: `Your role has been updated to ${newRole}.`,
});

export const accountWarning = ({ fullName, reason }: any) => ({
  subject: `Warning from ${APP_NAME}`,
  html: baseTemplate({
    title: 'Account warning',
    icon: 'warning',
    preheader: 'You have received a warning',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hello ${escapeHtml(fullName || 'there')},
      </p>
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        You have received a warning from the moderation team.
      </p>
      ${reason ? `<p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
    `,
    action: { label: 'Review our guidelines', url: BRAND_APP_URL },
    highlight: 'Please review our community guidelines to avoid further action.',
  }),
  text: `You have received a warning. ${reason ? `Reason: ${reason}` : ''}`,
});
