import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { renderTemplate, templates as mailTemplates } from '../services/mail';
import { error } from '../utils/response.util';
import { UserRole, UserStatus } from '../enums';

const devEmailPreview = String(process.env.DEV_EMAIL_PREVIEW) === 'true';

const icons: Record<string, string> = {
  key: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 2L19 4M19 4L17 6L21 10L23 8L19 4ZM19 4L15 8C14.45 8.55 14.45 9.45 15 10L19 14L21 12L17 8" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="10" rx="2" fill="#0B5FFF"/><path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z" fill="#0B5FFF"/><path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="#0B5FFF"/><path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/></svg>`,
  checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#0B5FFF"/><path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.09 8.26L20 9.27L15.55 14.14L16.91 20L12 16.9L7.09 20L8.45 14.14L4 9.27L9.91 8.26L12 2Z" fill="#FFD700"/></svg>`,
  warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22H22L12 2Z" fill="#FFA500"/><path d="M12 9V13" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 17H12.01" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#0B5FFF" stroke-width="2"/><path d="M12 8V12" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/><path d="M12 16H12.01" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#0B5FFF" stroke-width="2"/><path d="M3 10H21" stroke="#0B5FFF" stroke-width="2"/><path d="M8 2V6" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/></svg>`,
  document: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#0B5FFF" stroke-width="2"/><path d="M14 2V8H20" stroke="#0B5FFF" stroke-width="2"/></svg>`,
  award: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="9" r="6" fill="#0B5FFF"/><path d="M8 21L10 17L14 19L16 15L12 11L8 21Z" fill="#FFD700"/><path d="M12 9V13" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  mail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0B5FFF"/><path d="M2 6L12 14L22 6" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  link: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 13C10.4295 13.5741 10.9774 14.0499 11.6066 14.3929C12.2357 14.7359 12.9315 14.9382 13.6467 14.9841C14.3618 15.0301 15.0796 14.9181 15.7513 14.6545C16.4231 14.3909 17.0331 13.9827 17.54 13.46L20.54 10.46" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/><path d="M4 11L7 8L10 11" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#0B5FFF" stroke-width="2"/><path d="M12 7V12L15 15" stroke="#0B5FFF" stroke-width="2" stroke-linecap="round"/></svg>`,
  default: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#0B5FFF" stroke-width="2"/></svg>`,
};

const templateIcons: Record<string, string> = {
  otpVerify: 'key', otpResend: 'key', passwordReset: 'lock', passwordChanged: 'lock',
  tutorCreated: 'user', adminCreated: 'shield', loginAlert: 'warning', profileUpdated: 'user',
  socialWelcome: 'star', emailVerified: 'checkCircle', certificateIssued: 'award',
  quizScoreHigh: 'star', quizScoreAverage: 'calendar', quizScoreLow: 'star',
  assignmentGraded: 'document', courseAnnouncement: 'info', courseEvent: 'calendar',
  notificationDetailed: 'info', subscriptionUpdated: 'link',
  accountSuspended: 'warning', accountReactivated: 'checkCircle',
  accountDeactivated: 'warning', roleChanged: 'shield',
};

const getIcon = (name: string) => icons[templateIcons[name] || 'default'];

