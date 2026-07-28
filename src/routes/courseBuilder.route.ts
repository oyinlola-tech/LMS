import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { createCourse, listCourses, getCourse, updateCourse, uploadCover, createModule, updateModule, deleteModule, reorderModules, createLesson, updateLesson, deleteLesson, reorderLessons, addLessonContent, uploadMedia, uploadResource, setLessonMediaUrl, createAssignment, updateAssignment, deleteAssignment, publishCourse, unpublishCourse, createQuiz, createCoupon, getCoursePreview, applyCoupon, getEnrollmentPreview } from '../controllers/courseBuilder.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createCourse);

  fastify.get('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listCourses);

  fastify.get('/courses/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourse);

  fastify.put('/courses/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateCourse);

  fastify.post('/courses/:id/cover', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadCover);

  fastify.post('/courses/:id/modules', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createModule);

  fastify.put('/modules/:moduleId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateModule);

  fastify.delete('/modules/:moduleId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteModule);

  fastify.put('/courses/:id/modules/reorder', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, reorderModules);

  fastify.post('/modules/:moduleId/lessons', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createLesson);

  fastify.put('/lessons/:lessonId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateLesson);

  fastify.delete('/lessons/:lessonId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteLesson);

  fastify.put('/modules/:moduleId/lessons/reorder', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, reorderLessons);

  fastify.post('/lessons/:lessonId/content', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addLessonContent);

  fastify.post('/lessons/:lessonId/media', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadMedia);

  fastify.post('/lessons/:lessonId/resources', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadResource);

  fastify.put('/lessons/:lessonId/media-url', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, setLessonMediaUrl);

  fastify.post('/courses/:id/assignments', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createAssignment);

  fastify.put('/assignments/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateAssignment);

  fastify.delete('/assignments/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteAssignment);

  fastify.post('/courses/:id/publish', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, publishCourse);

  fastify.post('/courses/:id/unpublish', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, unpublishCourse);

  fastify.post('/lessons/:lessonId/quiz', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createQuiz);

  fastify.post('/courses/:id/coupons', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createCoupon);

  fastify.get('/courses/:id/preview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCoursePreview);

  fastify.post('/courses/:id/apply-coupon', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, applyCoupon);

  fastify.post('/courses/:id/enrollment-preview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, getEnrollmentPreview);
}