import path from 'path';
import fs from 'fs';
import Fastify from 'fastify';
import { AppError } from './errors';
import { sequelize } from './models';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
import authPlugin from './plugins/auth.plugin';
import csrfPlugin from './plugins/csrf.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import courseRoutes from './routes/course.route';
import lessonRoutes from './routes/lesson.route';
import assignmentRoutes from './routes/assignment.route';
import enrollmentRoutes from './routes/enrollment.route';
import adminRoutes from './routes/admin.route';
import dashboardRoutes from './routes/dashboard.route';
import tutorRoutes from './routes/tutors.route';
import progressRoutes from './routes/progress.route';
import tutorDashboardRoutes from './routes/tutorDashboard.route';
import tutorFinancialsRoutes from './routes/tutorFinancials.route';
import tutorAssignmentBuilderRoutes from './routes/tutorAssignmentBuilder.route';
import notificationRoutes from './routes/notifications.route';
import certificateRoutes from './routes/certificates.route';
import courseBuilderRoutes from './routes/courseBuilder.route';

import adminDashboardRoutes from './routes/adminDashboard.route';
import adminFinancialsRoutes from './routes/adminFinancials.route';
import adminUsersRoutes from './routes/adminUsers.route';
import adminSupportRoutes from './routes/adminSupport.route';
import adminInstructorsRoutes from './routes/adminInstructors.route';
import uploadRoutes from './routes/uploads.route';
import messageRoutes from './routes/messages.route';
import supportRoutes from './routes/support.route';
import mentorshipRoutes from './routes/mentorship.route';
import billingRoutes from './routes/billing.route';
import paymentRoutes from './routes/payment.route';
import instructorRoutes from './routes/instructor.route';
import instructorsPublicRoutes from './routes/instructors.route';
import gradebookRoutes from './routes/gradebook.route';
import submissionsRoutes from './routes/submissions.route';
import discussionsRoutes from './routes/discussions.route';
import contactRoutes from './routes/contact.route';
import discussionGroupRoutes from './routes/discussionGroup.route';
import followRoutes from './routes/follow.route';
import blogRoutes from './routes/blog.route';
import careerRoutes from './routes/career.route';
import publicRoutes from './routes/public.route';
import adminReportsRoutes from './routes/adminReports.route';
import adminEmailRoutes from './routes/adminEmail.route';
import webhookRoutes from './routes/webhook.route';
import marketingRoutes from './routes/marketing.route';
import wishlistRoutes from './routes/wishlist.route';
import bookmarksRoutes from './routes/bookmarks.route';
import portfolioRoutes from './routes/portfolio.route';
import timelineRoutes from './routes/timeline.route';
import activitiesRoutes from './routes/activities.route';
import leaderboardRoutes from './routes/leaderboard.route';

