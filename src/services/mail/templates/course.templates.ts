import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';

export const certificateIssued = ({ certificateUrl, courseTitle }: any) => ({
  subject: `Your ${APP_NAME} certificate is ready`,
  html: baseTemplate({
    title: 'Certificate issued',
    icon: 'award',
    preheader: 'Your certificate is ready',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Congratulations on completing your course!
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Your certificate for <strong>${escapeHtml(courseTitle || 'your course')}</strong> is ready to download.
      </p>
    `,
    action: { label: 'View Certificate', url: escapeHtml(certificateUrl) },
    highlight: 'Share your achievement with your network.',
  }),
  text: `Your ${APP_NAME} certificate is ready: ${certificateUrl}`,
});

export const courseAnnouncement = ({ announcementTitle, announcementBody, courseTitle, courseUrl, announcementUrl }: any) => ({
  subject: `New announcement in ${courseTitle || APP_NAME}`,
  html: baseTemplate({
    title: 'Course announcement',
    icon: 'info',
    preheader: escapeHtml(announcementTitle || 'New update posted'),
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        <strong>${escapeHtml(announcementTitle || 'New announcement')}</strong>
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        ${escapeHtml(announcementBody || 'A new announcement was posted in your course.')}
      </p>
    `,
    action: { label: 'View Announcement', url: escapeHtml(announcementUrl || courseUrl || BRAND_APP_URL) },
    highlight: 'Stay on track by checking the latest course updates.',
  }),
  text: `${announcementTitle || 'New announcement'} — ${announcementBody || ''}`,
});

export const courseEvent = ({ eventTitle, description, startsAt, endsAt, meetingUrl, courseTitle, courseUrl, eventUrl }: any) => ({
  subject: `New event scheduled in ${courseTitle || APP_NAME}`,
  html: baseTemplate({
    title: 'Upcoming course event',
    icon: 'calendar',
    preheader: escapeHtml(eventTitle || 'New event scheduled'),
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        <strong>${escapeHtml(eventTitle || 'Course event')}</strong>
      </p>
      ${description ? `<p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">${escapeHtml(description)}</p>` : ''}
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
            ${startsAt ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">STARTS</p><p style="margin:0 0 16px; font-size:16px; font-weight:600; color:#000000;">${escapeHtml(startsAt)}</p>` : ''}
            ${endsAt ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">ENDS</p><p style="margin:0 0 16px; font-size:16px; font-weight:600; color:#000000;">${escapeHtml(endsAt)}</p>` : ''}
            ${meetingUrl ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">MEETING LINK</p><p style="margin:0; font-size:16px; font-weight:600; color:#2563eb;">${escapeHtml(meetingUrl)}</p>` : ''}
          </td>
        </tr>
      </table>
    `,
    action: { label: 'View Event', url: escapeHtml(eventUrl || courseUrl || BRAND_APP_URL) },
    highlight: "Add this event to your calendar so you don't miss it.",
  }),
  text: `${eventTitle || 'Course event'} — ${startsAt || ''}`,
});

export const enrollmentConfirmation = ({ courseTitle, instructorName, courseUrl }: any) => ({
  subject: `Enrolled in ${courseTitle || 'a course'} on ${APP_NAME}`,
  html: baseTemplate({
    title: 'Enrollment confirmed',
    icon: 'checkCircle',
    preheader: `You're enrolled in ${courseTitle}`,
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        You are now enrolled in <strong>${escapeHtml(courseTitle || 'your course')}</strong>.
      </p>
      ${instructorName ? `<p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">Instructor: ${escapeHtml(instructorName)}</p>` : ''}
      <p style="margin:16px 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Start learning and track your progress from your dashboard.
      </p>
    `,
    action: { label: 'Start Learning', url: escapeHtml(courseUrl || BRAND_APP_URL) },
    highlight: 'Break your goals into small steps and stay consistent.',
  }),
  text: `You're enrolled in ${courseTitle || 'a course'} on ${APP_NAME}. Start learning today!`,
});

export const courseCompleted = ({ courseTitle, certificateUrl, courseUrl }: any) => ({
  subject: `Congratulations — you completed ${courseTitle || 'your course'}!`,
  html: baseTemplate({
    title: 'Course completed',
    icon: 'award',
    preheader: 'You did it! Course completed.',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Congratulations! You have successfully completed <strong>${escapeHtml(courseTitle || 'your course')}</strong>.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Your certificate is ready. Download it and share your achievement.
      </p>
    `,
    action: certificateUrl
      ? { label: 'View Certificate', url: escapeHtml(certificateUrl) }
      : { label: 'Find Next Course', url: escapeHtml(courseUrl || BRAND_APP_URL) },
    highlight: 'Keep learning — every course brings you closer to your goals.',
  }),
  text: `You completed ${courseTitle || 'your course'} on ${APP_NAME}! View your certificate or explore more courses.`,
});