const getSampleParams = (name: string) => {
  const samples: Record<string, any> = {
    otpVerify: { code: '123456', minutes: 10 },
    otpResend: { code: '654321', minutes: 10 },
    passwordReset: { token: 'abc123reset', minutes: 30, resetUrl: 'https://learnbridge.app/reset' },
    passwordChanged: {},
    tutorCreated: { fullName: 'Jane Tutor' },
    adminCreated: { email: 'admin@example.com', password: 'TempPass123!' },
    loginAlert: { device: 'Chrome on Mac', location: 'Lagos, NG' },
    profileUpdated: {},
    socialWelcome: { provider: 'Google' },
    emailVerified: {},
    certificateIssued: { certificateUrl: 'https://cdn.example.com/cert.pdf', courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim' },
    quizScoreHigh: { scorePercent: 92, courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', lessonUrl: 'https://learnbridge.app/lessons/xyz' },
    quizScoreAverage: { scorePercent: 72, courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', lessonUrl: 'https://learnbridge.app/lessons/xyz' },
    quizScoreLow: { scorePercent: 48, courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', lessonUrl: 'https://learnbridge.app/lessons/xyz' },
    assignmentGraded: { courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', submissionUrl: 'https://learnbridge.app/assignments/abc', score: 88, rubric: 'meets' },
    courseAnnouncement: { announcementTitle: 'Live review session', announcementBody: 'We will review portfolios on Friday.', courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', announcementUrl: 'https://learnbridge.app/courses/abc/announcements/123' },
    courseEvent: { eventTitle: 'Live Q&A Session', description: 'Bring your questions.', startsAt: '2026-04-10T15:00:00Z', endsAt: '2026-04-10T16:00:00Z', meetingUrl: 'https://meet.example.com/room', courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', eventUrl: 'https://learnbridge.app/courses/abc/events/456' },
    accountSuspended: { fullName: 'Jamie Doe', reason: 'Multiple failed login attempts' },
    accountReactivated: { fullName: 'Jamie Doe' },
    accountDeactivated: { fullName: 'Jamie Doe', reason: 'Requested by administrator' },
    roleChanged: { fullName: 'Jamie Doe', newRole: UserRole.TUTOR },
    notificationDetailed: { title: 'New assignment graded', message: 'Your submission has been graded.', notificationType: 'feedback', createdAt: '2026-04-09T10:30:00Z', notificationUrl: 'https://learnbridge.app/notifications/abc' },
    subscriptionUpdated: { plan: 'pro', status: UserStatus.ACTIVE, startedAt: '2026-04-01T08:00:00Z', endsAt: '2026-05-01T08:00:00Z', billingUrl: 'https://learnbridge.app/billing' },
  };
  return samples[name] || {};
};

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!devEmailPreview) {
      return error(reply, 403, 'FORBIDDEN', 'Email preview disabled');
    }
    if (!devEmailPreview) {
      await fastify.authenticate(request, reply);
    }
    const templates = Object.keys(mailTemplates);
    const brandName = process.env.APP_NAME || 'LearnBridge';
    const items = templates.map((name) => {
      const sampleParams = getSampleParams(name);
      const params = new URLSearchParams(sampleParams).toString();
      return `<a href="/dev/email/${name}${params ? `?${params}` : ''}" class="template-card">
        <span class="icon">${getIcon(name)}</span>
        <span class="name">${name}</span>
        <span class="arrow">→</span>
      </a>`;
    }).join('');
    reply.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${brandName} Email Templates</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 20px; color: #fff; font-size: 12px; letter-spacing: 0.5px; }
    h1 {
      color: #fff;
      font-size: 32px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: rgba(255,255,255,0.8);
      margin-bottom: 30px;
      font-size: 15px;
    }
    .templates {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .template-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 24px;
      text-decoration: none;
      color: #1b2540;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.2s ease;
    }
    .template-card:last-child { border-bottom: none; }
    .template-card:hover {
      background: #f8f9ff;
      padding-left: 28px;
    }
    .icon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }
    .arrow {
      color: #2563eb;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-nav">
      <span class="badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" fill="#fff"/><path d="M2 6L12 14L22 6" stroke="#0B5FFF" stroke-width="2"/></svg>
        ${brandName} Email Templates
      </span>
    </div>
    <h1>Email Templates</h1>
    <p class="subtitle">Click any template to preview</p>
    <div class="templates">${items}</div>
  </div>
</body>
</html>`);
  });

  fastify.get('/gallery', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!devEmailPreview) {
      return error(reply, 403, 'FORBIDDEN', 'Email preview disabled');
    }
    if (!devEmailPreview) {
      await fastify.authenticate(request, reply);
    }
    const brandName = process.env.APP_NAME || 'LearnBridge';
    const samples: Record<string, any> = {
      otpVerify: { code: '123456', minutes: 10 },
      otpResend: { code: '654321', minutes: 10 },
      passwordReset: { token: 'abc123reset token', minutes: 30, resetUrl: 'https://learnbridge.app/reset-password?token=abc123' },
      passwordChanged: {},
      tutorCreated: { fullName: 'Jane Tutor' },
      adminCreated: { email: 'admin@example.com', password: 'TempPass123!' },
      loginAlert: { device: 'Chrome on Mac', location: 'Lagos, NG' },
      profileUpdated: {},
      socialWelcome: { provider: 'Google' },
      emailVerified: {},
      certificateIssued: { certificateUrl: 'https://cdn.example.com/cert.pdf', courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim' },
      quizScoreHigh: { scorePercent: 92, courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', lessonUrl: 'https://learnbridge.app/lessons/xyz' },
      quizScoreAverage: { scorePercent: 72, courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', lessonUrl: 'https://learnbridge.app/lessons/xyz' },
      quizScoreLow: { scorePercent: 48, courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', courseUrl: 'https://learnbridge.app/courses/abc', lessonUrl: 'https://learnbridge.app/lessons/xyz' },
      assignmentGraded: { courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', submissionUrl: 'https://learnbridge.app/assignments/abc/submission', score: 88, rubric: 'meets' },
      courseAnnouncement: {
        announcementTitle: 'Live review session',
        announcementBody: 'We will review portfolios on Friday at 4 PM.',
        courseTitle: 'Advanced UI Systems',
        instructorName: 'Alex Kim',
        courseUrl: 'https://learnbridge.app/courses/abc',
        announcementUrl: 'https://learnbridge.app/courses/abc/announcements/123',
      },
      courseEvent: {
        eventTitle: 'Live Q&A Session',
        description: 'Bring your questions for Module 4.',
        startsAt: '2026-04-10T15:00:00Z',
        endsAt: '2026-04-10T16:00:00Z',
        meetingUrl: 'https://meet.example.com/room',
        courseTitle: 'Advanced UI Systems',
        instructorName: 'Alex Kim',
        courseUrl: 'https://learnbridge.app/courses/abc',
        eventUrl: 'https://learnbridge.app/courses/abc/events/456',
        eventPayload: JSON.stringify({
          id: 'event-456',
          title: 'Live Q&A Session',
          description: 'Bring your questions for Module 4.',
          startsAt: '2026-04-10T15:00:00Z',
          endsAt: '2026-04-10T16:00:00Z',
          meetingUrl: 'https://meet.example.com/room',
        }),
      },
      accountSuspended: { fullName: 'Jamie Doe', reason: 'Multiple failed login attempts' },
      accountReactivated: { fullName: 'Jamie Doe' },
      accountDeactivated: { fullName: 'Jamie Doe', reason: 'Requested by administrator' },
      roleChanged: { fullName: 'Jamie Doe', newRole: UserRole.TUTOR },
      notificationDetailed: {
        title: 'New assignment graded',
        message: 'Your submission has been graded.',
        notificationType: 'feedback',
        createdAt: '2026-04-09T10:30:00Z',
        notificationUrl: 'https://learnbridge.app/notifications/abc',
        notificationPayload: JSON.stringify({ id: 'abc', type: 'feedback', data: { submissionId: 'sub-123' } }),
      },
      subscriptionUpdated: {
        plan: 'pro',
        status: UserStatus.ACTIVE,
        startedAt: '2026-04-01T08:00:00Z',
        endsAt: '2026-05-01T08:00:00Z',
        provider: 'stripe',
        externalId: 'sub_123',
        billingUrl: 'https://learnbridge.app/billing',
        payload: JSON.stringify({ id: 'sub_123', plan: 'pro', status: UserStatus.ACTIVE }),
      },
    };
    const list = Object.keys(mailTemplates);
    const items = list.map((name) => {
      const params = new URLSearchParams(samples[name] || {}).toString();
      const link = `/dev/email/${name}${params ? `?${params}` : ''}`;
      return `<div class="card">
        <div class="icon">${getIcon(name)}</div>
        <div class="info">
          <div class="name">${name}</div>
          <a href="${link}" class="btn">View Email</a>
        </div>
      </div>`;
    }).join('');
    reply.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${brandName} Email Gallery</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 20px; color: #fff; font-size: 12px; letter-spacing: 0.5px; }
    h1 { color: #fff; font-size: 32px; margin-bottom: 8px; }
    .subtitle { color: rgba(255,255,255,0.8); margin-bottom: 30px; font-size: 15px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border-radius: 12px; padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
    .icon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .info { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .name { font-weight: 600; font-size: 14px; color: #1b2540; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 8px 16px; background: #2563eb; color: #fff;
      text-decoration: none; border-radius: 8px; font-size: 13px;
      font-weight: 500; transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-nav">
      <span class="badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" fill="#fff"/><path d="M2 6L12 14L22 6" stroke="#0B5FFF" stroke-width="2"/></svg>
        ${brandName} Email Gallery
      </span>
    </div>
    <h1>Email Preview Gallery</h1>
    <p class="subtitle">Click "View Email" to preview each template with sample data</p>
    <div class="grid">${items}</div>
  </div>
</body>
</html>`);
  });

  fastify.get('/:template', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!devEmailPreview) {
      return error(reply, 403, 'FORBIDDEN', 'Email preview disabled');
    }
    if (!devEmailPreview) {
      await fastify.authenticate(request, reply);
    }
    try {
      const template = (request.params as any).template;
      const params = request.query || {};
      const payload = renderTemplate(template, mailTemplates as any, params);
      return reply.send(payload.html);
    } catch (err: any) {
      return error(reply, 404, 'NOT_FOUND', 'Template not found');
    }
  });
}