export async function buildApp() {
  const jsonLimit = parseBodyLimit(process.env.JSON_BODY_LIMIT || '1mb');
  const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS) || 30000;
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 200;
  const rawUploadDir = (process.env.UPLOAD_DIR || '').trim();
  if (!rawUploadDir) throw new Error('UPLOAD_DIR must be set to a non-empty directory path.');
  const resolvedUploadDir = path.resolve(rawUploadDir);
  const projectRoot = path.resolve(__dirname, '..');
  if (resolvedUploadDir === path.parse(resolvedUploadDir).root) throw new Error('UPLOAD_DIR must not be the filesystem root directory.');
  if (!resolvedUploadDir.startsWith(projectRoot + path.sep)) throw new Error('UPLOAD_DIR must be within the project directory.');
  const dbSyncAlter = String(process.env.DB_SYNC_ALTER || 'false') === 'true';
  if (dbSyncAlter && process.env.NODE_ENV === 'production') throw new Error('DB_SYNC_ALTER must not be true in production.');
  const uploadDir = resolvedUploadDir;
  fs.mkdirSync(uploadDir, { recursive: true });

  const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(v => v.trim()).filter(Boolean);
  if (!corsOrigins.length) throw new Error('CORS_ORIGIN must be set to a comma-separated list of allowed origins');
  const corsCredentials = String(process.env.CORS_ALLOW_CREDENTIALS || 'false') === 'true';

  const app = Fastify({
    logger: false,
    requestTimeout: requestTimeoutMs,
    bodyLimit: jsonLimit,
  });

  const cspEnabled = String(process.env.CSP_ENABLED || 'false') === 'true';
  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: (process.env.CROSS_ORIGIN_RESOURCE_POLICY || 'cross-origin') as 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: cspEnabled ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    } : false,
  });

  if (corsCredentials && corsOrigins.includes('*')) {
    throw new Error('CORS_ORIGIN cannot be * when CORS_ALLOW_CREDENTIALS is true');
  }

  await app.register(fastifyCors, {
    origin: corsOrigins,
    credentials: corsCredentials,
  });

  await app.register(fastifyFormbody);
  const uploadMaxBytes = (Number(process.env.UPLOAD_MAX_MB) || 10) * 1024 * 1024;
  await app.register(fastifyMultipart, { limits: { fileSize: uploadMaxBytes, files: 1 } });

  await app.register(fastifyRateLimit, {
    max: rateLimitMax,
    timeWindow: rateLimitWindowMs,
  });

  await app.register(csrfPlugin);
  await app.register(authPlugin);
  await app.register(swaggerPlugin);

  if (uploadDir) {
    await app.register(fastifyStatic, {
      root: uploadDir,
      prefix: '/uploads/',
      decorateReply: false,
    });
  }

  const publicDir = path.resolve(__dirname, '..', 'public');
  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    wildcard: false,
    decorateReply: false,
  });

  const pages = [
    ['/', 'pages/index.html'],
    ['/login', 'auth/login.html'],
    ['/register', 'auth/register.html'],
    ['/verify-otp', 'auth/verify-otp.html'],
    ['/forgot-password', 'auth/forgot-password.html'],
    ['/change-password', 'auth/change-password.html'],
    ['/dashboard', 'students/index.html'],
    ['/students/dashboard', 'students/index.html'],
    ['/tutor', 'tutors/index.html'],
    ['/tutor/dashboard', 'tutors/index.html'],
    ['/admin', 'admin/index.html'],
    ['/learning-paths', 'pages/learning-paths.html'],
    ['/certifications', 'pages/certifications.html'],
    ['/corporate-training', 'pages/corporate-training.html'],
    ['/about', 'pages/about.html'],
    ['/careers', 'pages/careers.html'],
    ['/mentors', 'mentors/index.html'],
    ['/blog', 'blog/index.html'],
    ['/courses/recommendations', 'pages/course-recommendations.html'],
    ['/contact', 'pages/contact.html'],
    ['/privacy', 'pages/privacy.html'],
    ['/terms', 'pages/terms.html'],
    ['/cookie-settings', 'pages/cookie-settings.html'],
    ['/support', 'pages/support.html'],
    ['/community', 'pages/community.html'],
    ['/discussions', 'pages/discussions.html'],
    ['/messages', 'pages/messages.html'],
    ['/students/chat', 'students/chat.html'],
    ['/tutor/chat', 'tutors/chat.html'],
    ['/admin/chat', 'admin/chat.html'],
    ['/progress', 'students/pages/progress.html'],
    ['/settings', 'students/pages/settings.html'],
    ['/notes', 'students/pages/notes.html'],
    ['/tutor/settings', 'tutors/pages/settings.html'],
    ['/admin/courses', 'admin/pages/courses.html'],
    ['/admin/enrollments', 'admin/pages/enrollments.html'],
    ['/admin/settings', 'admin/pages/settings.html'],
    ['/groups', 'pages/groups.html'],
    ['/admin/audit', 'admin/pages/audit.html'],
    ['/admin/financials', 'admin/pages/financials.html'],
    ['/admin/reports', 'admin/pages/reports.html'],
    ['/admin/support', 'admin/pages/support.html'],
    ['/admin/emails', 'admin/pages/emails.html'],
    ['/tutor/mentorship', 'tutors/pages/mentorship.html'],
    ['/tutor/office-hours', 'tutors/pages/office-hours.html'],
    ['/admin/warnings', 'admin/pages/warnings.html'],
    ['/admin/system', 'admin/pages/system.html'],
    ['/admin/profile', 'admin/profile.html'],
    ['/superadmin', 'superadmin/index.html'],
    ['/superadmin/dashboard', 'superadmin/dashboard.html'],
    ['/superadmin/plans', 'superadmin/pages/plans.html'],
    ['/superadmin/users', 'superadmin/pages/users.html'],
    ['/superadmin/courses', 'superadmin/pages/courses.html'],
    ['/superadmin/enrollments', 'superadmin/pages/enrollments.html'],
    ['/superadmin/settings', 'superadmin/pages/settings.html'],
    ['/superadmin/profile', 'superadmin/profile.html'],
    ['/students/bookmarks', 'students/pages/bookmarks.html'],
    ['/students/wishlist', 'students/pages/wishlist.html'],
    ['/students/progress', 'students/pages/progress.html'],
    ['/students/settings', 'students/pages/settings.html'],
    ['/students/certificates', 'students/pages/certificates.html'],
    ['/students/notes', 'students/pages/notes.html'],
    ['/students/office-hours', 'students/pages/office-hours.html'],
    ['/students/mentorship', 'students/pages/mentorship.html'],
    ['/students/leaderboard', 'students/pages/leaderboard.html'],
    ['/students/communities', 'students/pages/communities.html'],
    ['/students/groups', 'students/pages/groups.html'],
    ['/students/warnings', 'students/pages/warnings.html'],
    ['/students/achievements', 'students/pages/achievements.html'],
    ['/students/grades', 'students/pages/grades.html'],
    ['/students/support', 'students/pages/support.html'],
    ['/students/timeline', 'students/pages/timeline.html'],
    ['/students/followers', 'students/pages/follower.html'],
    ['/students/projects', 'students/pages/project.html'],
    ['/students/activities', 'students/pages/activities.html'],
    ['/tutor/communities', 'tutors/pages/communities.html'],
    ['/tutor/groups', 'tutors/pages/groups.html'],
    ['/tutor/earnings', 'tutors/pages/earnings.html'],
    ['/tutor/students', 'tutors/pages/students.html'],
    ['/tutor/analytics', 'tutors/pages/analytics.html'],
    ['/tutor/calendar', 'tutors/pages/calendar.html'],
    ['/tutor/submissions', 'tutors/pages/submissions.html'],
    ['/tutor/projects', 'tutors/pages/project.html'],
    ['/tutor/tasks', 'tutors/pages/task.html'],
    ['/tutor/followers', 'tutors/pages/follower.html'],
    ['/tutor/timeline', 'tutors/pages/timeline.html'],
    ['/tutor/activities', 'tutors/pages/activities.html'],
    ['/tutor/profile', 'tutors/pages/profile.html'],
    ['/mentors/manage', 'mentors/manage.html'],
    ['/admin/timeline', 'admin/pages/timeline.html'],
    ['/admin/activities', 'admin/pages/activities.html'],
    ['/superadmin/analytics', 'superadmin/pages/analytics.html'],
    ['/superadmin/timeline', 'superadmin/pages/timeline.html'],
    ['/superadmin/activities', 'superadmin/pages/activities.html'],
    ['/search', 'pages/search.html'],
    ['/certificate/verify', 'pages/certificate-verify.html'],
    ['/settings/notifications', 'pages/notification-preferences.html'],
    ['/settings/account', 'pages/account-settings.html'],
    ['/reviews', 'pages/course-reviews.html'],
    ['/mobile-app', 'pages/mobile-app.html'],
    ['/tutor/courses/create', 'pages/workspace.html'],
    ['/admin/emails/templates', 'pages/workspace.html'],
    ['/admin/system/logs', 'pages/workspace.html'],
    ['/mentorship/applications', 'pages/workspace.html'],
    ['/billing/history', 'pages/workspace.html'],
    ['/billing/payment-methods', 'pages/workspace.html'],
    ['/admin/reports/export', 'pages/workspace.html'],
    ['/students/study-planner', 'pages/workspace.html'],
    ['/admin/compliance', 'pages/workspace.html'],
    ['/tutor/course-insights', 'pages/workspace.html'],
    ['/privacy/manage', 'pages/workspace.html'],
    ['/terms/manage', 'pages/workspace.html'],
    ['/maintenance', 'pages/maintenance.html'],
    ['/401', 'pages/401.html'],
    ['/403', 'pages/403.html'],
    ['/500', 'pages/500.html'],
    ['/offline', 'pages/offline.html'],
  ] as const;

  for (const [route, file] of pages) {
    app.get(route, async (_req, reply) => reply.sendFile(file));
  }

  app.get('/blog/:slug', async (_req, reply) => reply.sendFile('blog/details.html'));
  app.get('/notes/:id', async (_req, reply) => reply.sendFile('students/pages/notes-details.html'));
  app.get('/tutor/detail', async (_req, reply) => reply.sendFile('tutors/profile.html'));
  app.get('/lessons/:id', async (_req, reply) => reply.sendFile('lessons/viewer.html'));
  app.get('/tutor/courses/builder/:id', async (_req, reply) => reply.sendFile('tutors/courses/builder.html'));
  app.get('/u/:id', async (_req, reply) => reply.sendFile('pages/u-profile.html'));
  app.get('/checkout', async (_req, reply) => reply.sendFile('courses/checkout.html'));
  app.get('/checkout/success', async (_req, reply) => reply.sendFile('courses/checkout-success.html'));
  app.get('/checkout/cancel', async (_req, reply) => reply.sendFile('courses/checkout-cancel.html'));

  app.get('/assignments/:id/student', async (_req, reply) => reply.sendFile('students/assignment.html'));
  app.get('/assignments/:id/student/submit', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/gradebook/:studentId', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/tutor/earnings/:period', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/learning-paths/:id', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/certifications/:id', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/corporate-training/:id', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/certificate/download/:certId', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/certificates/download/:certId/page', async (_req, reply) => reply.sendFile('pages/workspace.html'));
  app.get('/tutor/assignments', async (_req, reply) => reply.sendFile('tutors/assignments/index.html'));
  app.get('/tutor/assignments/:id/details', async (_req, reply) => reply.sendFile('tutors/assignments/details.html'));
  app.get('/tutor/assignments/:id/submission', async (_req, reply) => reply.sendFile('tutors/assignments/submission.html'));
  app.get('/tutor/assignments/:id/review', async (_req, reply) => reply.sendFile('tutors/assignments/review.html'));
  app.get('/tutor/assignments/builder/:id', async (_req, reply) => reply.sendFile('tutors/assignment/builder.html'));
  app.get('/tutor/assignments/builder/:id/step/:step', async (_req, reply) => reply.sendFile('tutors/assignment/builder.html'));

  const profilePageMap: Record<string, string> = {
    learner: 'students/profile/index.html',
    tutor: 'tutors/profile.html',
    admin: 'admin/profile.html',
    super_admin: 'superadmin/profile.html',
  };
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.get('/profile/me', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.redirect('/login');
      }
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] });
      const { User } = await import('./models');
      const user = await User.findByPk(decoded.sub, { attributes: ['role'] });
      if (!user) return reply.redirect('/login');
      return reply.sendFile(profilePageMap[user.role] || 'pages/profile.html');
    } catch {
      return reply.redirect('/login');
    }
  });

  app.get('/profile/setup', async (_req, reply) => reply.sendFile('students/profile/setup.html'));

  app.get('/courses/catalog', async (_req, reply) => reply.sendFile('students/courses/catalog.html'));
  app.get('/courses/:id/details', async (_req, reply) => reply.sendFile('students/courses/details.html'));

  app.get('/course/:id', async (_req, reply) => reply.sendFile('courses/course-details.html'));

  app.get('/profile/:id', async (request, reply) => {
    try {
      const id = (request.params as { id: string }).id;
      if (!UUID_REGEX.test(id)) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      const { User } = await import('./models');
      const user = await User.findByPk(id, { attributes: ['role'] });
      if (!user) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return reply.sendFile(profilePageMap[user.role] || 'pages/profile.html');
    } catch {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
    }
  });

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(adminRoutes, { prefix: '/admin' });
  await app.register(dashboardRoutes, { prefix: '/dashboard' });
  await app.register(courseRoutes, { prefix: '/courses' });
  await app.register(enrollmentRoutes, { prefix: '/enrollments' });
  await app.register(tutorRoutes, { prefix: '/tutors' });
  await app.register(lessonRoutes, { prefix: '/lessons' });
  await app.register(assignmentRoutes, { prefix: '/assignments' });
  await app.register(progressRoutes, { prefix: '/progress' });
  await app.register(tutorDashboardRoutes, { prefix: '/tutor-dashboard' });
  await app.register(notificationRoutes, { prefix: '/notifications' });
  await app.register(certificateRoutes, { prefix: '/certificates' });
  await app.register(courseBuilderRoutes, { prefix: '/builder' });

  await app.register(adminDashboardRoutes, { prefix: '/admin/dashboard' });
  await app.register(adminFinancialsRoutes, { prefix: '/admin' });
  await app.register(adminUsersRoutes, { prefix: '/admin/users' });
  await app.register(adminSupportRoutes, { prefix: '/admin/support' });
  await app.register(adminInstructorsRoutes, { prefix: '/admin/instructors' });
  await app.register(tutorFinancialsRoutes, { prefix: '/tutor' });
  await app.register(tutorAssignmentBuilderRoutes, { prefix: '/tutor/assignments' });
  await app.register(uploadRoutes, { prefix: '/uploads' });
  await app.register(messageRoutes, { prefix: '/messages' });
  await app.register(supportRoutes, { prefix: '/support' });
  await app.register(mentorshipRoutes, { prefix: '/mentorship' });
  await app.register(billingRoutes, { prefix: '/billing' });
  await app.register(paymentRoutes, { prefix: '/payments' });
  await app.register(instructorRoutes, { prefix: '/instructor' });
  await app.register(instructorsPublicRoutes, { prefix: '/instructors' });
  await app.register(gradebookRoutes, { prefix: '/gradebook' });
  await app.register(submissionsRoutes, { prefix: '/submissions' });
  await app.register(discussionsRoutes, { prefix: '/discussions' });
  await app.register(contactRoutes, { prefix: '/api/contact' });
  await app.register(blogRoutes, { prefix: '/api/blog' });
  await app.register(careerRoutes, { prefix: '/api/careers' });
  await app.register(discussionGroupRoutes, { prefix: '/api/groups' });
  await app.register(followRoutes, { prefix: '/api/follow' });
  await app.register(publicRoutes, { prefix: '/public' });
  await app.register(adminReportsRoutes, { prefix: '/admin/reports' });
  await app.register(adminEmailRoutes, { prefix: '/admin/emails' });
  await app.register(webhookRoutes, { prefix: '/webhook' });
  await app.register(marketingRoutes, { prefix: '/marketing' });
  await app.register(wishlistRoutes, { prefix: '/wishlist' });
  await app.register(bookmarksRoutes, { prefix: '/bookmarks' });
  await app.register(portfolioRoutes, { prefix: '/portfolio' });
  await app.register(timelineRoutes, { prefix: '/timeline' });
  await app.register(activitiesRoutes, { prefix: '/activities' });
  await app.register(leaderboardRoutes, { prefix: '/leaderboard' });

  app.get('/favicon.ico', async (_req, reply) => {
    reply.redirect('/favicon.svg');
  });

  app.get('/api/health', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (_request, reply) => {
    const dbOk = await sequelize.authenticate().then(() => true).catch(() => false);
    return reply.status(dbOk ? 200 : 503).send({
      message: dbOk ? 'Service healthy' : 'Service degraded',
      data: {
        name: `${process.env.APP_NAME} API`,
        status: dbOk ? 'ok' : 'degraded',
        checks: { database: dbOk ? 'passed' : 'failed' },
      },
    });
  });

  app.get('/.well-known/security.txt', async (_req, reply) => {
    const lines: string[] = [`Contact: mailto:${process.env.SECURITY_CONTACT_EMAIL || 'security@your-domain.com'}`];
    if (process.env.SECURITY_CONTACT_URL) lines.push(`Contact: ${process.env.SECURITY_CONTACT_URL}`);
    if (process.env.SECURITY_POLICY_URL) lines.push(`Policy: ${process.env.SECURITY_POLICY_URL}`);
    if (process.env.SECURITY_ACK_URL) lines.push(`Acknowledgments: ${process.env.SECURITY_ACK_URL}`);
    if (process.env.SECURITY_EXPIRES) lines.push(`Expires: ${process.env.SECURITY_EXPIRES}`);
    reply.type('text/plain').send(`${lines.join('\n')}\n`);
  });

  app.setNotFoundHandler((req, reply) => {
    const accept = String(req.headers.accept || '');
    if (accept.includes('text/html')) {
      return reply.status(404).sendFile('pages/404.html');
    }
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.setErrorHandler((err, req, reply) => {
    app.log.error(err);
    if (reply.raw.headersSent) return;
    const status = err instanceof AppError && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;
    const accept = String(req.headers.accept || '');
    if (accept.includes('text/html')) {
      if (status === 401) return reply.status(401).sendFile('pages/401.html');
      if (status === 403) return reply.status(403).sendFile('pages/403.html');
      if (status >= 500) return reply.status(status).sendFile('pages/500.html');
    }
    reply.status(status).send({
      error: {
        code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  return app;
}

function parseBodyLimit(value: string): number {
  const normalized = String(value || '').trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(b|kb|mb)?$/);
  if (!match) return 1024 * 1024;
  const amount = Number(match[1]);
  const unit = match[2] || 'b';
  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
  };
  return Math.floor(amount * multipliers[unit]);
}
