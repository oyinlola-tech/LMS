import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';

export const tutorCreated = ({ fullName }: any) => ({
  subject: `Your ${APP_NAME} tutor account is ready`,
  html: baseTemplate({
    title: 'Tutor account created',
    icon: 'user',
    preheader: 'Your tutor account is ready',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Hello ${escapeHtml(fullName || 'Tutor')},
      </p>
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your ${APP_NAME} tutor account has been created by an admin.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        You can now sign in and complete your profile.
      </p>
    `,
    action: { label: 'Sign In', url: BRAND_APP_URL },
    highlight: 'Tip: add a strong profile and portfolio to attract learners.',
  }),
  text: `Your ${APP_NAME} tutor account has been created. You can now sign in and complete your profile.`,
});

export const adminCreated = ({ email, password }: any) => ({
  subject: `Your ${APP_NAME} admin access is ready`,
  html: baseTemplate({
    title: 'Admin access created',
    icon: 'shield',
    preheader: 'Your admin login details are inside',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your ${APP_NAME} admin account has been created.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px; font-size:14px; color:#64748b;">LOGIN EMAIL</p>
            <p style="margin:0 0 16px; font-size:18px; font-weight:600; color:#000000;">${escapeHtml(email)}</p>
            <p style="margin:0 0 8px; font-size:14px; color:#64748b;">TEMPORARY PASSWORD</p>
            <p style="margin:0; font-size:18px; font-weight:600; color:#000000;">${escapeHtml(password)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Please sign in and change your password right away.
      </p>
    `,
    action: { label: 'Go to Admin Login', url: BRAND_APP_URL },
    highlight: 'For security, change your password after first login.',
  }),
  text: `Your ${APP_NAME} admin account has been created. Email: ${email}. Temporary password: ${password}. Please change it after login.`,
});
