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
import fastifyCookie from '@fastify/cookie';
import authPlugin from './plugins/auth.plugin';
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

export async function buildApp() {
  const jsonLimit = process.env.JSON_BODY_LIMIT || '1mb';
  const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS) || 30000;
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 200;
  const rawUploadDir = (process.env.UPLOAD_DIR || '').trim();
  if (!rawUploadDir) throw new Error('UPLOAD_DIR must be set to a non-empty directory path.');
  const resolvedUploadDir = path.resolve(rawUploadDir);
  const projectRoot = path.resolve(__dirname, '..');
  if (resolvedUploadDir === path.parse(resolvedUploadDir).root) throw new Error('UPLOAD_DIR must not be the filesystem root directory.');
  if (!resolvedUploadDir.startsWith(projectRoot + path.sep)) throw new Error('UPLOAD_DIR must be within the project directory.');
  const uploadDir = resolvedUploadDir;
  fs.mkdirSync(uploadDir, { recursive: true });

  const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(v => v.trim()).filter(Boolean);
  if (!corsOrigins.length) throw new Error('CORS_ORIGIN must be set to a comma-separated list of allowed origins');
  const corsCredentials = String(process.env.CORS_ALLOW_CREDENTIALS || 'false') === 'true';

  const app = Fastify({
    logger: false,
    requestTimeout: requestTimeoutMs,
    bodyLimit: 1048576,
  });

  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: (process.env.CROSS_ORIGIN_RESOURCE_POLICY || 'cross-origin') as 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  });

  await app.register(fastifyCors, {
    origin: corsOrigins,
    credentials: corsCredentials,
  });

  await app.register(fastifyFormbody);
  await app.register(fastifyCookie);
  await app.register(fastifyMultipart);

  await app.register(fastifyRateLimit, {
    max: rateLimitMax,
    timeWindow: rateLimitWindowMs,
  });

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
    ['/', 'index.html'],
    ['/login', 'auth/login.html'],
    ['/register', 'auth/register.html'],
    ['/verify-otp', 'auth/verify-otp.html'],
    ['/forgot-password', 'auth/forgot-password.html'],
    ['/change-password', 'auth/change-password.html'],
    ['/dashboard', 'students/index.html'],
    ['/tutor', 'tutors/index.html'],
    ['/admin', 'admin/index.html'],
    ['/courses', 'pages/courses.html'],
    ['/learning-paths', 'pages/learning-paths.html'],
    ['/certifications', 'pages/certifications.html'],
    ['/corporate-training', 'pages/corporate-training.html'],
    ['/about', 'pages/about.html'],
    ['/careers', 'pages/careers.html'],
    ['/blog', 'pages/blog.html'],
    ['/courses/recommendations', 'pages/course-recommendations.html'],
    ['/contact', 'pages/contact.html'],
    ['/privacy', 'pages/privacy.html'],
    ['/terms', 'pages/terms.html'],
    ['/cookie-settings', 'pages/cookie-settings.html'],
    ['/support', 'pages/support.html'],
    ['/community', 'pages/community.html'],
    ['/discussions', 'pages/discussions.html'],
    ['/messages', 'pages/messages.html'],
  ] as const;

  for (const [route, file] of pages) {
    app.get(route, async (_req, reply) => reply.sendFile(file));
  }

  app.get('/blog/:slug', async (_req, reply) => reply.sendFile('pages/blog-details.html'));

  app.get('/assignments/:id/student', async (_req, reply) => reply.sendFile('students/assignment.html'));
  app.get('/tutor/assignments', async (_req, reply) => reply.sendFile('tutors/assignments/index.html'));
  app.get('/tutor/assignments/:id/details', async (_req, reply) => reply.sendFile('tutors/assignments/details.html'));
  app.get('/tutor/assignments/:id/submission', async (_req, reply) => reply.sendFile('tutors/assignments/submission.html'));
  app.get('/tutor/assignments/:id/review', async (_req, reply) => reply.sendFile('tutors/assignments/review.html'));
  app.get('/tutor/assignments/builder/:id', async (_req, reply) => reply.sendFile('tutors/assignment/builder.html'));
  app.get('/tutor/assignments/builder/:id/step/:step', async (_req, reply) => reply.sendFile('tutors/assignment/builder.html'));

  app.get('/profile/setup', async (_req, reply) => reply.sendFile('students/profile/setup.html'));

  app.get('/courses/catalog', async (_req, reply) => reply.sendFile('students/courses/catalog.html'));
  app.get('/courses/:id/details', async (_req, reply) => reply.sendFile('students/courses/details.html'));

  app.get('/course/:id', async (_req, reply) => reply.sendFile('courses/course-details.html'));

  const profilePageMap: Record<string, string> = {
    learner: 'students/profile/index.html',
    tutor: 'tutors/profile.html',
    admin: 'admin/profile.html',
    super_admin: 'superadmin/profile.html',
  };
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.get('/profile/:id', async (request, reply) => {
    try {
      const id = (request.params as { id: string }).id;
      if (!UUID_REGEX.test(id)) return reply.sendFile('pages/profile.html');
      const { User } = await import('./models');
      const user = await User.findByPk(id, { attributes: ['role'] });
      return reply.sendFile(profilePageMap[user?.role || 'learner'] || 'pages/profile.html');
    } catch {
      return reply.sendFile('pages/profile.html');
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

  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Route not found', details: null } });
  });

  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err);
    if (reply.raw.headersSent) return;
    const status = err instanceof AppError && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;
    reply.status(status).send({
      error: {
        code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: null,
      },
    });
  });

  return app;
}
