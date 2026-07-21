import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';

export const subscriptionUpdated = ({ plan, status, startedAt, endsAt, billingUrl }: any) => ({
  subject: `Your ${APP_NAME} subscription was updated`,
  html: baseTemplate({
    title: 'Subscription update',
    icon: 'link',
    preheader: plan ? `Plan: ${escapeHtml(plan)}` : 'Subscription updated',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your subscription details have changed.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
            ${plan ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">PLAN</p><p style="margin:0 0 16px; font-size:18px; font-weight:600; color:#000000;">${escapeHtml(plan)}</p>` : ''}
            ${status ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">STATUS</p><p style="margin:0 0 16px; font-size:18px; font-weight:600; color:#000000;">${escapeHtml(status)}</p>` : ''}
            ${startedAt ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">STARTED</p><p style="margin:0 0 16px; font-size:16px; color:#334155;">${escapeHtml(startedAt)}</p>` : ''}
            ${endsAt ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">ENDS</p><p style="margin:0; font-size:16px; color:#334155;">${escapeHtml(endsAt)}</p>` : ''}
          </td>
        </tr>
      </table>
    `,
    action: { label: 'Manage Subscription', url: escapeHtml(billingUrl || BRAND_APP_URL) },
    highlight: 'Review your billing details to ensure everything looks correct.',
  }),
  text: `Your subscription was updated. Plan: ${plan || 'n/a'} Status: ${status || 'n/a'}.`,
});

export const paymentReceipt = ({ amount, plan, transactionId, paymentDate, billingUrl }: any) => ({
  subject: `Payment receipt — ${APP_NAME}`,
  html: baseTemplate({
    title: 'Payment received',
    icon: 'checkCircle',
    preheader: `Payment of ${amount || 'your subscription'} confirmed`,
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Thank you for your payment!
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
            ${amount ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">AMOUNT</p><p style="margin:0 0 16px; font-size:24px; font-weight:700; color:#000000;">${escapeHtml(amount)}</p>` : ''}
            ${plan ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">PLAN</p><p style="margin:0 0 16px; font-size:16px; color:#334155;">${escapeHtml(plan)}</p>` : ''}
            ${transactionId ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">TRANSACTION ID</p><p style="margin:0 0 16px; font-size:14px; color:#64748b;">${escapeHtml(transactionId)}</p>` : ''}
            ${paymentDate ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">DATE</p><p style="margin:0; font-size:16px; color:#334155;">${escapeHtml(paymentDate)}</p>` : ''}
          </td>
        </tr>
      </table>
    `,
    action: { label: 'View Billing History', url: escapeHtml(billingUrl || BRAND_APP_URL) },
    highlight: 'Need a receipt for expense reporting? Download from your billing page.',
  }),
  text: `Payment of ${amount || 'your subscription'} received. Transaction: ${transactionId || 'N/A'}.`,
});

export const paymentFailed = ({ amount, plan, reason, retryUrl }: any) => ({
  subject: `Payment failed — ${APP_NAME}`,
  html: baseTemplate({
    title: 'Payment failed',
    icon: 'warning',
    preheader: 'We could not process your payment',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        We were unable to process your payment of <strong>${escapeHtml(amount || 'your subscription')}</strong>.
      </p>
      ${reason ? `<p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">Reason: ${escapeHtml(reason)}</p>` : ''}
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Please update your payment method to avoid any disruption to your subscription.
      </p>
    `,
    action: { label: 'Update Payment', url: escapeHtml(retryUrl || BRAND_APP_URL) },
    highlight: 'Your access will remain active for a few more days.',
  }),
  text: `Payment of ${amount || 'your subscription'} failed. ${reason ? `Reason: ${reason}` : ''} Update your payment method.`,
});
