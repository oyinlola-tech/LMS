import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';

export const otpVerify = ({ code, minutes, courseUrl }: any) => ({
  subject: `Verify your ${APP_NAME} email`,
  html: baseTemplate({
    title: 'Verify your email address',
    icon: 'key',
    preheader: `Your verification code is ${code}`,
    bodyHtml: `
      <p style="margin:0 0 24px; font-size:16px; line-height:1.6; color:#334155;">
        Use the code below to complete your sign-in to ${APP_NAME}. This code expires in <strong>${minutes} minutes</strong>.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:24px; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px; font-size:14px; color:#64748b; letter-spacing:1px;">YOUR VERIFICATION CODE</p>
            <p style="margin:0; font-size:48px; font-weight:700; letter-spacing:6px; color:#000000;">${code}</p>
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0; font-size:14px; color:#64748b;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    `,
    action: courseUrl ? { label: 'Open Course', url: escapeHtml(courseUrl) } : undefined,
  }),
  text: `Your ${APP_NAME} verification code is ${code}. It expires in ${minutes} minutes.`,
});

export const otpResend = ({ code, minutes, courseUrl }: any) => ({
  subject: `Your new ${APP_NAME} verification code`,
  html: baseTemplate({
    title: 'New verification code',
    icon: 'key',
    preheader: `Your new code is ${code}`,
    bodyHtml: `
      <p style="margin:0 0 24px; font-size:16px; line-height:1.6; color:#334155;">
        We sent a new code because the previous one expired or you requested it again.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:24px; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px; font-size:14px; color:#64748b; letter-spacing:1px;">NEW CODE</p>
            <p style="margin:0; font-size:48px; font-weight:700; letter-spacing:6px; color:#000000;">${code}</p>
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0; font-size:14px; color:#64748b;">
        Code valid for ${minutes} minutes.
      </p>
    `,
    action: courseUrl ? { label: 'Open Course', url: escapeHtml(courseUrl) } : { label: `Open ${APP_NAME}`, url: escapeHtml(BRAND_APP_URL) },
  }),
  text: `Your new ${APP_NAME} verification code is ${code}. It expires in ${minutes} minutes.`,
});

export const passwordReset = ({ token, minutes, resetUrl }: any) => ({
  subject: `Reset your ${APP_NAME} password`,
  html: baseTemplate({
    title: 'Reset your password',
    icon: 'lock',
    preheader: 'Use this token to reset your password',
    bodyHtml: `
      <p style="margin:0 0 24px; font-size:16px; line-height:1.6; color:#334155;">
        We received a request to reset your password. Use the token below to continue.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:24px; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px; font-size:14px; color:#64748b; letter-spacing:1px;">RESET TOKEN</p>
            <p style="margin:0; font-size:32px; font-weight:700; letter-spacing:4px; color:#000000;">${escapeHtml(token)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0; font-size:14px; color:#64748b;">
        This token expires in ${minutes} minutes.
      </p>
    `,
    action: { label: 'Reset Password', url: escapeHtml(resetUrl || BRAND_APP_URL) },
    highlight: "If this wasn't you, secure your account immediately.",
  }),
  text: `Use this token to reset your ${APP_NAME} password: ${token}. It expires in ${minutes} minutes.`,
});

export const passwordChanged = () => ({
  subject: `Your ${APP_NAME} password was changed`,
  html: baseTemplate({
    title: 'Password updated',
    icon: 'lock',
    preheader: 'Your password has been changed',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your password was changed successfully.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        If this wasn't you, reset your password immediately or contact support.
      </p>
    `,
    action: { label: 'Secure My Account', url: BRAND_APP_URL },
    highlight: 'If you did not make this change, reset your password now.',
  }),
  text: `Your ${APP_NAME} password was changed. If this was not you, reset your password immediately.`,
});

export const loginAlert = ({ device, location }: any) => ({
  subject: `New sign-in to ${APP_NAME}`,
  html: baseTemplate({
    title: 'New login detected',
    icon: 'warning',
    preheader: 'We noticed a login to your account',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        We detected a new sign-in to your ${APP_NAME} account.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#fef3c7" style="padding:16px; border-radius:12px; border:1px solid #fcd34d;">
            <p style="margin:0 0 8px; font-size:14px; color:#92400e;">DEVICE</p>
            <p style="margin:0 0 16px; font-size:16px; font-weight:600; color:#000000;">${escapeHtml(device || 'Unknown')}</p>
            <p style="margin:0 0 8px; font-size:14px; color:#92400e;">LOCATION</p>
            <p style="margin:0; font-size:16px; font-weight:600; color:#000000;">${escapeHtml(location || 'Unknown')}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        If this wasn't you, reset your password immediately.
      </p>
    `,
    action: { label: 'Review Account', url: BRAND_APP_URL },
    highlight: "If you don't recognize this login, secure your account.",
  }),
  text: `We detected a new login to your ${APP_NAME} account. If this was not you, reset your password immediately.`,
});

export const emailVerified = () => ({
  subject: `Your ${APP_NAME} email is verified`,
  html: baseTemplate({
    title: 'Email verified',
    icon: 'checkCircle',
    preheader: 'Your email is now verified',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Great news! Your email has been verified successfully.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        You can now access all ${APP_NAME} features.
      </p>
    `,
    action: { label: 'Go to Dashboard', url: BRAND_APP_URL },
    highlight: "You're all set. Let's keep the momentum going.",
  }),
  text: `Your ${APP_NAME} email has been verified successfully.`,
});
