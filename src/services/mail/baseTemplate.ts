import { icons } from './icons';

const { APP_NAME, SUPPORT_EMAIL, BRAND_APP_URL } = process.env;

const appNameRaw = typeof APP_NAME === 'string' ? APP_NAME.trim() : '';
const appName = appNameRaw || 'LearnBridge';
const appNameParts = appName.split(/\s+/);
const brandPrimary = appNameParts[0] || 'Learn';
const brandAccent = appNameParts[1] || 'Bridge';

export const escapeHtml = (value: unknown): string => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const baseTemplate = (opts: Record<string, any>) => {
  const { title, preheader, bodyHtml, footerNote, action, highlight, icon } = opts || {};
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${appName}</title>
  <style>
    body { margin:0; padding:0; background-color:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <span style="display:none;opacity:0;color:transparent;height:0;width:0;">${preheader || ''}</span>
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; margin:20px auto; border-radius:16px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="padding:32px 24px 16px; border-bottom:2px solid #eef2ff;">
        <h1 style="margin:0; font-size:28px; font-weight:700; color:#000000; letter-spacing:-0.5px;">
          ${brandPrimary}<span style="color:#2563eb;">${brandAccent}</span>
        </h1>
        <p style="margin:6px 0 0; color:#64748b; font-size:14px;">Learn. Build. Succeed.</p>
      </td>
    </tr>
      <tr>
        <td style="padding:32px 24px; color:#1e293b;">
          ${icon ? `<div style="margin-bottom:16px;">${icons[icon] || ''}</div>` : ''}
          <h2 style="margin:0 0 16px; font-size:24px; font-weight:600; color:#000000;">${title}</h2>
          ${bodyHtml}
          ${highlight ? `<p style="margin:24px 0 0; font-size:14px; color:#64748b;">${highlight}</p>` : ''}
          ${action ? `<table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td align="center"><a href="${action.url}" style="display:inline-block; background-color:#2563eb; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:10px; font-weight:600; font-size:16px;">${action.label}</a></td></tr></table>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding:24px; background-color:#f8fafc; border-top:1px solid #e2e8f0; border-radius:0 0 16px 16px; text-align:center;">
          <p style="margin:0 0 12px; font-size:13px; color:#64748b;">
            © 2026 ${APP_NAME}. All rights reserved.
          </p>
          <p style="margin:0; font-size:12px; color:#94a3b8;">
            Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb; text-decoration:none;">Contact Support</a>
          </p>
          ${footerNote ? `<p style="margin:16px 0 0; font-size:12px; color:#64748b;">${footerNote}</p>` : ''}
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;
};
